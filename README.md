# Vinyl Collection Manager

A web-based vinyl record collection manager with GitHub sync capabilities.

## Running Locally

The vinyl collection UI requires a web server to function properly. Opening `index.html` directly with `file://` protocol will prevent GitHub API calls from working due to browser security restrictions.

### Start Local Server

From the project root directory, run:

```bash
python3 -m http.server 8000
```

Then open in your browser:

```
http://localhost:8000/vinyl-collection-ui/index.html
```

### GitHub Sync Configuration

To sync your collection with GitHub:

1. **Create a GitHub Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Vinyl Collection UI")
   - Select scope: **`repo`** (Full control of private repositories)
   - Click "Generate token" and copy it immediately

2. **Enter credentials in the UI**:
   - GitHub owner: Your GitHub username
   - Repo name: Your data repository name (e.g., `vinyl-collection-data`)
   - Access token: Paste the token you created
   - Click "Save"

3. **Sync your data**:
   - Click "Pull Data" to fetch from GitHub
   - Click "Push Data" to upload local changes
   - Sync status will update automatically

### Stop Local Server

Press `Ctrl+C` in the terminal running the server, or run:

```bash
pkill -f "python3 -m http.server 8000"
```

## Project Structure

- `vinyl-collection-ui/` - Main application interface
  - `index.html` - Record editor
  - `view.html` - Collection viewer
  - `stats.html` - Collection statistics
  - `print-barcodes.html` - Barcode printer
  - `sync.js` - GitHub sync functionality
  - `style.css` - Application styles

## Album Cover Integration

The app integrates with the Discogs API to automatically fetch album cover artwork.

### Discogs API Token

A Discogs API token is required to fetch album covers. The token for this project is:

```
ZBLxNZPZluJmLeSvdSMDWNznQXPxDSmXoznWbIng
```

### How to Fetch Album Covers

**Recommended Method: Node.js Script** (Automatic)

1. **Export your records**:
   - Open the Editor (`index.html`) in browser
   - Click "Export JSON" button
   - Save as `vinyl.json` in the project root directory

2. **Run the cover fetcher**:
   ```bash
   cd vinyl-collection-ui
   node fetch-covers.js ../vinyl.json
   ```

3. **What happens**:
   - Script searches Discogs for each record
   - Downloads cover images directly to `covers/` folder
   - Saves updated records to `vinyl-with-covers.json`
   - Shows progress and statistics
   - Respects rate limits (60 requests/minute)

4. **Import updated records**:
   - Open the Editor (`index.html`)
   - Click "Import JSON"
   - Select `vinyl-with-covers.json`
   - All covers will now display!

**Alternative Method: Browser UI** (Manual)

1. **Configure Discogs Token**:
   - Open the Editor (`index.html`)
   - Enter the Discogs API token: `ZBLxNZPZluJmLeSvdSMDWNznQXPxDSmXoznWbIng`
   - Click "Save Discogs Token"

2. **Fetch covers** (limited by browser CORS restrictions):
   - Click "Fetch Cover" for individual records
   - Note: Browser downloads may fail due to CORS - use Node.js script instead

3. **View Covers**:
   - Open the Viewer (`view.html`)
   - Click "Show/Hide Covers" to toggle cover display
   - Covers appear as 60x60px thumbnails
   - Your preference is saved to localStorage

### Covers Directory Structure

Album covers are stored in:

```
vinyl-collection-ui/covers/
```

- Image naming: `{barcode}.jpg` (e.g., `VNL-ABC123.jpg`)
- Images are committed to git and sync via GitHub
- Estimated total size: 50-100MB for 280 records

### Manual Upload

If Discogs doesn't have a cover, you can manually add one:

1. Save your cover image as `{barcode}.jpg`
2. Place it in the `covers/` folder
3. The app will automatically detect and display it

## Data Storage

- **Local**: Records are stored in browser localStorage
- **Remote**: Syncs with GitHub repository as `vinyl.json`
- **Merge strategy**: Combines local and remote changes automatically
- **Covers**: Stored in `covers/` folder and synced via git
