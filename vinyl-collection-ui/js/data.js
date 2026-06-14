// data.js — load vinyl.json and expose helpers shared across pages.
//
// All paths are relative to the page (./vinyl.json, ./covers/X.jpg) so the
// same code works in dev (served by `vinyl serve`) and in production (served
// by GitHub Pages under oftenback.io/vinyl-collection-ui/).

export async function loadRecords() {
  const res = await fetch("./vinyl.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to load vinyl.json: ${res.status}`);
  return await res.json();
}

export function coverUrl(record) {
  if (!record.coverImage) return null;
  // coverImage is stored as "covers/VNL-XXX.jpg" relative to data/.
  // Our HTTP layout puts /covers/ as a virtual mount; same in prod.
  return "./" + record.coverImage;
}

export function recordKey(r) {
  return r.barcode;
}

// Search across all printable fields. Case-insensitive substring match.
export function matchesQuery(record, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [
    record.artist, record.title, record.year,
    record.genre, record.format, record.barcode,
    record.cube === "cabinet" ? "dining cabinet" : (record.cube ? "cube " + record.cube : ""),
  ].filter(Boolean).join("  ").toLowerCase();
  return haystack.includes(q);
}

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export function sortRecords(records, field, direction = "asc") {
  const mul = direction === "desc" ? -1 : 1;
  return [...records].sort((a, b) => {
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    return collator.compare(String(av), String(bv)) * mul;
  });
}

// Build distinct, sorted suggestion lists (used by autocomplete in the editor).
export function distinctValues(records, field) {
  const seen = new Set();
  for (const r of records) {
    const v = r[field];
    if (v) seen.add(v);
  }
  return [...seen].sort(collator.compare);
}

// Generate a VNL-XXXXXX barcode that doesn't collide with `existing`.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function generateBarcode(existing) {
  const taken = new Set(existing);
  for (let i = 0; i < 1000; i++) {
    let s = "VNL-";
    for (let j = 0; j < 6; j++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    if (!taken.has(s)) return s;
  }
  throw new Error("barcode generator: exhausted attempts");
}
