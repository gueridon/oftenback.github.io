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
