# Updating the Vinyl Collection

Complete guide for updating records, fetching covers, and syncing across all systems.

## Architecture

```
vinyl-collection-data/          # Source of truth for record data
    vinyl.json                  #   (GitHub: gueridon/vinyl-collection-data)

oftenback.github.io/            # Website + covers
    vinyl.json                  #   (GitHub: gueridon/oftenback.github.io)
    vinyl-collection-ui/
        covers/*.jpg            # Album cover images
        fetch-covers.js         # Discogs cover fetcher

home-projects/vinyl-collection/vinyl-qr-display/
    raspberry-pi/
        vinyl-export.json       # Pi's copy of the data
        public/covers/*.jpg     # Pi's copy of the covers
        sync-to-pi.sh           # Deployment script
```

**Raspberry Pi**: 192.168.1.224 (static IP), password: vinyl123

## Quick Reference (Copy-Paste)

For when you just need the commands:

```bash
# 1. Pull latest data
cd ~/vinyl-collection-data && git pull

# 2. Copy to website repo
cp ~/vinyl-collection-data/vinyl.json ~/oftenback.github.io/vinyl.json

# 3. Fetch covers
cd ~/oftenback.github.io/vinyl-collection-ui && node fetch-covers.js ../vinyl.json

# 4. Update vinyl.json with cover paths
cp ~/oftenback.github.io/vinyl-with-covers.json ~/oftenback.github.io/vinyl.json

# 5. Sync cover paths back to data repo
cp ~/oftenback.github.io/vinyl.json ~/vinyl-collection-data/vinyl.json

# 6. Commit and push website
cd ~/oftenback.github.io
git add vinyl-collection-ui/covers/*.jpg vinyl.json
git commit -m "Add new album covers from Discogs"
git push

# 7. Commit and push data repo
cd ~/vinyl-collection-data
git add vinyl.json
git commit -m "Update cover paths"
git push

# 8. Update QR display on Pi
cp ~/oftenback.github.io/vinyl.json ~/home-projects/vinyl-collection/vinyl-qr-display/raspberry-pi/vinyl-export.json
cp ~/oftenback.github.io/vinyl-collection-ui/covers/*.jpg ~/home-projects/vinyl-collection/vinyl-qr-display/raspberry-pi/public/covers/
cd ~/home-projects/vinyl-collection/vinyl-qr-display/raspberry-pi && ./sync-to-pi.sh

# 9. Verify on live site
# Clear browser data, hard refresh, then "Pull from Remote"
```

## Detailed Steps

### 1. Update Records

Add/edit records via the web UI at https://oftenback.io/vinyl-collection-ui/index.html, then push to remote. The data repo (`vinyl-collection-data`) is the source of truth.

### 2. Pull Latest Data

```bash
cd ~/vinyl-collection-data
git pull
```

Check the current state:
```bash
python3 -c "
import json
data = json.load(open('vinyl.json'))
missing = [r for r in data if not r.get('coverImage')]
print(f'Total: {len(data)}, Without covers: {len(missing)}')
"
```

### 3. Copy Data to Website Repo

```bash
cp ~/vinyl-collection-data/vinyl.json ~/oftenback.github.io/vinyl.json
```

### 4. Fetch Missing Covers from Discogs

```bash
cd ~/oftenback.github.io/vinyl-collection-ui
node fetch-covers.js ../vinyl.json
```

This searches Discogs for each record missing a cover, downloads images to `covers/`, and outputs `vinyl-with-covers.json`. Takes ~1 second per record (rate limited).

**Note**: Duplicates ("copy 2"), multi-disc entries, and obscure titles typically won't find covers. See UPDATING-COVERS.md for troubleshooting.

### 5. Update vinyl.json with Cover Paths

```bash
cp ~/oftenback.github.io/vinyl-with-covers.json ~/oftenback.github.io/vinyl.json
```

### 6. Sync Cover Paths Back to Data Repo

This is critical — without it, "Pull from Remote" in the UI will overwrite the new cover paths.

```bash
cp ~/oftenback.github.io/vinyl.json ~/vinyl-collection-data/vinyl.json
```

### 7. Commit and Push Both Repos

**Website repo** (covers + data):
```bash
cd ~/oftenback.github.io
git add vinyl-collection-ui/covers/*.jpg vinyl.json
git commit -m "Add new album covers from Discogs"
git push
```

**Data repo** (cover paths):
```bash
cd ~/vinyl-collection-data
git add vinyl.json
git commit -m "Update cover paths"
git push
```

### 8. Update QR Display on Raspberry Pi

Copy updated data and covers locally:
```bash
cp ~/oftenback.github.io/vinyl.json \
   ~/home-projects/vinyl-collection/vinyl-qr-display/raspberry-pi/vinyl-export.json

cp ~/oftenback.github.io/vinyl-collection-ui/covers/*.jpg \
   ~/home-projects/vinyl-collection/vinyl-qr-display/raspberry-pi/public/covers/
```

Deploy to the Pi:
```bash
cd ~/home-projects/vinyl-collection/vinyl-qr-display/raspberry-pi
./sync-to-pi.sh
```

Or manually with sshpass (no interactive prompts):
```bash
PI=192.168.1.224
sshpass -p 'vinyl123' scp vinyl-export.json nbacuez@$PI:~/vinyl-qr-display/raspberry-pi/
sshpass -p 'vinyl123' scp -r public/covers/ nbacuez@$PI:~/vinyl-qr-display/raspberry-pi/public/
sshpass -p 'vinyl123' ssh nbacuez@$PI "sudo systemctl restart vinyl-display.service"
```

### 9. Verify on Live Site

GitHub Pages takes a few minutes to rebuild. Then:

1. Open https://oftenback.io/vinyl-collection-ui/index.html
2. DevTools (F12) → Application → Storage → Clear site data
3. Hard refresh (Ctrl + Shift + R)
4. Click "Pull from Remote"

## Troubleshooting

### Git push/pull fails with "No such device or address"
The HTTPS remotes need a token embedded in the URL. Check with `git remote -v`. Token is in `~/Documents/github token.txt`. Fix with:
```bash
git remote set-url origin https://gueridon:<TOKEN>@github.com/gueridon/<REPO>.git
```

### Pi unreachable at 192.168.1.224
The Pi may have lost its static IP. Scan for it:
```bash
nmap -sn 192.168.1.0/24 | grep -B2 raspberry
```
Then re-set static IP via SSH:
```bash
sudo nmcli connection modify 'Chez Henry' ipv4.method manual \
  ipv4.addresses 192.168.1.224/24 ipv4.gateway 192.168.1.254 \
  ipv4.dns 192.168.1.254
sudo nmcli connection up 'Chez Henry'
```

### Covers not showing on live site after push
See the detailed troubleshooting section in UPDATING-COVERS.md. Usually: clear browser storage + Pull from Remote.

### "Pull from Remote" overwrites cover paths
The data repo didn't have updated cover paths. Re-run step 6 (sync back to data repo) and push.
