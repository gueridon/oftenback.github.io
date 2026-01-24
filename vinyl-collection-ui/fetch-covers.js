#!/usr/bin/env node

/**
 * Fetch Album Covers from Discogs
 *
 * This script reads vinyl records and downloads missing album covers
 * from Discogs API, saving them directly to the covers/ folder.
 *
 * Usage:
 *   node fetch-covers.js [vinyl.json]
 *
 * If no file is specified, it will try to read vinyl.json from parent directory.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const DISCOGS_TOKEN = 'ZBLxNZPZluJmLeSvdSMDWNznQXPxDSmXoznWbIng';
const RATE_LIMIT_DELAY = 1100; // 1.1 seconds between requests (safe for 60/min limit)
const COVERS_DIR = path.join(__dirname, 'covers');

// Ensure covers directory exists
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  console.log('✓ Created covers directory');
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTPS request and return parsed JSON
 */
function httpsRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'VinylCollectionManager/1.0'
    };

    https.get(url, { headers: { ...defaultHeaders, ...headers } }, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download file from URL and save to disk
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

/**
 * Search Discogs for a release
 */
async function searchRelease(artist, title, year, format) {
  let query = `${artist} ${title}`;
  if (year) query += ` ${year}`;

  let formatParam = '';
  if (format && format.toLowerCase().includes('vinyl')) {
    formatParam = '&format=vinyl';
  }

  const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release${formatParam}&token=${DISCOGS_TOKEN}`;

  try {
    const data = await httpsRequest(url);

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Find first result with a real cover image (not spacer.gif)
    const release = data.results.find(r =>
      r.cover_image && !r.cover_image.includes('spacer.gif')
    );

    return release || null;
  } catch (error) {
    console.error(`  ✗ Search error: ${error.message}`);
    return null;
  }
}

/**
 * Check if cover already exists locally
 */
function coverExists(barcode) {
  const filepath = path.join(COVERS_DIR, `${barcode}.jpg`);
  return fs.existsSync(filepath);
}

/**
 * Download and save cover image
 */
async function downloadCover(imageUrl, barcode) {
  const filepath = path.join(COVERS_DIR, `${barcode}.jpg`);

  try {
    await downloadFile(imageUrl, filepath);
    return true;
  } catch (error) {
    console.error(`  ✗ Download error: ${error.message}`);
    return false;
  }
}

/**
 * Process a single record
 */
async function processRecord(record, index, total) {
  const prefix = `[${index + 1}/${total}]`;
  console.log(`\n${prefix} ${record.artist} - ${record.title}`);

  // Check if barcode exists
  if (!record.barcode) {
    console.log('  ⊘ No barcode, skipping');
    return { status: 'skipped', reason: 'no_barcode' };
  }

  // Check if cover already exists
  if (coverExists(record.barcode)) {
    console.log(`  ✓ Cover already exists: ${record.barcode}.jpg`);
    return { status: 'exists' };
  }

  // Search Discogs
  console.log('  → Searching Discogs...');
  const release = await searchRelease(
    record.artist,
    record.title,
    record.year,
    record.format
  );

  if (!release || !release.cover_image) {
    console.log('  ✗ No cover found on Discogs');
    return { status: 'not_found' };
  }

  console.log(`  → Found: ${release.title}`);
  console.log('  → Downloading...');

  // Download cover
  const success = await downloadCover(release.cover_image, record.barcode);

  if (success) {
    console.log(`  ✓ Saved: covers/${record.barcode}.jpg`);

    // Update record with cover path if not already set
    if (!record.coverImage) {
      record.coverImage = `covers/${record.barcode}.jpg`;
    }

    return { status: 'downloaded' };
  } else {
    return { status: 'failed' };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Discogs Album Cover Fetcher');
  console.log('═══════════════════════════════════════════════════\n');

  // Determine input file
  const inputFile = process.argv[2] || path.join(__dirname, '..', 'vinyl.json');

  // Check if file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`✗ Error: File not found: ${inputFile}\n`);
    console.log('Usage:');
    console.log('  node fetch-covers.js [path/to/vinyl.json]\n');
    console.log('Or export your records from the UI first:');
    console.log('  1. Open index.html in browser');
    console.log('  2. Click "Export JSON"');
    console.log('  3. Save as vinyl.json in project root');
    process.exit(1);
  }

  // Read records
  console.log(`Reading records from: ${inputFile}`);
  const records = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log(`Found ${records.length} records\n`);

  // Filter records that need covers
  const recordsNeedingCovers = records.filter(r =>
    r.barcode && !coverExists(r.barcode)
  );

  if (recordsNeedingCovers.length === 0) {
    console.log('✓ All records with barcodes already have covers!\n');
    process.exit(0);
  }

  console.log(`${recordsNeedingCovers.length} records need covers\n`);
  console.log('Starting download... (Rate limit: ~1 request/second)\n');

  // Statistics
  const stats = {
    downloaded: 0,
    exists: 0,
    not_found: 0,
    failed: 0,
    skipped: 0
  };

  // Process each record
  for (let i = 0; i < recordsNeedingCovers.length; i++) {
    const result = await processRecord(recordsNeedingCovers[i], i, recordsNeedingCovers.length);

    if (result.status === 'downloaded') stats.downloaded++;
    else if (result.status === 'exists') stats.exists++;
    else if (result.status === 'not_found') stats.not_found++;
    else if (result.status === 'failed') stats.failed++;
    else if (result.status === 'skipped') stats.skipped++;

    // Rate limiting - wait before next request
    if (i < recordsNeedingCovers.length - 1) {
      await sleep(RATE_LIMIT_DELAY);
    }
  }

  // Save updated records back to file
  const outputFile = inputFile.replace('.json', '-with-covers.json');
  fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));
  console.log(`\n✓ Updated records saved to: ${outputFile}`);

  // Print summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Downloaded:     ${stats.downloaded}`);
  console.log(`Already exists: ${stats.exists}`);
  console.log(`Not found:      ${stats.not_found}`);
  console.log(`Failed:         ${stats.failed}`);
  console.log(`Skipped:        ${stats.skipped}`);
  console.log('═══════════════════════════════════════════════════\n');

  console.log('Next steps:');
  console.log('1. Check the covers/ folder for downloaded images');
  console.log('2. Import the updated JSON file back into the UI');
  console.log('3. Commit and push to sync with GitHub\n');
}

// Run
main().catch(error => {
  console.error('\n✗ Fatal error:', error.message);
  process.exit(1);
});
