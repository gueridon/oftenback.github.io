# Updating Vinyl Album Covers

This guide explains how to fetch and add album covers for your vinyl records using the Discogs API.

## Prerequisites

- Node.js installed
- Discogs API token (already configured in `fetch-covers.js`)
- Your vinyl collection data exported as JSON

## Process Overview

1. Start a local web server
2. Export current vinyl data from the UI
3. Run the cover fetching script
4. Import updated data back to the UI
5. Commit and push changes to GitHub

## Detailed Steps

### 1. Start Local Web Server

```bash
cd ~/gueridon/oftenback.github.io/vinyl-collection-ui
python3 -m http.server 8000
```

Access the UI at: http://localhost:8000/index.html

### 2. Export Current Data

In the web UI:
1. If you've added records through the UI, make sure they're saved to localStorage
2. If records are stored on GitHub, click "Pull from Remote" to sync
3. Click the "Export JSON" button
4. Save the file as `vinyl-export.json` in the parent directory (`~/gueridon/oftenback.github.io/`)

### 3. Run Cover Fetching Script

```bash
cd ~/gueridon/oftenback.github.io/vinyl-collection-ui
node fetch-covers.js ../vinyl-export.json
```

**What this does:**
- Searches Discogs for each record that has a barcode but no cover
- Downloads missing album covers to the `covers/` folder
- Saves covers as `{barcode}.jpg`
- Respects Discogs API rate limits (~1 request per second)
- Creates a new file `vinyl-export-with-covers.json` with updated cover paths

**Expected output:**
```
═══════════════════════════════════════════════════
  Discogs Album Cover Fetcher
═══════════════════════════════════════════════════

Reading records from: ../vinyl-export.json
Found 360 records

99 records need covers

Starting download... (Rate limit: ~1 request/second)

[1/99] Artist Name - Album Title
  → Searching Discogs...
  → Found: Artist Name - Album Title
  → Downloading...
  ✓ Saved: covers/VNL-XXXXX.jpg
```

### 4. Import Updated Data (Optional)

If you want to update the cover paths in your UI:
1. Go back to http://localhost:8000/index.html
2. Click "Import JSON"
3. Select `vinyl-export-with-covers.json`
4. This merges the cover paths into your collection

### 5. Commit and Push to GitHub

```bash
cd ~/gueridon/oftenback.github.io

# Check what's changed
git status

# Stage the new covers and updated data
git add vinyl-collection-ui/covers/*.jpg
git add vinyl-export.json vinyl-export-with-covers.json

# Commit with a descriptive message
git commit -m "Add new album covers from Discogs

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push
```

### 6. Verify on GitHub Pages

After pushing, GitHub Pages will rebuild your site (usually 1-2 minutes).
Visit https://oftenback.github.io/vinyl-collection-ui/ to see the new covers.

## Script Configuration

The `fetch-covers.js` script is configured with:

- **Discogs API Token**: Hardcoded in the script
- **Rate Limit**: 1.1 seconds between requests (safe for 60/min limit)
- **Covers Directory**: `./covers/` (relative to script location)
- **Output File**: Original filename with `-with-covers.json` suffix

## Troubleshooting

### No covers found for some records

Some records may not have covers available on Discogs:
- Duplicate copies (e.g., "Album Title (copy 2)")
- Rare or obscure releases
- Records with incorrect artist/title metadata

**Solution**: Manually search Discogs and add covers, or update the metadata.

### Rate limit errors

If you see rate limit errors:
- The script already includes delays (1.1 seconds)
- Wait a few minutes and try again
- Don't run multiple instances simultaneously

### Covers not showing in UI

Make sure:
- Covers are saved in `vinyl-collection-ui/covers/` directory
- File names match the barcode pattern: `VNL-XXXXX.jpg`
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
```bash
# 1. Open the live site
https://oftenback.io/vinyl-collection-ui/index.html

# 2. Open Browser DevTools (F12)
# 3. Go to: Application → Storage → Clear site data
# 4. Click "Clear site data" button

# 5. Hard refresh the page:
#    - Windows/Linux: Ctrl + Shift + R
#    - Mac: Cmd + Shift + R

# 6. Import the updated JSON:
#    - Click "Import JSON" button
#    - Select: ~/gueridon/oftenback.github.io/vinyl.json
#    - This loads all 360 records with 341 cover paths into localStorage

# 7. Refresh the page
#    All covers should now display!
```

**Solution 2: Use GitHub Sync Feature**

If you have GitHub sync configured:
```bash
# 1. Open https://oftenback.io/vinyl-collection-ui/index.html

# 2. Configure GitHub settings (if not already done):
#    - Owner: gueridon (or your GitHub username)
#    - Repo: oftenback.github.io
#    - Token: [Your GitHub Personal Access Token]
#    - Click "Save Settings"

# 3. Click "Pull from Remote"
#    This fetches vinyl.json from GitHub and merges with localStorage

# 4. Refresh the page
#    Covers should appear
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
cd ~/gueridon/oftenback.github.io/vinyl-collection-ui
python3 -m http.server 8000

# Open: http://localhost:8000/index.html
# Click "Import JSON"
# Select: ~/gueridon/oftenback.github.io/vinyl.json

# If covers show locally but not remotely:
# - It's a caching issue (use Solution 1)
# - GitHub Pages is still building (use Solution 3)
```

**Verification Steps:**

After applying any solution, verify:

1. **Check record count:**
   - Open the UI
   - Look at table - should show 360 records

2. **Check a new cover loads:**
   - Open: `https://oftenback.io/vinyl-collection-ui/covers/VNL-2PY3S7.jpg`
   - Should display album cover image
   - If 404: GitHub Pages hasn't rebuilt yet (wait 5 minutes)

3. **Check JSON file:**
   - Open: `https://oftenback.io/vinyl.json`
   - Should show 360 records
   - If shows 1,020 or different number: Old cached version (wait or hard refresh)

4. **Check localStorage:**
   - Open DevTools → Application → Local Storage
   - Find `vinyl_records_v1`
   - Should contain 360 records with coverImage paths

**Prevention:**

To avoid this issue in the future:
1. Always commit both JSON files and covers together
2. Wait 10 minutes after pushing before checking live site
3. Use "Import JSON" feature to force data refresh
4. Consider using the GitHub sync feature for automatic updates

## Files and Directories

```
oftenback.github.io/
├── vinyl-export.json              # Main data export
├── vinyl-export-with-covers.json  # Export with cover paths
└── vinyl-collection-ui/
    ├── covers/                    # Album cover images
    │   ├── VNL-XXXXX.jpg
    │   └── ...
    ├── fetch-covers.js            # Cover fetching script
    ├── discogs.js                 # Discogs API module (browser)
    └── index.html                 # Main UI
```

## Notes

- The script automatically skips records that already have covers
- Barcodes are required for cover fetching (auto-generated format: `VNL-XXXXXX`)
- Covers are saved as JPG files
- The script respects Discogs API terms of service with rate limiting
