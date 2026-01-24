/**
 * Discogs API Integration Module
 *
 * Provides functionality to search for vinyl releases and fetch album cover artwork.
 * Rate limit: 60 requests per minute for authenticated requests.
 */

const DISCOGS_API_BASE = 'https://api.discogs.com';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests to be safe
let lastRequestTime = 0;

/**
 * Waits to respect rate limits
 */
async function respectRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
}

/**
 * Search Discogs for a release matching the given criteria
 *
 * @param {string} artist - Artist name
 * @param {string} title - Album title
 * @param {string} year - Release year (optional)
 * @param {string} format - Format type (e.g., "Vinyl", "LP")
 * @param {string} token - Discogs API token
 * @returns {Promise<Object|null>} Release data with image URL, or null if not found
 */
export async function searchRelease(artist, title, year, format, token) {
  await respectRateLimit();

  try {
    // Build search query
    let query = `${artist} ${title}`;
    if (year) query += ` ${year}`;

    // Add format filter
    let formatParam = '';
    if (format && format.toLowerCase().includes('vinyl')) {
      formatParam = '&format=vinyl';
    }

    const url = `${DISCOGS_API_BASE}/database/search?q=${encodeURIComponent(query)}&type=release${formatParam}&token=${token}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VinylCollectionManager/1.0'
      }
    });

    if (!response.ok) {
      console.error('Discogs API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log('No results found for:', query);
      return null;
    }

    // Return the first result with cover image
    const release = data.results.find(r => r.cover_image && !r.cover_image.includes('spacer.gif'));

    if (!release) {
      console.log('No results with cover image found');
      return null;
    }

    return {
      id: release.id,
      title: release.title,
      year: release.year,
      coverImage: release.cover_image,
      thumb: release.thumb,
      resourceUrl: release.resource_url
    };

  } catch (error) {
    console.error('Error searching Discogs:', error);
    return null;
  }
}

/**
 * Download and return image as blob
 *
 * @param {string} imageUrl - URL of the image to download
 * @param {string} barcode - Barcode for the record (used for filename)
 * @returns {Promise<Object|null>} Object with blob and suggested filename, or null
 */
export async function downloadAndSaveCover(imageUrl, barcode) {
  try {
    await respectRateLimit();

    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.error('Failed to download image:', response.status);
      return null;
    }

    const blob = await response.blob();
    const filename = `${barcode}.jpg`;

    return {
      blob,
      filename,
      localPath: `covers/${filename}`
    };

  } catch (error) {
    console.error('Error downloading cover:', error);
    return null;
  }
}

/**
 * Trigger browser download of image
 * User must manually place file in covers/ folder
 *
 * @param {Blob} blob - Image blob
 * @param {string} filename - Suggested filename
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get cover image URL from local covers folder
 *
 * @param {string} barcode - Record barcode
 * @returns {string} Local path to cover image
 */
export function getLocalCoverPath(barcode) {
  return `covers/${barcode}.jpg`;
}

/**
 * Check if cover image exists locally
 *
 * @param {string} coverPath - Path to cover image
 * @returns {Promise<boolean>} True if image exists and loads
 */
export async function checkCoverExists(coverPath) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = coverPath;
  });
}
