# Updating Vinyl Album Covers

This guide explains how to fetch and add album covers for your vinyl records using the Discogs API.

## Prerequisites

- Node.js installed
- Discogs API token (already configured in `fetch-covers.js`)
- Collection data up to date in `~/vinyl-collection-data/`

## Process Overview

1. Pull latest data from `vinyl-collection-data` repo
2. Copy `vinyl.json` to the website repo
3. Run the cover fetching script
4. Copy updated JSON back as the main `vinyl.json`
5. Sync cover paths back to the data repo
6. Commit and push changes to GitHub

## Detailed Steps

### 1. Pull Latest Collection Data

The vinyl record database lives in a separate repo:

```bash
cd ~/vinyl-collection-data
git pull
```

### 2. Copy Data to Website Repo

```bash
cp ~/vinyl-collection-data/vinyl.json ~/oftenback.github.io/vinyl.json
```

### 3. Run Cover Fetching Script

```bash
cd ~/oftenback.github.io/vinyl-collection-ui
node fetch-covers.js ../vinyl.json
```

**What this does:**
- Searches Discogs for each record that has a barcode but no cover
- Downloads missing album covers to the `covers/` folder
- Saves covers as `{barcode}.jpg`
- Respects Discogs API rate limits (~1 request per second)
- Creates `../vinyl-with-covers.json` with updated cover paths

**Expected output:**
```
═══════════════════════════════════════════════════
  Discogs Album Cover Fetcher
═══════════════════════════════════════════════════

Reading records from: ../vinyl.json
Found 476 records

135 records need covers

Starting download... (Rate limit: ~1 request/second)

[1/135] Artist Name - Album Title
  → Searching Discogs...
  → Found: Artist Name - Album Title
  → Downloading...
  ✓ Saved: covers/VNL-XXXXX.jpg
```

### 4. Update vinyl.json with Cover Paths

The script outputs `vinyl-with-covers.json` — copy it over the main file:

```bash
cp ~/oftenback.github.io/vinyl-with-covers.json ~/oftenback.github.io/vinyl.json
```

### 5. Sync Cover Paths Back to Data Repo

The data repo (`vinyl-collection-data`) is what the UI pulls from via "Pull from Remote".
It needs the updated cover paths too, otherwise a pull will overwrite them.

```bash
cp ~/oftenback.github.io/vinyl.json ~/vinyl-collection-data/vinyl.json
cd ~/vinyl-collection-data
git add vinyl.json
git commit -m "Update cover paths for new album covers"
git push
```

### 6. Commit and Push Website to GitHub

```bash
cd ~/oftenback.github.io

# Check what's changed
git status

# Stage the new covers and updated data
git add vinyl-collection-ui/covers/*.jpg
git add vinyl.json

# Commit
git commit -m "Add new album covers from Discogs"

# Push to GitHub
git push
```

### 7. Verify on GitHub Pages

After pushing, GitHub Pages will rebuild your site (usually 1-2 minutes).
Visit https://oftenback.github.io/vinyl-collection-ui/ to see the new covers.

## Script Configuration

The `fetch-covers.js` script is configured with:

- **Discogs API Token**: Hardcoded in the script
- **Rate Limit**: 1.1 seconds between requests (safe for 60/min limit)
- **Covers Directory**: `./covers/` (relative to script location)
- **Output File**: Original filename with `-with-covers` suffix (e.g., `vinyl.json` → `vinyl-with-covers.json`)

## Troubleshooting

### No covers found for some records

Some records may not have covers available on Discogs:
- Duplicate copies (e.g., "Album Title (copy 2)")
- Rare or obscure releases
- Records with incorrect artist/title metadata
- Multi-disc entries or singles with unusual naming

**Solution**: Manually search Discogs and add covers, or update the metadata.

### Rate limit errors

If you see rate limit errors:
- The script already includes delays (1.1 seconds)
- Wait a few minutes and try again
- Don't run multiple instances simultaneously

### Covers not showing in UI

Make sure:
- Covers are saved in `vinyl-collection-ui/covers/` directory
- File names match the barcode pattern: `VNL-XXXXXX.jpg`
- You've imported the updated JSON with cover paths
- The web server can access the covers directory

### Covers not showing on GitHub Pages (oftenback.io)

After pushing new covers and updated JSON to GitHub, the covers may not appear immediately on the live site. This is due to **GitHub Pages caching** and **browser caching**.

**Symptoms:**
- Covers uploaded and visible in GitHub repository
- Individual cover URLs work (e.g., `https://oftenback.io/vinyl-collection-ui/covers/VNL-XXXXX.jpg`)
- But covers don't show in the UI at `https://oftenback.io/vinyl-collection-ui/index.html`
- Old record count showing instead of new count

**Root Cause:**
1. GitHub Pages takes 5-10 minutes to rebuild after a push
2. The UI loads data from browser localStorage (old cached data)
3. The `vinyl.json` file may be cached by CDN
4. Browser caches both the page and the JSON files

**Solution 1: Clear Browser Cache and Import Data (Fastest)**
```
1. Open https://oftenback.io/vinyl-collection-ui/index.html
2. Open Browser DevTools (F12)
3. Go to: Application → Storage → Clear site data
4. Hard refresh: Ctrl + Shift + R
5. Click "Import JSON" and select ~/oftenback.github.io/vinyl.json
6. Refresh the page — all covers should now display
```

**Solution 2: Use GitHub Sync Feature**

If you have GitHub sync configured:
```
1. Open https://oftenback.io/vinyl-collection-ui/index.html
2. Configure GitHub settings (if not already done):
   - Owner: gueridon
   - Repo: oftenback.github.io
   - Token: [Your GitHub Personal Access Token]
   - Click "Save Settings"
3. Click "Pull from Remote"
4. Refresh the page
```

**Solution 3: Wait for GitHub Pages to Rebuild**

Sometimes you just need to wait:
- GitHub Pages typically rebuilds in 5-10 minutes
- Check deployment status: https://github.com/gueridon/oftenback.github.io/deployments
- Once deployed, do a hard refresh (Ctrl+Shift+R)
- Clear localStorage and import fresh data

**Solution 4: Test Locally First**

Before troubleshooting the live site, verify everything works locally:
```bash
cd ~/oftenback.github.io/vinyl-collection-ui
python3 -m http.server 8000

# Open: http://localhost:8000/index.html
# Click "Import JSON"
# Select: ~/oftenback.github.io/vinyl.json
# If covers show locally but not remotely → caching issue
```

**Prevention:**

To avoid this issue in the future:
1. Always commit both JSON files and covers together
2. Wait 10 minutes after pushing before checking live site
3. Use "Import JSON" feature to force data refresh

## Files and Directories

```
~/vinyl-collection-data/
└── vinyl.json                     # Source of truth for record data

~/oftenback.github.io/
├── vinyl.json                     # Copy used by website + fetch script
├── vinyl-with-covers.json         # Output of fetch script (intermediate)
└── vinyl-collection-ui/
    ├── covers/                    # Album cover images
    │   ├── VNL-XXXXXX.jpg
    │   └── ...
    ├── fetch-covers.js            # Cover fetching script (Node.js)
    ├── discogs.js                 # Discogs API module (browser)
    └── index.html                 # Main UI
```

## Notes

- The script automatically skips records that already have covers
- Barcodes are required for cover fetching (auto-generated format: `VNL-XXXXXX`)
- Covers are saved as JPG files
- The script respects Discogs API terms of service with rate limiting
- "(copy 2)" duplicates and multi-disc entries typically won't find covers on Discogs
