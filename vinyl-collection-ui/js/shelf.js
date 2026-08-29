// shelf.js — where a disc physically sits inside its cube.
//
// Two facts underpin this, both discovered from the data on 2026-08-29 rather than
// assumed, and both load-bearing:
//
//   1. THE FILING RULE IS ALPHABETICAL BY ARTIST WITH LEADING ARTICLES KEPT.
//      Stripping "The" scattered the recorded cube assignment into 28 alphabetical
//      runs across 8 multi-cube genres; keeping it gives 15 and makes Classical
//      perfectly contiguous. "The Love Machine" is filed under T, not L. If the
//      shelf is ever re-filed under a different rule, this function is the one
//      place to change.
//
//   2. THICKNESS IS NOT UNIFORM. 593 LPs, but also 135 twelve-inch singles (thinner)
//      and 18 boxes (much thicker). Dividing cube width by record count drifts by
//      centimetres across a full cube, which is exactly the error that makes a
//      position useless for finding a spine.
//
// Calibration: at 4.3mm per LP the fullest cube (7) reads ~99% occupied and the
// emptiest (11) ~48%, which matches the shelf. LP_MM is the single knob: every other
// format is a multiple of it, so one measurement retunes the whole model.

export const CUBE_INNER_MM = 330;      // measured, all twelve cubes identical
export const CABINET_INNER_MM = 700;   // the dining cabinet, measured 2026-08-29

// Not every shelf is a cube. Drawing the cabinet against 330mm reported it as 82% full
// when it is 39%, which is the difference between "nearly out of room" and "the emptiest
// space in the house" -- and it is where the box sets go, so that number matters.
// The wall, as it physically stands (2026-08-29). Shelf 1 is the original 4x2 standing
// up, so four rows of two. Shelf 2 is the new unit, two rows of four, and its LEFTMOST
// COLUMN is cubes 15 and 16 -- 15 holds the computer, 16 is free. Records therefore live
// in 1-14, which is exactly what the layout allocates.
//
// Kept as data rather than baked into the page so the map is one edit away from correct
// if the numbering reads differently from how it looks here.
export const WALL = [
  { name: 'Shelf 1', note: 'the original 4x2, standing', rows: [[1, 2], [3, 4], [5, 6], [7, 8]] },
  { name: 'Shelf 2', note: 'the new unit, 2 rows of 4', rows: [[15, 9, 10, 11], [16, 12, 13, 14]] },
];

// Cubes that hold no records, and why.
export const RESERVED = {
  15: 'computer / server',
  16: 'free — growth space',
};

export function innerMmFor(cube) {
  return String(cube) === 'cabinet' ? CABINET_INNER_MM : CUBE_INNER_MM;
}
export const LP_MM = 4.3;

// Multiples of one LP. Deliberately coarse: these are sleeve thicknesses, and being
// right to half a millimetre per disc matters less than being right about which
// records are two or three times thicker than their neighbours.
export const FORMAT_THICKNESS = {
  'LP': 1.0,
  '2xLP': 1.63,
  'LP 10"': 0.88,
  '12" Single (33RPM)': 0.75,
  '12" Single (45RPM)': 0.75,
  '12" EP': 0.75,
  '12" Promo': 0.63,
  'Box': 3.0,
  '2xLP Box': 2.5,
  '3xLP Box': 3.75,
};
export const DEFAULT_THICKNESS = 1.0;

export function thicknessMm(record, lpMm = LP_MM) {
  const mult = FORMAT_THICKNESS[record.format] ?? DEFAULT_THICKNESS;
  return mult * lpMm;
}

// The filing key. Accents folded and case folded so "Éclat" sorts with "Eclat", but
// articles KEPT per fact 1 above. Also strips the invisible LTR/RTL marks the data
// carries from Discogs (several artist strings end in U+200E), which would otherwise
// sort after every visible character and silently misplace those records.
export function shelfKey(record) {
  return (record.artist || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‎‏​]/g, '')
    .trim()
    .toLowerCase();
}

const byKey = (a, b) => shelfKey(a).localeCompare(shelfKey(b));

export function recordsInCube(records, cube) {
  return records.filter(r => String(r.cube ?? '') === String(cube));
}

export function cubeList(records) {
  const nums = new Set(), others = new Set();
  for (const r of records) {
    const c = String(r.cube ?? '').trim();
    if (!c) continue;
    (/^\d+$/.test(c) ? nums : others).add(c);
  }
  return [...[...nums].sort((a, b) => a - b), ...[...others].sort()];
}

// The layout: each disc gets a start, a width and a centre in millimetres from the
// cube's left wall. Positions are ABSOLUTE, not normalised to 330mm, because most
// cubes are not full -- normalising would stretch a half-empty cube's positions
// across the whole width and put every spine in the wrong place.
export function cubeLayout(records, cube, opts = {}) {
  const lpMm = opts.lpMm ?? LP_MM;
  const sorted = recordsInCube(records, cube).sort(byKey);
  let x = 0;
  const items = sorted.map((record, index) => {
    const widthMm = thicknessMm(record, lpMm);
    const item = { record, index, startMm: x, widthMm, centerMm: x + widthMm / 2 };
    x += widthMm;
    return item;
  });
  const innerMm = innerMmFor(cube);
  return {
    cube,
    items,
    count: items.length,
    occupiedMm: x,
    innerMm,
    occupancy: innerMm ? x / innerMm : 0,
    overfull: x > innerMm,
  };
}

// Find one disc and say where it is, in the terms you need standing at the shelf.
export function locate(records, record, opts = {}) {
  const layout = cubeLayout(records, record.cube, opts);
  const hit = layout.items.find(i => i.record.barcode === record.barcode);
  if (!hit) return null;
  return {
    cube: record.cube,
    positionMm: Math.round(hit.centerMm),
    fromRightMm: Math.round(layout.occupiedMm - hit.centerMm),
    index: hit.index + 1,
    of: layout.count,
    layout,
  };
}

export function anchorsFor(records, cube) {
  const inCube = recordsInCube(records, cube);
  return {
    first: inCube.find(r => r.cubeAnchor === 'first') || null,
    last: inCube.find(r => r.cubeAnchor === 'last') || null,
  };
}

// Anchors vs the recorded `cube` field. The anchors are the only OBSERVED facts here:
// `cube` is computed from genre by cube.py place(), never seen. So where the two
// disagree, the anchors win and the difference is a worklist -- either a disc filed in
// the wrong cube, or a stale `cube` value. Two such records were already known before
// this page existed (Odyssey and The Atlanta Disco Band, both tagged cube 1 while
// sitting alphabetically inside cubes 2 and 3).
//
// The interval is taken within the genres this cube actually holds, because a genre
// overflows across consecutive cubes: Disco fills 1, 2, 3 and part of 4, so "between
// these two artists" only means something inside that genre's own run.
export function reconcile(records, cube, opts = {}) {
  const { first, last } = anchorsFor(records, cube);
  if (!first || !last) return { ready: false, missing: !first && !last ? 'both' : (!first ? 'first' : 'last') };
  const genres = new Set(recordsInCube(records, cube).map(r => r.genre));
  const lo = shelfKey(first), hi = shelfKey(last);
  const inInterval = r =>
    genres.has(r.genre) &&
    shelfKey(r).localeCompare(lo) >= 0 &&
    shelfKey(r).localeCompare(hi) <= 0;

  const shouldBeHere = records.filter(r => inInterval(r) && String(r.cube ?? '') !== String(cube));
  const shouldNotBeHere = recordsInCube(records, cube).filter(r => !inInterval(r));
  return {
    ready: true,
    first, last,
    expected: records.filter(inInterval).length,
    tagged: recordsInCube(records, cube).length,
    shouldBeHere,
    shouldNotBeHere,
    agrees: shouldBeHere.length === 0 && shouldNotBeHere.length === 0,
  };
}

// Set or clear an anchor, returning a NEW records array. Only one first and one last
// per cube: setting either clears any previous holder in that cube, so the data cannot
// drift into two firsts.
export function setAnchor(records, cube, which, barcode) {
  return records.map(r => {
    const inThisCube = String(r.cube ?? '') === String(cube);
    if (!inThisCube) return r;
    const isTarget = r.barcode === barcode;
    if (r.cubeAnchor === which && !isTarget) {
      const { cubeAnchor, ...rest } = r;
      return rest;
    }
    if (isTarget) return { ...r, cubeAnchor: which };
    return r;
  });
}
