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
   - Open the Editor (`index.html`) in browser at http://localhost:8000/vinyl-collection-ui/index.html
   - Click "Export JSON" button
   - Browser will download the file as `vinyl-export.json`
   - Save it to the project root directory: `/path/to/oftenback.github.io/`

2. **Run the cover fetcher**:
   ```bash
   cd vinyl-collection-ui
   node fetch-covers.js ../vinyl-export.json
   ```

   The script will:
   - Search Discogs for each record without a cover
   - Download cover images directly to `covers/` folder
   - Save updated records to `vinyl-export-with-covers.json`
   - Show progress and statistics
   - Respect rate limits (~1 request per second)

3. **Import updated records**:
   - Open the Editor (`index.html`) in browser
   - Click "Import JSON" button
   - Navigate to project root and select `vinyl-export-with-covers.json`
   - Records will merge and covers will now display!

4. **Sync to GitHub**:
   - Click "Push Data" button in the Editor
   - Your vinyl.json on GitHub will now include all cover paths
   - The remote site will display all covers

### Viewing Covers

- Open the **Viewer** (`view.html`)
- Click "Show/Hide Covers" to toggle cover display
- Covers appear as 60x60px thumbnails
- Your preference is saved to localStorage
- Covers are hidden on mobile for better space usage

### Fetching Covers for New Records

When you add new vinyl records to your collection:

1. **Export** the updated collection from the Editor
2. **Run the script** again: `node fetch-covers.js ../vinyl-export.json`
3. **Import** the updated `vinyl-export-with-covers.json`
4. **Push** to sync with GitHub

The script automatically skips records that already have covers, so it's safe to run multiple times.

### Covers Directory Structure

Album covers are stored in:

```
vinyl-collection-ui/covers/
```

- Image naming: `{barcode}.jpg` (e.g., `VNL-ABC123.jpg`)
- Images are committed to git and sync via GitHub
- Total size: ~28MB for 262 covers

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
