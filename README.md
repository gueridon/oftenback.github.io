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

## Data Storage

- **Local**: Records are stored in browser localStorage
- **Remote**: Syncs with GitHub repository as `vinyl.json`
- **Merge strategy**: Combines local and remote changes automatically
