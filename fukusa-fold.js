// fukusa-fold.js
// ---------------------------------------------------------------------------
// A square of silk, and the folding of it.
//
// This came out of work-fukusa-fold.html, where it was written and measured
// against Nicolas's own account of the so sabaki, because the tea room needs
// the same cloth and the same folds: two pages cannot share geometry that is
// written inside one of them. The bench keeps the camera, the readout and the
// wiping script; everything about the CLOTH is here.
//
// The mechanism is mine. The sequence of folds is his, given fold by fold on
// 2026-09-13, and the paper trail is in work-temae-sources.md.
//
// Sizes are in METRES. A fukusa is 285 square and ends as a packet of about
// 70 by 56, nine and a half thick.
// ---------------------------------------------------------------------------
(function (global) {
  "use strict";

  // ---- the folds, as three lists ------------------------------------------
  // A fold list is DATA and its steps are stateful: resolving a crease writes
  // `turn`, `at` and the rest onto the step. So every maker gets its own deep
  // copy, or two cloths in one page would fold along each other's creases.
  function makeLists(o) {
// ---- the folds ------------------------------------------------------------
// A crease is a LINE ON THE FLOOR, at any angle: `turn` is the direction the
// cloth travels, in degrees, measured from +x toward +z, and `at` is how far
// along that direction the crease stands. Diagonal creases matter here,
// because the semi-formal sabaki begins by folding the square corner to
// corner. `side` is which side travels, `deg` is 180 for a full fold.
//
// TWO LISTS, and the difference between them is the whole question he asked.
// `packet` is the shape carried at the waist, which we already model, and it
// is NOT what purifies anything. `gyo` is my reading of the semi-formal
// sabaki from the sources -- corner to corner, then halved down -- and it is
// a HYPOTHESIS, standing until Linda gives the real one. ?list=packet|gyo
const LISTS = {
  packet: {
    want: "142 x 71, eight thicknesses, carried at the waist",
    folds: [
      { turn: 90, at: 0.0000, side: +1, deg: 180, note: "in half" },
      { turn: 90, at: -0.0713, side: +1, deg: 180, note: "and in half again: in four" },
      { turn: 0, at: 0.0000, side: +1, deg: 180, note: "and once across" },
    ],
  },
  // FIVE FOLDS, which is the number every source gives, each one halving the
  // triangle along the altitude from its right angle to the middle of its
  // long side. The crease lines are not eyeballed: the triangle's corners
  // were tracked through the sequence on paper, and each altitude written
  // down. The hypotenuse halves 403, 285, 201, 142, 101, and the packet comes
  // out 71 square against the 50 by 55 the sources measure. Which is the
  // measure of how far a hypothesis can get on its own.
  gyo: {
    want: "about 50 x 55, the size the sources measure the folded sabaki at",
    folds: [
      { turn: 45, at: 0.0000, side: +1, deg: 180, note: "corner to corner" },
      { turn: 135, at: 0.0000, side: +1, deg: 180, note: "the triangle in half" },
      { turn: 0, at: 0.0000, side: +1, deg: 180, note: "in half again" },
      { turn: 45, at: -0.10076, side: +1, deg: 180, note: "and again" },
      { turn: 0, at: -0.07125, side: +1, deg: 180, note: "and once more" },
    ],
  },
};
// AND THE ONE THIS TEMAE ACTUALLY USES. Nicolas, 2026-09-13: "pour ce temae
// on fait le simple, le so sabaki. Pas d'examen." So no yoho sabaki, no four
// sides examined, and not the five folds of the formal registers either. The
// source describes the so in one sentence: pull the fukusa out, hold it in a
// triangle, fold it in half, trace a line on it, and put it in the left palm.
//
// Three creases, then: the fold it is already carried in, the corner-to-corner
// that makes the triangle, and the half that goes into the palm. The tracing
// of the line is a finger and not a fold, so it is not here.
//
// The creases are AUTOMATIC: "half" cuts the current shape across its longer
// side, "diag" runs corner to corner of it. Written that way because each
// crease depends on what the last one left, and I would rather the geometry
// work that out than write down five numbers I had computed by hand.
//
// He sent the two pages, so they are read as instructions and not as colour.
// Chanoyu Decoded is the one with a number in it: "the fukusa is folded in
// half to form a TRIANGLE, making a diagonal measurement of 13.08 sun
// kane-jaku. It is then folded in half five times creating a WIDTH of 1.635
// sun." And 13.08 divided by two three times over is 1.635 exactly, so the
// width they measure is the hypotenuse halved three times. That is a crease
// pattern, arrived at from a measurement rather than from a picture:
//
//    corner to corner        hypotenuse 396mm  (13.08 sun on a 280 cloth)
//    in half                            198
//    in half                             99
//    in half                             49.5  (1.635 sun, their number)
//
// The second of their two figures, 1.8 sun, I cannot make come out, and I
// have stopped trying to: see work-temae-sources.md.
// AND THEN HE TOLD ME, which settles it: "Le premier pli sur la diagonale est
// bon. Ensuite, cela forme un triangle, place le plus grand cote du triangle
// sur la gauche, vertical. Ensuite, regarde l'hypotenuse, c'est-a-dire la
// largeur, et divise-le en trois, de sorte qu'on a trois bandes verticales
// paralleles et de la meme largeur. plie la bande gauche, la plus grande en
// hauteur, sous le fukusa, sous la bande du milieu, et la bande la plus
// petite, sur la bande du milieu. De sorte que maintenant on a un accordeon.
// On fait ca et on continue apres."
//
// So it is neither my triangle halved nor a band doubled: it is an ACCORDION,
// two folds in opposite directions, one under and one over. Which is why no
// chain of halvings could reach their numbers -- a zig-zag in three divides a
// width by three, and three is not in any of them.
//
// Turning the cloth to stand the long side upright is a step of its own here,
// because it is a step of its own in his hands.
//
// And then, 2026-09-13, he took two movements out of it: "au debut du
// pliage, plie le long de la diagonale en meme temps que tu amenes cette
// diagonale a l'horizontale. de cette position, tu fais pivoter le fukusa
// counter clockwise, et le tout reduit les mouvements." So the first fold and
// the laying-flat are ONE movement, and what follows is a plain quarter turn
// to the left rather than a computed alignment. Fewer movements, and each one
// is now a thing a hand does rather than a thing I worked out.
LISTS.so = {
  want: "an accordion of three bands, and then whatever he says comes next",
  folds: [
    { auto: "diag", deg: 180, spin: "flat",
      note: "corner to corner, the fold coming level in the same movement" },
    { orient: -90, note: "a quarter turn, counter clockwise" },
    { auto: "band", third: 1, side: -1, deg: -180,
      note: "the left band, the tall one, UNDER the middle" },
    { auto: "band", third: 2, side: +1, deg: 180,
      note: "the small band OVER the middle: an accordion" },
    // "maintenant, descend la pointe du haut sur la pointe du bas, donc en
    // deux dans le sens de la hauteur. et encore en deux."
    { auto: "half", along: "z", from: "top", deg: 180,
      note: "the top point down onto the bottom one" },
    { auto: "half", along: "z", from: "top", deg: 180, note: "and in half again" },
    // AND HERE THE FOLD BECOMES THE NATSUME'S. "la suite depend de
    // l'ustensil. Pour le natsume, tu plies encore en deux, mais tu fais
    // descendre la MOITIE HAUTE PAR DERRIERE sur la moitie basse."
    //
    // Behind, so a negative angle: the half that travels goes under, and the
    // thickness it brings stacks downward with it. Everything above this line
    // is common to whatever is being purified; from here the cloth is folded
    // for one utensil.
    { auto: "half", along: "z", from: "top", deg: -180, nat: true,
      note: "the top half down BEHIND the bottom one: the natsume's fold" },
    // "le pli final est alors tourne vers le bas, de sorte que le pli epais de
    // toutes les couches sert a purifier la surface du couvercle du natsume."
    // The crease of that last fold lies along the packet's top edge, and it is
    // the edge that does the work, so the packet is turned in the hand to lead
    // with it. Confirmed with him before it was built: "tu ne te trompes pas."
    { orient: 180, note: "turned to lead with the thick fold" },
    // AND TWO MORE THAT ONLY THE SCOOP USES. "L'hote resserre le fukusa de
    // chaque cote du chashaku, formant un u." They sit at the end of the list
    // and stay at nothing for the caddy's work; the room drives them by hand
    // when the scoop is lying on the cloth.
    // ALONG THE SCOOP, and the scoop lies across the cloth's WIDTH: "tu fais
    // le U dans la longueur du fukusa mais il faut qu'il soit dans la
    // largeur". So the creases run along the cloth's short way, and the two
    // flaps that come up are its long halves.
    { along: "z", off: 0.010, from: "bottom", deg: 88, u: true,
      note: "one side up, against the scoop" },
    { along: "z", off: -0.010, from: "top", deg: 88, u: true,
      note: "and the other: a U across the width" },
  ],
};
// ---- THE CHAKIN ----------------------------------------------------------
// His fold, 2026-09-14: "le chakin vient plie en trois dans sa largeur puis
// en 2 fois deux dans la longueur." The cloth lies with its LENGTH along x
// (300) and its WIDTH along z (150), so the three bands are cut across z and
// the two halvings across x.
//
// 300 by 150 -> 300 by 50 -> 150 by 50 -> 75 by 50, twelve thicknesses,
// which is the packet that sits on the kettle's lid.
//
// "on ne deplie donc que le premier pli": only ONE fold comes undone when he
// wipes with it, so the list is ordered to make that the last one applied,
// and the room can hold the cloth at three creases instead of four.
LISTS.chakin = {
  want: "75 by 50, twelve thicknesses",
  folds: [
    { auto: "band", along: "z", third: 1, side: -1, deg: 180,
      note: "one third of the width over the middle" },
    { auto: "band", along: "z", third: 2, side: +1, deg: 180,
      note: "and the other third over it: three across the width" },
    { auto: "half", along: "x", from: "right", deg: 180,
      note: "in half along its length" },
    { auto: "half", along: "x", from: "right", deg: 180,
      note: "and in half again" },
    // AND TWO THAT THE PACKET NEVER USES. "il faut que tu le fasses en forme
    // de U comme tu as fait pour le fukusa + chasen. Sinon, on a l'impression
    // que le chakin passe dans la paroi du bol plutot que de chaque cote."
    // Two creases a few millimetres apart, each turned a right angle, so the
    // cloth has a FLOOR that sits on the lip and two sides that go down
    // either face of it. A single crease left the two panels five degrees
    // apart, and five degrees over a rim reads as a cloth going through it.
    //
    // They stand at the end of the list, at nothing, exactly as the fukusa's
    // U creases do; whoever needs them drives them by hand. Their offset is
    // overwritten by the caller, who has measured the lip.
    { along: "x", off: 0.0035, from: "bottom", deg: 88, u: true,
      note: "one side down, outside the lip" },
    { along: "x", off: -0.0035, from: "top", deg: 88, u: true,
      note: "and the other, inside it: a U across the lip" },
  ],
};
const LIST_NAME = LISTS[o.list] ? o.list : "so";
const LIST = LISTS[LIST_NAME];
const FOLDS = LIST.folds;
const WANT = LIST.want;
    return { LIST_NAME: LIST_NAME, LIST: LIST, FOLDS: FOLDS, WANT: WANT };
  }

  function make(o) {
    o = o || {};
    // undefined means "use the default", so a page can pass a knob through
    // without having to know what it is set to
    const num = (k, d) => (o[k] === undefined || o[k] === null ||
                           (typeof o[k] === "number" && !isFinite(o[k])) ? d : o[k]);
// ---- the cloth ------------------------------------------------------------
// A FUKUSA IS SQUARE AND A CHAKIN IS NOT, so the cloth has two dimensions
// now. Both default to 285, which is the fukusa, so nothing that already
// calls this has to know. The chakin is 300 by 150: one shaku by five sun.
const W = num("w", 0.285);           // along x
const H = num("h", 0.285);           // along z
const SIDE = Math.max(W, H);         // the long way, for the sag and the hand
// Quads per side. The creases do not run along the grid once the cloth has
// been turned, so the folded EDGE is as jagged as the mesh is coarse: at 54
// it was visibly serrated, which is the mesh and not the silk.
const N = num("n", 96);
// A ROUNDER CREASE IS A FLUFFIER CLOTH, and that is most of what "plus
// fluffy" is: six millimetres read as a pressed linen, nine as silk that has
// never been ironed.
// Six, with the ramp below carrying the later folds up from there. Measured
// on the finished packet: 6 and 0.14 come out 71 by 60 by 13, which is a
// folded fukusa you could put in your hand. 7 and 0.22 made it 19 thick,
// which is a cushion.
const SOFT = num("soft", 6) / 1000;
const RAMP = num("ramp", 0.14);       // how much rounder each later fold is
// One thickness. Thirty two layers at 0.55 would stand 17mm tall, which is a
// book and not a cloth, so the default is thinner than silk really is.
const LIFT = num("lift", 0.45) / 1000;
// HOW FAR THE RAISED FLAP CURLS OVER as it goes. Standing dead flat halfway
// through, the cloth read as card: silk has weight and the far edge leads.
// The curl grows with the distance from the crease and dies at both ends of
// the fold, since a flap that is down or shut is not hanging.
const SAG = num("sag", 16) * Math.PI / 180;
// MAUVE, at his word: "Fait le mauve." Which is also the true colour of a
// man's fukusa -- purple for a man, vermilion for a woman -- so the site's
// rule of one accent gives way here to a fact about the object. Two values,
// linear: the lit face and the shaded one, mixed by the weave below.
const BRIGHT = new THREE.Color(num("r", 0.146), num("g", 0.077), num("b", 0.342));
const DEEP = new THREE.Color(num("dr", 0.037), num("dg", 0.021), num("db", 0.088));
    const made = makeLists(o);
    const FOLDS = JSON.parse(JSON.stringify(made.FOLDS));   // its own creases
    const WANT = made.WANT, LIST_NAME = made.LIST_NAME;

// ---- the sheet ------------------------------------------------------------
// Flat in XZ, and the FLAT positions are kept: every frame the fold list is
// replayed from the flat cloth, so scrubbing backwards is the same arithmetic
// as folding forwards and nothing drifts.
// SQUARE QUADS on a cloth that is not square: a 96 by 96 grid on a 2:1
// sheet would give creases twice as coarse one way as the other, and the
// folded edge is only as smooth as the mesh under it.
const geo = new THREE.PlaneGeometry(W, H, N, Math.max(4, Math.round(N * H / W)));
geo.rotateX(-Math.PI / 2);
const flat = geo.attributes.position.array.slice();
const pos = geo.attributes.position;
const col = new Float32Array(pos.count * 3);
for (let i = 0; i < pos.count; i++) {
  // a weave: two crossed sinusoids, faint, so the silk is not a flat colour
  const x = flat[i * 3], z = flat[i * 3 + 2];
  const w = 0.5 + 0.5 * Math.sin(x * 720) * Math.sin(z * 720);
  const c = DEEP.clone().lerp(BRIGHT, 0.72 + 0.28 * w);
  col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
}
geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
// MATTE, and that is a retreat. I gave it MeshPhysical's sheen, which is the
// one thing in three.js written for cloth, and in this room it went WHITE:
// the shoji is a broad bright source, sheen answers at grazing angles, and a
// cloth that is mostly grazing angles from a seated eye simply blew out --
// "on perd completement l'aspect". He meant satin, and satin here would mean
// taming the room's light first, which is a bigger change than a fukusa.
//
// So: plain matte silk, the colour kept. ?sheen= puts it back for anyone who
// wants to try it against a different light.
const silk = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
  vertexColors: true, roughness: num("rough", 0.72), metalness: 0.0,
  sheen: num("sheen", 0),
  sheenRoughness: num("sheenRough", 0.45),
  sheenColor: new THREE.Color(num("sr", 0.52), num("sg", 0.38), num("sb", 0.70)),
  side: THREE.DoubleSide, flatShading: false,
}));
// THE HAND. Not a hand: a frame the cloth sits in, so that the wiping can
// move the whole packet without touching a single vertex. The folding works
// on the geometry, the wiping works on this.
// ---- folding --------------------------------------------------------------
// One fold, applied to every vertex: everything past the crease turns about
// it. The angle is RAMPED over SOFT millimetres, which is the whole difference
// between cloth and paper -- a knife-edge crease at one vertex row reads as
// card, and silk has a radius.
const _v = new THREE.Vector3();
// A crease worked out from the shape in hand rather than written down: the
// box the cloth occupies at that moment decides where its middle and its
// diagonal are. Resolved once per fold and remembered, so it does not wander
// while the fold is running.
let BANDS = null;              // the three strips, measured once when reached
function resolve(arr, f) {
  if (f.auto === "band" && f.turn === undefined) {
    // ACROSS EITHER WAY. The fukusa's accordion runs across x; the chakin is
    // folded in three across its WIDTH, which is z. Same rule, one axis apart.
    const alongZ = f.along === "z";
    if (!BANDS || BANDS.z !== alongZ) {
      let a0 = 1e9, a1 = -1e9;
      for (let i = 0; i < arr.length; i += 3) {
        const v = alongZ ? arr[i + 2] : arr[i];
        if (v < a0) a0 = v;
        if (v > a1) a1 = v;
      }
      BANDS = { x0: a0, w: a1 - a0, z: alongZ };
    }
    f.turn = alongZ ? 90 : 0;
    f.at = BANDS.x0 + BANDS.w * f.third / 3;
    return;
  }
  // ALREADY RESOLVED, or written out by hand in the list: either way there is
  // nothing to work out. This used to read `if (!f.auto || ...)`, which threw
  // away every step that named a direction without naming an `auto` -- the two
  // creases that make the U -- and they came out as NaN.
  if (f.turn !== undefined) return;
  if (f.auto === "diag") {
    // corner to corner of the box the cloth occupies
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < arr.length; i += 3) {
      if (arr[i] < x0) x0 = arr[i];
      if (arr[i] > x1) x1 = arr[i];
      if (arr[i + 2] < z0) z0 = arr[i + 2];
      if (arr[i + 2] > z1) z1 = arr[i + 2];
    }
    const w = x1 - x0, d = z1 - z0, len = Math.hypot(w, d);
    f.turn = Math.atan2(-w / len, d / len) * 180 / Math.PI;
    const nx = Math.cos(f.turn * Math.PI / 180), nz = Math.sin(f.turn * Math.PI / 180);
    f.at = ((x0 + x1) / 2) * nx + ((z0 + z1) / 2) * nz;
    f.side = +1;
    return;
  }
  // IN HALF ALONG A NAMED DIRECTION when the instruction names one -- "en
  // deux dans le sens de la hauteur" -- because the rule below cannot serve
  // there: the farthest two points of a 70 by 204 strip are the ends of its
  // DIAGONAL, 215 apart, so it folded the strip across a slant and came out
  // 124 by 116 instead of 70 by 102. Measured, not suspected.
  if (f.along) {
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < arr.length; i += 3) {
      if (arr[i] < x0) x0 = arr[i];
      if (arr[i] > x1) x1 = arr[i];
      if (arr[i + 2] < z0) z0 = arr[i + 2];
      if (arr[i + 2] > z1) z1 = arr[i + 2];
    }
    const alongZ = f.along === "z";
    f.turn = alongZ ? 90 : 0;
    // OFF THE MIDDLE, for a crease that is not a halving: the two that come
    // up either side of the scoop stand a couple of centimetres apart, and
    // the cloth between them is the floor of the U.
    f.at = (alongZ ? (z0 + z1) / 2 : (x0 + x1) / 2) + (f.off || 0);
    f.side = (f.from === "top" || f.from === "left") ? -1 : +1;
    f.span = alongZ ? z1 - z0 : x1 - x0;
    return;
  }
  // OTHERWISE, in half means bringing the two FARTHEST POINTS together, and
  // not halving its bounding box. On a rectangle the two are the same thing;
  // on the triangle they are not, and the box version left the cloth 72 by
  // 142 when the sources measure 49.5 -- because halving a box cuts a
  // triangle into a triangle and a trapezium, which is not a fold in half at
  // all. The farthest pair of an isoceles right triangle is its hypotenuse,
  // and the perpendicular bisector of that is its altitude, so this one rule
  // halves the square the long way AND halves the triangle into a triangle.
  let ax = 0, az = 0, bx = 0, bz = 0, far = -1;
  const step = Math.max(3, Math.round(arr.length / 3 / 400)) * 3;
  for (let i = 0; i < arr.length; i += step) {
    for (let j = i + step; j < arr.length; j += step) {
      const dx = arr[j] - arr[i], dz = arr[j + 2] - arr[i + 2];
      const q = dx * dx + dz * dz;
      if (q > far) { far = q; ax = arr[i]; az = arr[i + 2]; bx = arr[j]; bz = arr[j + 2]; }
    }
  }
  const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz) || 1;
  f.turn = Math.atan2(dz / len, dx / len) * 180 / Math.PI;   // travel along it
  const nx = dx / len, nz = dz / len;
  f.at = ((ax + bx) / 2) * nx + ((az + bz) / 2) * nz;        // its middle
  // WHICH END TRAVELS. Left to itself it is whichever end the sampling found
  // second, which is no answer at all when he says "the top point down onto
  // the bottom one". The top of the picture is -z, the eye looking along -z.
  f.side = (f.from === "top") ? (nz > 0 ? -1 : +1) : +1;
  f.span = len;                                              // for the readout
}

// TURNING THE CLOTH, which is not a fold: the longest side is brought
// upright, and the rest of the cloth put to its right. His step, in his
// words, and it has to be a step of its own or the bands fall the wrong way.
function resolveOrient(arr, f) {
  if (f.ang !== undefined) return;
  if (typeof f.orient === "number") {
    // A QUARTER TURN TO THE LEFT, as he asks, and the sign is the screen's:
    // the eye looks along -z, so +x is to the right and -z is up, and
    // counter clockwise on the screen is a NEGATIVE turn about y here.
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < arr.length; i += 3) {
      if (arr[i] < x0) x0 = arr[i];
      if (arr[i] > x1) x1 = arr[i];
      if (arr[i + 2] < z0) z0 = arr[i + 2];
      if (arr[i + 2] > z1) z1 = arr[i + 2];
    }
    f.ang = f.orient * Math.PI / 180;
    f.cx = (x0 + x1) / 2; f.cz = (z0 + z1) / 2;
    return;
  }
  let ax = 0, az = 0, bx = 0, bz = 0, far = -1, cx = 0, cz = 0, n = 0;
  const step = Math.max(3, Math.round(arr.length / 3 / 400)) * 3;
  for (let i = 0; i < arr.length; i += step) {
    cx += arr[i]; cz += arr[i + 2]; n++;
    for (let j = i + step; j < arr.length; j += step) {
      const dx = arr[j] - arr[i], dz = arr[j + 2] - arr[i + 2];
      const q = dx * dx + dz * dz;
      if (q > far) { far = q; ax = arr[i]; az = arr[i + 2]; bx = arr[j]; bz = arr[j + 2]; }
    }
  }
  cx /= n || 1; cz /= n || 1;
  const dir = Math.atan2(bz - az, bx - ax);          // the long side's bearing
  // bring it to +z, then see which side the cloth's middle fell on
  let ang = Math.PI / 2 - dir;
  const mx = (ax + bx) / 2, mz = (az + bz) / 2;
  const rx = Math.cos(ang) * (cx - mx) - Math.sin(ang) * (cz - mz);
  if (rx < 0) ang += Math.PI;                        // the body of it to the right
  f.ang = ang;
  f.cx = mx; f.cz = mz;
}
function applyOrient(arr, f, u) {
  turnAll(arr, f.cx, f.cz, f.ang * u);
}

// A rigid turn of the whole cloth about a point, used both for the quarter
// turn and for the levelling that rides along with the first fold.
function turnAll(arr, cx, cz, a) {
  const c = Math.cos(a), s2 = Math.sin(a);
  for (let i = 0; i < arr.length; i += 3) {
    const dx = arr[i] - cx, dz = arr[i + 2] - cz;
    arr[i] = cx + c * dx - s2 * dz;
    arr[i + 2] = cz + s2 * dx + c * dz;
  }
}

function applyFold(arr, f, u, k) {
  if (u <= 0) return;
  // A LATER FOLD IS A FATTER FOLD. The outer skin of a fold has to travel
  // around everything already folded inside it, so a crease through twelve
  // layers cannot have the radius of a crease through one. Without this the
  // packet came out flat-sided; with it the last folds make the two soft
  // rolls he asked for: "une fois plie, le fukusa a deux petits boudins de
  // chaque cote, plutot que d'etre plat."
  const soft = SOFT * (1 + RAMP * (k || 0));
  const ang = f.deg * Math.PI / 180 * u;
  const nx = Math.cos(f.turn * Math.PI / 180);   // the way the cloth travels
  const nz = Math.sin(f.turn * Math.PI / 180);
  for (let i = 0; i < arr.length; i += 3) {
    const c = arr[i] * nx + arr[i + 2] * nz;     // how far along that way
    const s = (c - f.at) * f.side;
    if (s <= 0) continue;
    const t = Math.min(1, s / soft);
    const a = ang * (t * t * (3 - 2 * t))    // eased across the crease's width
              + SAG * (s / SIDE) * Math.sin(ang);   // and it hangs as it turns
    const d = s, y = arr[i + 1];
    // turn (d, y) about the crease, in the plane across it
    const nd = d * Math.cos(a) - y * Math.sin(a);
    const ny = d * Math.sin(a) + y * Math.cos(a);
    const move = (nd - d) * f.side;          // along the normal, both axes
    arr[i] += move * nx;
    arr[i + 2] += move * nz;
    // a layer folded UNDER goes below what it was folded under, and the
    // thickness comes in ACROSS the crease rather than at it: given to the
    // whole moving side at once it made a 0.3mm step exactly where the two
    // skins meet, and the fold's edge came out serrated.
    arr[i + 1] = ny + LIFT * u * t * (f.deg < 0 ? -1 : 1);
  }
}
function set(fold, sub, uOver) {
  const arr = pos.array;
  arr.set(flat);
  for (let k = 0; k < FOLDS.length; k++) {
    const u = uOver ? uOver[k] : (k < fold ? 1 : (k === fold ? sub : 0));
    if (u <= 0) continue;
    if (FOLDS[k].orient) {
      resolveOrient(arr, FOLDS[k]);
      applyOrient(arr, FOLDS[k], u);
      continue;
    }
    resolve(arr, FOLDS[k]);                 // where this crease falls, if auto
    applyFold(arr, FOLDS[k], u, k);
    // THE SAME MOVEMENT, not a second one: the cloth comes level as it is
    // folded. Applied after the fold rather than before, because a rigid turn
    // of the result is exact and turning the crease mid-fold is not.
    if (FOLDS[k].spin === "flat") {
      if (FOLDS[k].lay === undefined) {
        // bring the crease to lie along x, and choose the half turn that
        // leaves the body of the cloth BELOW it, so that the quarter turn
        // after it puts the long side on the left
        const nx = Math.cos(FOLDS[k].turn * Math.PI / 180);
        const nz = Math.sin(FOLDS[k].turn * Math.PI / 180);
        let lay = -Math.atan2(nx, -nz);     // the crease's own direction to 0
        let cx = 0, cz = 0, n = 0;
        for (let i = 0; i < arr.length; i += 3) {
          const sgn = (arr[i] * nx + arr[i + 2] * nz) - FOLDS[k].at;
          if (sgn > 0) continue;            // the half that stays
          cx += arr[i]; cz += arr[i + 2]; n++;
        }
        cx /= n || 1; cz /= n || 1;
        const mx = FOLDS[k].at * nx, mz = FOLDS[k].at * nz;
        const rz = Math.sin(lay) * (cx - mx) + Math.cos(lay) * (cz - mz);
        if (rz < 0) lay += Math.PI;
        // AND BY THE SHORT WAY ROUND. Either half turn leaves the crease
        // level; the one that puts the body below it can be written as 225
        // degrees or as -135, and they end in the same place. He saw the
        // difference: "je vois que le fukusa pivote plus que de necessaire."
        while (lay > Math.PI) lay -= 2 * Math.PI;
        while (lay < -Math.PI) lay += 2 * Math.PI;
        FOLDS[k].lay = lay;
        FOLDS[k].lx = mx; FOLDS[k].lz = mz;
      }
      turnAll(arr, FOLDS[k].lx, FOLDS[k].lz, FOLDS[k].lay * u);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
}
    function reset() {
      FOLDS.forEach((f) => { if (f.auto) { f.turn = undefined; f.lay = undefined; }
                             if (f.orient !== undefined) f.ang = undefined; });
      BANDS = null;
    }
    set(0, 0, null);
    return { mesh: silk, geo: geo, FOLDS: FOLDS, want: WANT, list: LIST_NAME,
             set: set, reset: reset, SIDE: SIDE, W: W, H: H,
             // what it was actually built with, so a readout cannot drift
             // from it: the bench printed its own URL defaults and said 6mm
             // while the cloth was folding at 7
             soft: SOFT * 1000, lift: LIFT * 1000, ramp: RAMP, n: N };
  }

  global.FUKUSA = { make: make };
})(this);
