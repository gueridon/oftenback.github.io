// data.js - load vinyl.json and expose helpers shared across pages.

export async function loadRecords() {
  const res = await fetch("./vinyl.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to load vinyl.json: ${res.status}`);
  return await res.json();
}

export function coverUrl(record) {
  if (!record.coverImage) return null;
  return "./" + record.coverImage;
}

export function matchesQuery(record, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [
    record.artist, record.title, record.year,
    record.genre, record.format, record.barcode,
  ].filter(Boolean).join("  ").toLowerCase();
  return haystack.includes(q);
}

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export function sortRecords(records, field, direction = "asc") {
  const mul = direction === "desc" ? -1 : 1;
  return [...records].sort((a, b) =>
    collator.compare(String(a[field] ?? ""), String(b[field] ?? "")) * mul);
}

export function distinctValues(records, field) {
  const seen = new Set();
  for (const r of records) if (r[field]) seen.add(r[field]);
  return [...seen].sort(collator.compare);
}

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

export function cubeTag(r) {
  return r.cube === "cabinet" ? "cabinet" : (r.cube || "·");
}
export function cubeLabel(r) {
  return r.cube === "cabinet" ? "cabinet" : (r.cube ? "cube " + r.cube : "unshelved");
}
