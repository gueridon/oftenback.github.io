// dogu-objects.js
// ---------------------------------------------------------------------------
// The tea utensils, and the four tools that build them.
//
// These used to live inside dogu.html, which was fine while only that page
// showed them. They come out here because the tea room at the end of the roji
// walk should hold the REAL objects rather than the placeholder cylinder it
// has now, and at their true relative size. Two pages cannot share geometry
// that is written inside one of them.
//
// The block depends on nothing but THREE. Every mention of a camera or a
// renderer inside it is in a comment, which was worth checking before cutting:
// a build() that quietly reached for the page's camera would have worked in
// dogu.html and thrown in the room.
//
// Sizes are in METRES and they are real. A natsume is 67mm across and a kama
// is 250, and that difference is the whole reason for moving this file.
// ---------------------------------------------------------------------------
(function (global) {
  "use strict";

  // ---- the objects --------------------------------------------------------
  // Almost every utensil is a solid of revolution -- a bowl, a caddy, a water
  // jar, a waste vessel, a lid rest -- so one lathe builds most of the
  // chapter. The scoop and the whisk are the two that are not, and they will
  // need their own hands.
  const HARM = [1, 2, 3, 5];
  function hash3(x, y, z) {
    const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return v - Math.floor(v);
  }
  // Chaikin's corner cut: every join in a profile is replaced by two points
  // at a quarter and three quarters of it, so a hand-drawn outline of eight
  // points becomes a curve with no crease anywhere on it.
  function chaikin(prof, rounds) {
    let p = prof;
    for (let n = 0; n < (rounds || 3); n++) {
      const q = [p[0]];
      for (let i = 0; i < p.length - 1; i++) {
        const a = p[i], b = p[i + 1];
        q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
        q.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      q.push(p[p.length - 1]);
      p = q;
    }
    return p;
  }
  // A lathe whose section is never a true circle. The profile runs UP the
  // outside, over the rim and back DOWN the inside to the centre, so the
  // thing that comes out is a shell and you can see into it -- which for a
  // tea bowl is most of the point.
  function lathe(profRaw, sides, seed, wob, rimWave, grain) {
    const prof = chaikin(profRaw, 3);
    const W = (wob === undefined) ? 1 : wob;
    // Orders 2, 3, 5, 7 rather than 1: order 1 just moves the whole section
    // off centre, while 2 and 3 are what a pair of hands pressing a wall
    // actually leaves. And the phase drifts with height, so the dents lean
    // and wander instead of running as vertical flutes.
    const H = [2, 3, 5, 7].map((k, i) => ({
      k, a: [0.030, 0.021, 0.011, 0.007][i] * W,
      p: hash3(seed, k * 2.7, 3.3) * Math.PI * 2,
    }));
    // The FOOT is the roughest part of a raku bowl and the most deliberately
    // so: it is not turned, it is cut away with a knife while the clay is
    // leather hard, and the marks are left. So the dents do not have one
    // amplitude everywhere -- they grow toward the base.
    const shape = (t, y, maxY) => {
      const low = Math.pow(Math.max(0, 1 - y / Math.max(1e-6, maxY)), 2.2);
      const amp = 1 + 1.5 * low;
      let m = 1;
      for (const q of H) m += q.a * amp * Math.sin(q.k * t + q.p + y * 8.5);
      // the knife facets: a faster, harder ripple that exists only at the foot
      m += 0.026 * W * low * low * Math.sin(9 * t + H[0].p * 1.7);
      return m;
    };
    // The rim of a raku bowl is never level -- it is the first thing the
    // reference photograph says. The wave is applied to the HEIGHT, and only
    // near the top, so the wall keeps its own shape while the lip rides up
    // and down. Both the outer and the inner lip move together, because both
    // are the same distance from the turn of the profile.
    const maxY = prof.reduce((m, q) => Math.max(m, q[0]), 0);
    const rw = (rimWave === undefined) ? 0 : rimWave;
    const rp = [hash3(seed, 4.4, 1.1) * 6.2832, hash3(seed, 5.5, 1.1) * 6.2832,
                hash3(seed, 6.6, 1.1) * 6.2832];
    const wave = (t) => rw * (0.62 * Math.sin(2 * t + rp[0]) + 0.38 * Math.sin(3 * t + rp[1]));
    // The foot does not sit flat either. A raku bowl rocks a little, and the
    // rocking is a smaller thing than the rim's wave: a quarter of it.
    const base = (t) => rw * 0.26 * Math.sin(2 * t + rp[2]);
    // A SLOW swell up the shape, not noise. This was hash3(seed, round(y*900))
    // -- and over a hundred profile rings that rounds to a different integer
    // almost every time, so every ring got its own random radius and the bowl
    // came out corrugated. Sines in y instead: about half a cycle over the
    // height of a bowl, which is a hand-built wall rather than a rippled one.
    const dp = [hash3(seed, 1.7, 9.3) * 6.2832, hash3(seed, 2.9, 9.3) * 6.2832];
    const drift = (y) => 1 + 0.030 * W *
      (0.62 * Math.sin(y * 38 + dp[0]) + 0.38 * Math.sin(y * 61 + dp[1]));
    // GRAIN. Painting pits into the vertex colour did nothing, and the reason
    // is simple enough to be worth writing: a pit that is only a dark spot
    // does not catch the light differently, so it is a stain, not a hollow.
    // Roughness has to be relief. This is an absolute displacement in metres,
    // not a fraction of the radius, so the lumps stay the same size all the
    // way down instead of shrinking to nothing at the foot.
    const gp = [hash3(seed, 7.1, 2.2) * 6.2832, hash3(seed, 8.2, 2.2) * 6.2832,
                hash3(seed, 9.3, 2.2) * 6.2832];
    const GA = (grain === undefined) ? 0 : grain;
    //
    // The frequencies matter more than the amplitude. My first attempt used
    // 23 and 41 per metre, which over a 78mm bowl is two or three undulations
    // from foot to lip: that is not grain, it is a gentle warp, and it read
    // as diagonal smears. Grain means features of a few millimetres, so the
    // vertical frequencies have to be in the hundreds per metre. The ceiling
    // is the mesh: 96 sides can carry about 48 cycles around, and the rings
    // about 450 per metre, so anything finer would alias rather than appear.
    const grainAt = (t, y) => GA * (
        0.50 * Math.sin(11 * t + 190 * y + gp[0]) * Math.sin(150 * y + gp[1])
      + 0.32 * Math.sin(23 * t + gp[2]) * Math.sin(300 * y + gp[0])
      + 0.18 * Math.sin(37 * t + 240 * y + gp[1]));
    const ring = (y, r) => {
      const out = [];
      const near = Math.pow(Math.max(0, y / Math.max(1e-6, maxY)), 3);
      const low = Math.pow(Math.max(0, 1 - y / Math.max(1e-6, maxY)), 5);
      for (let s = 0; s < sides; s++) {
        const t = s / sides * Math.PI * 2;
        const rr = r * shape(t, y, maxY) * drift(y) + grainAt(t, y);
        out.push([Math.cos(t) * rr, y + wave(t) * near + base(t) * low, Math.sin(t) * rr]);
      }
      return out;
    };
    // INDEXED, and this is not an optimisation: computeVertexNormals() on a
    // non-indexed geometry gives every triangle its own normal, which IS flat
    // shading no matter what the material says. The bowl came out ribbed with
    // 44 vertical facets and setting flatShading:false could never have fixed
    // it, because the flatness was already baked into the normals. Sharing
    // the vertices lets the normals average, including across the seam where
    // the last column meets the first.
    const pos = [], idx = [];
    for (let i = 0; i < prof.length; i++) {
      const r = ring(prof[i][0], prof[i][1]);
      for (let s = 0; s < sides; s++) pos.push(r[s][0], r[s][1], r[s][2]);
      if (i === 0) continue;
      const a = (i - 1) * sides, b = i * sides;
      for (let s = 0; s < sides; s++) {
        const n = (s + 1) % sides;
        idx.push(a + s, a + n, b + n, a + s, b + n, b + s);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  const toLin = (q) => (q <= 0.04045 ? q / 12.92 : Math.pow((q + 0.055) / 1.055, 2.4));
  // Weathered glaze, by vertex. Vertex colours are consumed LINEAR while a
  // material hex is sRGB, so these are converted rather than handed over raw.
  function glaze(geo, seed, lo, hi, mot, flash, flashAt, flashW, pits, hmix) {
    const p = geo.attributes.position;
    const rgb = new Float32Array(p.count * 3);
    let minY = 1e9, maxY = -1e9;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < minY) minY = y; if (y > maxY) maxY = y; }
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const f = (y - minY) / Math.max(1e-6, maxY - minY);
      // Sampled from x and z ONLY, this came out as vertical stripes -- the
      // same mistake as the roji stones. A product of sines in the two
      // horizontal axes is constant up any vertical line, so on a tall object
      // it paints flutes. The height has to be in the sample.
      const n = 0.5 + 0.42 * Math.sin(x * 190 + seed) * Math.sin(z * 173 + seed * 1.7)
                     * Math.sin(y * 145 + seed * 2.3)
              + 0.20 * Math.sin(y * 88 + x * 41 + seed * 3.1)
              + 0.30 * (hash3(Math.round(x * 700), Math.round(y * 700), seed) - 0.5);
      // hmix decides how much of the VALUE comes from the height and how
      // much from the mottle. At the default 0.75 the result is a gradient
      // with a little noise on it, which is right for a glaze that ran down a
      // pot. An old bamboo skin is the other case entirely: nearly black with
      // big pale patches worn through it, and no gradient at all. Drop hmix
      // and the patches take over.
      const hm = (hmix === undefined) ? 0.75 : hmix;
      const k = Math.max(0, Math.min(1, f * hm + (1 - hm) * n));
      // Pitting, separate from the mottle: a raku glaze is not smooth, it is
      // full of small craters where the gas left it. A crater reads DARK, so
      // this only ever subtracts, and it is sparse -- a pit here and there,
      // not an even grain. The quantum is 0.6mm, fine enough on a 116mm bowl
      // to read as a texture rather than as patches.
      let pit = 0;
      if (pits) {
        const h = hash3(Math.round(x * 1700), Math.round(z * 1700), seed + 9.1);
        const h2 = hash3(Math.round(y * 1700), Math.round(x * 1700), seed + 4.3);
        const q = h * 0.55 + h2 * 0.45;
        if (q > 0.72) pit = pits * (q - 0.72) / 0.28;
      }
      const m = (1 + (mot === undefined ? 0.10 : mot) * (n - 0.5)) * (1 - pit);
      // The oxblood flash: kuro-raku takes it on one side only, where the
      // fire caught it, and it fades out rather than ending.
      let fl = 0;
      if (flash) {
        const az = Math.atan2(z, x);
        let d = Math.abs(((az - flashAt + Math.PI) % (Math.PI * 2)) - Math.PI);
        fl = Math.max(0, 1 - d / (flashW || 1.15));
        fl = fl * fl * (0.45 + 0.55 * n) * (0.35 + 0.65 * f);
      }
      for (let c = 0; c < 3; c++) {
        const base = (lo[c] + (hi[c] - lo[c]) * k) * m;
        rgb[i * 3 + c] = toLin(Math.max(0, Math.min(1, base + (flash ? (flash[c] - base) * fl : 0))));
      }
    }
    geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3));
    return geo;
  }

  // ---- the chapter's objects ---------------------------------------------
  const OBJECTS = [
    {
      key: "chawan", jp: "茶碗", rom: "chawan", scale: 1,
      desc: "The bowl. Held in both hands, turned a quarter before drinking " +
            "so that the front of it is not put to the mouth. A raku bowl is " +
            "built by hand rather than thrown, which is why no two are the " +
            "same shape and why the rim is never quite level.",
      build() {
        // From the reference: the silhouette is a CYLINDER, not a hemisphere.
        // The wall rises almost straight from a narrow low foot, with a slight
        // waist at mid height and a slight belly under the lip, and the whole
        // thing is about two thirds as tall as it is wide. My first bowl was a
        // hemisphere and read as a serving dish.
        //
        // Up the outside, over the rim, and back down the inside: one profile
        // makes a shell, and a bowl you cannot see into is not a bowl.
        // The foot is CUT, not turned. Chaikin rounded it into a bead, so the
        // corners are doubled: a repeated control point survives the corner
        // cut almost intact, which is the cheap way to keep an edge sharp in
        // a curve that is smooth everywhere else. And the underside is
        // hollowed, the way a knife leaves it.
        const g = lathe([
          [0.0040, 0.0000], [0.0036, 0.0120], [0.0009, 0.0205],
          [0.0000, 0.0235], [0.0000, 0.0235],
          [0.0062, 0.0268], [0.0062, 0.0268],
          [0.0106, 0.0214], [0.0106, 0.0214],
          [0.016, 0.036], [0.024, 0.050], [0.032, 0.055], [0.045, 0.0555],
          [0.058, 0.0575], [0.070, 0.0585], [0.078, 0.0575],   // the lip
          [0.074, 0.0525], [0.060, 0.0505], [0.044, 0.0495],
          [0.028, 0.043], [0.016, 0.026], [0.013, 0.000],      // the inside floor
        ], 96, 11.3, 1.0, 0.0032, 0.00075);
        // Kuro-raku is BLACK, and the first attempt came out red-brown all
        // over. The flash was not the cause: measured, the flashed sector
        // faced away from the camera. The cause was the light. On a nearly
        // neutral dark object there is almost no colour of its own left to
        // reflect, so the warm cream of the key light IS the colour you see.
        // The answer is to give the glaze a faint COOL bias, which the warm
        // light then cancels, and to keep the diffuse almost black so that
        // the brightness comes from the specular highlight instead of from a
        // vertical ramp painted into the vertices.
        glaze(g, 3.1, [0.028, 0.028, 0.032], [0.112, 0.108, 0.120], 0.34,
              [0.335, 0.115, 0.080], 1.05, 0.90, 0.85);
        return new THREE.Mesh(g, new THREE.MeshStandardMaterial({
          // NOT flatShading. It is the house language for architecture and
          // foliage, but on a hand-built pot every profile ring became a
          // visible band and the bowl read as a stack of machined discs.
          // And a raku glaze is GLOSSY: the highlight is half of what makes
          // it read as fired rather than as painted.
          color: 0xffffff, vertexColors: true, flatShading: false,
          // Rough, not polished. Raku is fired fast and pulled from the kiln
          // hot, and the surface it comes out with is closer to stone than to
          // lacquer. At 0.27 it read as a glossy manufactured thing; the room
          // reflection is still what gives it life, only broader and softer.
          roughness: 0.48, metalness: 0.03, side: THREE.DoubleSide,
        }));
      },
    },
    {
      key: "set", jp: "一式", rom: "all of them", flat: true,
      build() {
        // The one view that tells the truth about size. Every other entry in
        // this chapter fills the frame, so a caddy of 67mm and a kettle of 250
        // look alike. Here nothing is scaled: the nine stand in a single line
        // on a tray, in the order they are used, and the frame is whatever
        // contains them. The whisk stands beside the bowl rather than in it, so
        // that it can be measured against the rest like everything else.
        const make = (k) => OBJECTS.find((o) => o.key === k).build();

        // Seven places, not nine: two of them are PAIRS, because two of these
        // objects are never set down alone. The scoop lies on the caddy's lid
        // and the ladle rests on the lid rest, and showing them so costs
        // nothing here and says something. Only the whisk is taken out of the
        // bowl, so that it can be measured against the rest.
        //
        // left and right are each place's reach from its own anchor, which is
        // not the middle wherever something lies down.
        const PLACE = [
          { L: 0.0925, R: 0.0925, put: (at) => {
              add("natsume", at, 0, 0);
              add("chashaku", at, 0.0722, 0);            // on the lid
            } },
          { L: 0.0580, R: 0.0580, put: (at) => add("chawan", at, 0, 0) },
          { L: 0.0280, R: 0.0280, put: (at) => add("chasen", at, 0, 0) },
          { L: 0.0725, R: 0.0725, put: (at) => add("kensui", at, 0, 0) },
          { L: 0.0300, R: 0.3208, put: (at) => {
              // the ladle on its rest, the tilt solved from its two contacts
              const m = add("hishaku", at, 0.06615, 0);
              m.rotation.z = -0.7545;
              add("futaoki", at + 0.010, 0, 0);
            } },
          { L: 0.1250, R: 0.1250, put: (at) => add("kama", at, 0, 0) },
          { L: 0.0885, R: 0.0885, put: (at) => add("mizusashi", at, 0, 0) },
        ];
        const GAP = 0.055;   // room to breathe between one thing and the next
        const g = new THREE.Group();
        const add = (k, x, y, z) => {
          const m = make(k);
          m.position.set(x, y, z);
          g.add(m); return m;
        };
        const total = PLACE.reduce((a, q) => a + q.L + q.R, 0) + GAP * (PLACE.length - 1);
        let x = -total / 2;
        for (const p of PLACE) { p.put(x + p.L); x += p.L + p.R + GAP; }

        // and the tray, cut to the line it carries: built after the objects so
        // it can be measured to them rather than guessed at.
        const box = new THREE.Box3().setFromObject(g);
        const sz = box.getSize(new THREE.Vector3());
        const ctr = box.getCenter(new THREE.Vector3());
        const tray = new THREE.Mesh(
          new THREE.BoxGeometry(sz.x + 0.075, 0.011, Math.max(sz.z, 0.170) + 0.075),
          new THREE.MeshStandardMaterial({
            color: 0xcfc4a2, roughness: 0.86, metalness: 0.0,
          }));
        tray.position.set(ctr.x, -0.0056, 0);
        g.add(tray);
        return g;
      },
      // No pose: this one is not turned in the hands. It tips on a single
      // horizontal axis, and the viewer owns that.
    },
    {
      key: "natsume", jp: "棗", rom: "natsume",
      desc: "The caddy for thin tea, and the opposite of the bowl in every " +
            "way: turned on a lathe, perfectly round, lacquered black and " +
            "polished until it reflects the room. Named after the jujube " +
            "fruit whose shape it takes. The lid comes off in one movement " +
            "and is set down without a sound.",
      build() {
        // LACQUER, not clay, and the whole point of this object next to the
        // raku bowl is that it is perfect. So every irregularity the lathe can
        // make is switched off: wob 0, no rim wave, no grain. It is the only
        // object here that is exactly a surface of revolution.
        //
        // Two solids, not one shell. A natsume is closed, so there is nothing
        // to see inside and the profile can run from the centre of the base to
        // the centre of the top, which revolves into a sealed form.
        const lac = () => new THREE.MeshStandardMaterial({
          // No vertex colours at all. Lacquer has no mottle: its entire
          // variation is reflected light, which is why the room matters more
          // here than on any other object.
          color: 0x0e0d0f, roughness: 0.085, metalness: 0.0,
          side: THREE.DoubleSide,
        });
        const g = new THREE.Group();
        // the body, closing flat under the lid
        g.add(new THREE.Mesh(lathe([
          [0.0000, 0.0000],
          [0.0000, 0.0290], [0.0000, 0.0290],
          [0.0030, 0.0322], [0.0030, 0.0322],
          [0.0120, 0.0329], [0.0230, 0.0331], [0.0320, 0.0330],
          [0.0358, 0.0328], [0.0358, 0.0328],
          [0.0358, 0.0250], [0.0358, 0.0000],
        ], 96, 4.7, 0), lac()));
        // the lid, a hair wider than the body and a fifth of a millimetre
        // clear of it. That gap IS the seam: on a real natsume the join reads
        // as one dark hairline, and modelling the two pieces as touching
        // would have given a join that disappears wherever the light is even.
        g.add(new THREE.Mesh(lathe([
          [0.0362, 0.0000], [0.0362, 0.0250],
          [0.0362, 0.0334], [0.0362, 0.0334],
          [0.0450, 0.0335], [0.0530, 0.0334], [0.0580, 0.0328],
          [0.0612, 0.0300], [0.0632, 0.0235], [0.0642, 0.0140],
          [0.0645, 0.0000],
        ], 96, 8.2, 0), lac()));
        return g;
      },
    },
    {
      key: "chasen", jp: "茶筅", rom: "chasen",
      desc: "The whisk. One piece of bamboo, split above the node into " +
            "eighty fine slivers and then split again inward, so the ring " +
            "you see is only the outside of it. The tips are curled by hand " +
            "over heat. It is used until it breaks and then it is not " +
            "mended: a chasen has a working life of a few months.",
      build() {
        // The first object here that is NOT a lathe. A whisk has no axis of
        // revolution: it has a hundred and twelve separate slivers, each one
        // a curve of its own.
        //
        // Each tine is swept in the PLANE that contains the axis and the
        // tine's own bearing, then rotated into place. Building it that way
        // rather than as a general tube in space avoids the whole problem of
        // a moving reference frame twisting along the curve, because the
        // curve never leaves its plane. The cross section is an ellipse,
        // wider across than through, which is what a split sliver is.
        const bamboo = new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.42,
          metalness: 0.0, side: THREE.DoubleSide,
        });

        const pos = [], idx = [], col = [];
        const NS = 6;                       // sides of the sliver
        const V = new THREE.Vector3();

        function tine(curveRaw, thick, wide, az, twist, c0, c1) {
          const cv = chaikin(curveRaw, 1);
          const base = pos.length / 3;
          for (let i = 0; i < cv.length; i++) {
            const f = i / (cv.length - 1);
            const r = cv[i][0], y = cv[i][1];
            const a = cv[Math.max(0, i - 1)], b = cv[Math.min(cv.length - 1, i + 1)];
            let tr = b[0] - a[0], ty = b[1] - a[1];
            const L = Math.hypot(tr, ty) || 1; tr /= L; ty /= L;
            const nr = -ty, ny = tr;        // the in-plane normal
            // The taper is not the same on both axes, and that is the whole
            // reason a chasen catches light the way it does. A sliver is cut
            // from the wall of the culm, so it starts thicker RADIALLY than
            // it is wide. Then it is shaved, and the shaving takes the radial
            // thickness away so the tine can bend: the tangential width
            // barely changes. The result is a flat ribbon whose broad face
            // looks outward. From outside you see its full width all the way
            // up; from the silhouette edge it nearly disappears. Tapering
            // both axes together, as I did first, gave wire instead.
            const th = thick * (1 - 0.80 * f - 0.14 * Math.pow(f, 5));
            const wd = wide * (1 - 0.16 * f);
            const aa = az + twist * f, ca = Math.cos(aa), sa = Math.sin(aa);
            for (let sg = 0; sg < NS; sg++) {
              const ph = sg / NS * Math.PI * 2;
              const rr = r + Math.cos(ph) * th * nr;
              const yy = y + Math.cos(ph) * th * ny;
              const db = Math.sin(ph) * wd;
              pos.push(rr * ca - db * sa, yy, rr * sa + db * ca);
              // The brown is concentrated in the first fifth, not spread
              // evenly: the dark skin is only on the root and the shaving
              // takes it off fast. A straight blend made the whole lower half
              // muddy.
              const cf = Math.pow(f, 0.42);
              for (let c = 0; c < 3; c++) col.push(toLin(c0[c] + (c1[c] - c0[c]) * cf));
            }
            if (i === 0) continue;
            const A = base + (i - 1) * NS, B = base + i * NS;
            for (let sg = 0; sg < NS; sg++) {
              const n = (sg + 1) % NS;
              idx.push(A + sg, A + n, B + n, A + sg, B + n, B + sg);
            }
          }
        }

        // The outer ring: up and out steeply, widest at about two thirds, then
        // back in, and the last few millimetres HOOK inward and slightly
        // down. That hook is the whole silhouette of a chasen -- it is put
        // there by hand, over heat, one tine at a time.
        // MEASURED, off a clean photograph on white (Kubo Sabun, black
        // bamboo). This is the fourth shape I have given this object and the
        // first one that came from numbers rather than from looking. The
        // three wrong ones are worth naming, because each was wrong in a
        // different direction: an onion that closed to a knot, then a flat
        // open mouth, then a tall egg, then a wine glass with the widest part
        // at the top. The truth: the head is 65 per cent of the whole height,
        // its widest point is 64 per cent of the way up ITSELF, and above
        // that the tines arch over in a DOME, closing to 58 per cent of the
        // maximum radius at the tips. Not a mouth, not an egg: a dome.
        //
        // Scale: 0.109mm per pixel, which puts the head at 56mm across and
        // the handle at 17mm. Only the ratios matter, since the object is
        // shown alone with nothing to give it size.
        const OUT = [
          [0.00880, 0.03500], [0.01223, 0.04131], [0.01565, 0.04718],
          [0.01913, 0.05305], [0.02234, 0.05892], [0.02506, 0.06479],
          [0.02696, 0.07066], [0.02794, 0.07653], [0.02745, 0.08240],
          [0.02522, 0.08827], [0.02201, 0.09414], [0.01636, 0.09707],
        ];
        // The inner ring is a narrow SPIRE up the middle, gathering to a
        // point above the outer tips. In the photograph it is the single
        // clearest feature of the whole object and I had it as a low whorl.
        const IN = [
          [0.00800, 0.03550], [0.00862, 0.04500], [0.00845, 0.05500],
          [0.00760, 0.06500], [0.00620, 0.07500], [0.00440, 0.08400],
          [0.00250, 0.09200], [0.00110, 0.09750], [0.00045, 0.10000],
        ];
        // Only the HANDLE is black bamboo. I had made the whole whisk dark,
        // which was wrong: the tines are the SPLIT INSIDE of the culm, and
        // the inside of a black bamboo is pale. They run brown at the root,
        // where the dark skin is still on them, through tan, to a pale gold
        // at the tips where the shaving has taken everything away.
        const ROOT = [0.440, 0.330, 0.190], TIP = [0.900, 0.820, 0.620];
        // Seventy outer, his count (七十本立), and it took a measurement to
        // believe it: a scan across the head finds only about twenty lines,
        // because EACH LINE IS TWO TINES. A tine at bearing t and one at
        // pi - t project to the same place, so a side view can never show
        // more than half of them, and the crowding at the edges hides more.
        // The smallest spacing found bounds the count at 67 or fewer per
        // half, which is exactly consistent with seventy.
        const NO = 70, NI = 30;
        for (let i = 0; i < NO; i++) {
          const h = hash3(i, 1, 7), h2 = hash3(i, 2, 7), h3 = hash3(i, 3, 7);
          const az = i / NO * Math.PI * 2 + (h - 0.5) * 0.030;
          const sc = 0.94 + h2 * 0.12, dy = (h3 - 0.5) * 0.0022;
          tine(OUT.map((q, j) => [q[0] * (j === 0 ? 1 : sc), q[1] + dy * j / 9]),
               0.00062, 0.00044, az, (h2 - 0.5) * 0.10, ROOT, TIP);
        }
        for (let i = 0; i < NI; i++) {
          const h = hash3(i, 4, 7), h2 = hash3(i, 5, 7);
          const az = i / NI * Math.PI * 2 + (h - 0.5) * 0.06;
          const sc = 0.90 + h2 * 0.18;
          tine(IN.map((q, j) => [q[0] * (j === 0 ? 1 : sc), q[1]]),
               0.00056, 0.00040, az, (h - 0.5) * 0.16, ROOT, TIP);
        }

        const tg = new THREE.BufferGeometry();
        tg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        tg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        tg.setIndex(idx);
        tg.computeVertexNormals();

        const g = new THREE.Group();
        g.add(new THREE.Mesh(tg, bamboo));

        // the handle: a bamboo cylinder with its node, and a whisper of wob,
        // because a culm is round but not machined round
        // Measured: 297 pixels long by 155 across, against a head of 594 by
        // 514. So the handle is a third of the whole and stout, and it is
        // very slightly WIDER at the top than at the cut end. The node sits
        // three quarters of the way up: above it the skin is smooth, below it
        // is where the blotching is.
        const hg = lathe([
          [0.0000, 0.0000], [0.0000, 0.0078], [0.0000, 0.0078],
          [0.0020, 0.0082], [0.0120, 0.0084], [0.0230, 0.0086],
          [0.0244, 0.0088], [0.0252, 0.0093], [0.0262, 0.0087],
          [0.0300, 0.0087], [0.0323, 0.0088], [0.0323, 0.0000],
        ], 40, 5.9, 0.10);   // a culm is round, only not machined round
        glaze(hg, 6.4, [0.048, 0.036, 0.028], [0.620, 0.510, 0.350], 0.30,
              undefined, 0, 0, 0, 0.10);
        g.add(new THREE.Mesh(hg, bamboo));

        // The ito, the thread that holds the outer ring apart from the inner
        // one. Three turns, at a radius that puts it AMONG the tines rather
        // than in front of them, which is where it actually sits: some slivers
        // pass outside it and some inside.
        // Orange cord, as he asked. On a black bamboo whisk it is the only
        // colour on the object, and it lands exactly where the eye already
        // goes: the waist, where the split begins.
        const thread = new THREE.MeshStandardMaterial({
          color: 0xc85f24, roughness: 0.80, metalness: 0.0,
        });
        // Four thin turns, not three fat ones: at 0.6mm they read as elastic
        // bands round a broom. Cotton thread is a third of that.
        [[0.0324, 0.0090], [0.0338, 0.0093], [0.0352, 0.0095],
         [0.0366, 0.0097]].forEach((q) => {
          const t = new THREE.Mesh(
            new THREE.TorusGeometry(q[1], 0.00062, 6, 64), thread);
          t.rotation.x = Math.PI / 2;
          t.position.y = q[0];
          g.add(t);
        });
        return g;
      },
    },
    {
      key: "chashaku", jp: "茶杓", rom: "chashaku",
      desc: "The scoop. One splinter of bamboo, steamed and bent, with the " +
            "node left standing in the middle of it. It carries about two " +
            "grams of powder. A host may cut one for a single gathering and " +
            "give it a name, which is why a chashaku can be the most " +
            "personal object in the room and the least valuable.",
      build() {
        // MEASURED, off four photographs: a clean top view for the width and
        // a side view for the bend, both of nakabushi scoops.
        //
        // The bend is an S, and I would not have guessed it. From the node
        // the shaft runs dead straight; then the piece drops BELOW the line
        // of the shaft, hollows out, and sweeps up into the blade whose tip
        // lifts again. I suspected the dip was an artefact of the pose, so I
        // straightened the photograph by its own fitted axis and looked: the
        // shaft is flat to under a pixel over the whole of its length, and
        // the dip is real, and deeper than the rise that follows it.
        const L = 0.185;                 // eighteen and a half centimetres
        const PX = 0.0002126;            // metres per pixel, side view

        // t runs 0 at the tip of the blade to 1 at the cut end.
        // n is the measured top edge, positive DOWNWARD.
        const BEND = [
          [0.000, -32.8], [0.022, -34.2], [0.045, -19.1], [0.067, -0.1],
          [0.090, 18.3], [0.112, 30.6], [0.135, 37.2], [0.157, 39.0],
          [0.180, 35.8], [0.202, 33.6], [0.258, 24.3], [0.303, 17.6],
          [0.337, 12.8], [0.371, 8.5], [0.404, 3.9], [0.449, 0.8],
          [0.500, 0.0], [1.000, 0.0],
        ];
        // Width, from the top view: widest just behind the rounded tip, then
        // a long even taper down to the node at 48 per cent, and dead
        // constant from the node to the cut end. Nothing widens AT the node.
        const WID = [
          [0.000, 0.00177], [0.020, 0.00480], [0.032, 0.00532],
          [0.100, 0.00500], [0.200, 0.00450], [0.300, 0.00405],
          [0.380, 0.00355], [0.450, 0.00320], [0.500, 0.00311],
          [0.960, 0.00311], [1.000, 0.00280],
        ];
        // Thickness is not measurable from these photographs (the shadow
        // merges with the underside), so it is the one thing here I have set
        // by hand: a shaft of two and a half millimetres thinning to about
        // one at the blade, which is what lets it be bent at all.
        const THK = [
          [0.000, 0.00042], [0.040, 0.00055], [0.160, 0.00075],
          [0.400, 0.00108], [0.470, 0.00125], [0.500, 0.00122],
          [1.000, 0.00118],
        ];
        const at = (tbl, t) => {
          for (let i = 1; i < tbl.length; i++) {
            if (t <= tbl[i][0]) {
              const a = tbl[i - 1], b = tbl[i];
              const f = (t - a[0]) / Math.max(1e-9, b[0] - a[0]);
              return a[1] + (b[1] - a[1]) * f;
            }
          }
          return tbl[tbl.length - 1][1];
        };

        // the centreline, sampled fine and then smoothed, so the measured
        // points do not leave creases in a piece that was bent over steam
        const N = 96;
        let cl = [];
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          cl.push([(t - 0.5) * L, -at(BEND, t) * PX, t]);
        }
        for (let r = 0; r < 2; r++) {
          const q = [cl[0]];
          for (let i = 0; i < cl.length - 1; i++) {
            const a = cl[i], b = cl[i + 1];
            q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25, a[2] * .75 + b[2] * .25]);
            q.push([a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75, a[2] * .25 + b[2] * .75]);
          }
          q.push(cl[cl.length - 1]);
          cl = q;
        }

        // The section is a rounded RECTANGLE, not an ellipse: a splinter of
        // bamboo has a flat face and a flat back, and it is the flat face
        // catching the light along its whole length that says bamboo. A
        // superellipse of exponent four gives it without a special case.
        const NS = 14, EX = 0.5;
        const pos = [], idx = [], col = [];
        const ring = (i, scale) => {
          const P = cl[i], t = P[2];
          const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
          let tx = b[0] - a[0], ty = b[1] - a[1];
          const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
          const nx = -ty, ny = tx;                  // in-plane normal
          const w = at(WID, t) * scale, h = at(THK, t) * scale;
          // The blade is DISHED, so it can hold powder: the section bows up
          // toward its edges over the last sixth of the length. The amount is
          // ABSOLUTE, not a fraction of the width. Taken as a fraction it
          // came to 1.3mm of lift on a blade 0.55mm thick, which curled the
          // section into a channel and the whole scoop came out as a club.
          const dish = Math.max(0, 1 - t / 0.16) * 0.00048;
          const base = pos.length / 3;
          for (let sg = 0; sg < NS; sg++) {
            const ph = sg / NS * Math.PI * 2;
            const cp = Math.cos(ph), sp = Math.sin(ph);
            const u = h * Math.sign(cp) * Math.pow(Math.abs(cp), EX);
            const v = w * Math.sign(sp) * Math.pow(Math.abs(sp), EX);
            const q = v / Math.max(1e-9, w);
            const uu = u + dish * q * q;
            pos.push(P[0] + uu * nx, P[1] + uu * ny, v);
            // pale bamboo, with the node standing as a dark line at 48 per
            // cent and a faint lengthwise striation
            const node = Math.max(0, 1 - Math.abs(t - 0.480) / 0.011);
            // The striation runs ALONG the piece, because that is the way
            // the fibre runs. Varying it with t instead put fine rings round
            // the shaft and the scoop came out corrugated like a screw.
            const g = 0.905 - 0.055 * Math.abs(v) / Math.max(1e-9, w)
                      + 0.020 * Math.sin(sg * 2.7 + 1.3)
                      + 0.010 * Math.sin(sg * 5.1);
            const k = 1 - 0.72 * node * node;
            col.push(toLin(g * k), toLin(g * 0.905 * k), toLin(g * 0.690 * k));
          }
          return base;
        };
        const caps = [0, cl.length - 1];
        const bases = [];
        bases.push(ring(0, 0.02));                  // a collapsed cap, so the
        for (let i = 0; i < cl.length; i++) bases.push(ring(i, 1));
        bases.push(ring(cl.length - 1, 0.02));      // ends are closed
        for (let s = 1; s < bases.length; s++) {
          const A = bases[s - 1], B = bases[s];
          for (let sg = 0; sg < NS; sg++) {
            const n = (sg + 1) % NS;
            idx.push(A + sg, A + n, B + n, A + sg, B + n, B + sg);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.50,
          metalness: 0.0, side: THREE.DoubleSide,
        }));
        // Stood UPRIGHT, the way his fourth photograph shows it, and not
        // only because it fills a square frame better. The idle turn is about
        // the world's vertical axis: lying across the frame, the scoop swept
        // round like a propeller and spent most of its time as a thin line or
        // a dot. Standing on end, that same turn rotates it about its OWN
        // long axis, so it shows the flat face, then the profile, then the
        // face again, and the whole length stays visible throughout.
        // A rotation, not an axis swap: swapping two axes is a reflection and
        // would have turned the surface inside out.
        return m;      // natural: lying flat, the bend in y, the width in z
      },
      // The POSE is kept OUT of the geometry. build() returns the object in
      // its natural attitude, sitting on y = 0 as it would sit on a mat, and
      // pose() is only how this chapter chooses to show it alone in a square
      // frame. A tea room can then lay the same object down and ignore all of
      // this. Baking the presentation into the mesh was the one thing that
      // would have made these objects unusable anywhere else.
      pose(o) {
          o.rotation.z = -Math.PI / 2;
          // And turned to three quarters, because edge on the blade is a line
          // and you cannot see that it is a scoop at all. The bend lives in one
          // plane and the width in the other, so any view that shows one of
          // them squarely hides the other: the only view that carries both is
          // an oblique one. Wrapped in a group so the standing and the turning
          // are two separate rotations and neither fights the other.
          // Two nested groups, because the compromise is on a single knob
          // otherwise. Standing it up puts the length along Y, the bend along X
          // and the width along Z: from a camera on Z you see the S perfectly
          // and the width edge on, and turning it about its own length trades
          // one for the other. There is no angle on that one axis that gives
          // both.
          // The way out is to LEAN it, so the camera, which sits only nine
          // degrees above the horizon, looks down the length a little. Then the
          // S is foreshortened rather than hidden and the flat face opens up:
          // it is the view his third photograph takes.
          const spin = new THREE.Group(); spin.add(o); spin.rotation.y = -0.80;   // the sign matters: see the note below
          const lean = new THREE.Group(); lean.add(spin); lean.rotation.x = -0.42;
          // On the sign: standing the scoop on end means its hollow opens
          // SIDEWAYS, not upward, so which way it is turned decides whether you
          // see into the scoop or at the back of it. The first sign I chose
          // turned the hollow away from the camera and the blade read as a bent
          // rod. The geometry was never wrong -- I measured it on the built
          // mesh, 10.3mm wide by 1.2mm thick, exactly the photograph -- only
          // the direction it faced.
          return lean;
      },
    },
    {
      key: "kensui", jp: "建水", rom: "kensui",
      desc: "The waste water. What the bowl is rinsed into, and the one " +
            "vessel in the room that is allowed to be plain, because the " +
            "guests are not meant to look at it: it stands behind the host " +
            "and leaves first. Free in form and in material, so this is one " +
            "kensui and not the kensui.",
      build() {
        // Profile measured off a photograph by GRADIENT rather than by
        // threshold. A streaked glaze defeats a threshold: the pale runs read
        // as background and the dark ones as shadow, and every fixed cut I
        // tried lost either the neck or the belly. The edge of the pot is not
        // a brightness, it is a brightness STEP, and that survives whatever
        // colour happens to be running down the wall at that height.
        //
        // 145mm across by 107mm tall, so wider than tall. Widest at 43 per
        // cent of the height, a neck drawn in to 78 per cent of that radius
        // at 86 per cent of the height, and an everted rolled lip at 87.
        const RM = 0.0725, HH = 0.1070;
        const FTOP = 0.0059, FR = 0.0419;        // where the glaze stops
        // the outer wall, as fractions of height and of the belly radius
        const OUT = [
          [0.055, 0.578], [0.100, 0.690], [0.160, 0.795], [0.240, 0.885],
          [0.320, 0.945], [0.400, 0.995], [0.450, 1.000], [0.520, 0.985],
          [0.600, 0.960], [0.680, 0.915], [0.760, 0.850], [0.820, 0.800],
          [0.860, 0.777], [0.900, 0.790], [0.945, 0.830], [0.975, 0.862],
          [1.000, 0.870],
        ];
        const prof = OUT.map((q) => [q[0] * HH, q[1] * RM]);
        const outerAt = (y) => {
          if (y <= prof[0][0]) return prof[0][1];
          for (let i = 1; i < prof.length; i++) {
            if (y <= prof[i][0]) {
              const a = prof[i - 1], b = prof[i];
              return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0]);
            }
          }
          return prof[prof.length - 1][1];
        };

        // Two pieces, because the foot is UNGLAZED and the body is wet: one
        // material cannot be both, since roughness is per material and not
        // per vertex. They meet on a shared ring, and both are lathed with
        // wob 0 so the two surfaces land on exactly the same circle there.
        // A thrown pot is round anyway; the wobble belongs to the raku bowl.
        const body = prof.concat([
          [0.1076, 0.0620], [0.1064, 0.0606],          // over the rolled lip
          [0.1000, 0.0560], [0.0900, 0.0520],          // down the inside
          [0.0800, 0.0570], [0.0700, 0.0625], [0.0600, 0.0655],
          [0.0500, 0.0672], [0.0400, 0.0660], [0.0300, 0.0610],
          [0.0200, 0.0520], [0.0140, 0.0400], [0.0110, 0.0200],
          [0.0105, 0.0000],
        ]);
        const bg = lathe(body, 84, 7.7, 0);
        const fg = lathe([
          [0.0012, 0.0000], [0.0010, 0.0180], [0.0004, 0.0330],
          [0.0000, 0.0400], [0.0000, 0.0400],
          [FTOP, FR], [FTOP, FR],
        ], 84, 7.7, 0);

        // ---- the glaze --------------------------------------------------
        // Streaks, which glaze() cannot do: it varies with height and with a
        // mottle, and a running glaze varies with AZIMUTH.
        //
        // My first attempt summed four sines in the bearing and came out as
        // even vertical stripes: a melon, not a pot. Regular frequencies make
        // a regular pattern however many you add, if there are only four of
        // them. What a poured glaze needs is NOISE in the bearing, and the
        // way to get noise that still closes seamlessly round the pot is a
        // sum of many sines on INTEGER harmonics with random phases and an
        // amplitude falling off with the harmonic: fractal noise on a circle.
        // Twelve harmonics from 3 to 41 gives streaks of unequal width and
        // unequal spacing, and the wide ones are wide because two harmonics
        // happened to agree there, which is exactly how a real run happens.
        const HARM = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
        const AMP = HARM.map((n) => 0.66 / Math.pow(n, 0.82));
        const PHS = HARM.map((n, i) => hash3(i, 3.7, 9.4) * 6.2832);
        const DRF = HARM.map((n, i) => 0.35 + hash3(i, 8.1, 2.6) * 1.1);
        const K = [
          [0.070, 0.064, 0.046],    // near black, where it is thickest
          [0.185, 0.180, 0.088],    // dark olive
          [0.620, 0.510, 0.190],    // ochre
          [0.800, 0.700, 0.320],    // the pale runs
        ];
        const RUST = [0.500, 0.235, 0.080];
        const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t,
                                  a[1] + (b[1] - a[1]) * t,
                                  a[2] + (b[2] - a[2]) * t];
        function paint(geo) {
          const pa = geo.attributes.position;
          const rgb = new Float32Array(pa.count * 3);
          for (let i = 0; i < pa.count; i++) {
            const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
            const r = Math.hypot(x, z), A = Math.atan2(z, x);
            const f = Math.max(0, Math.min(1, y / HH));
            // the fractal field, each harmonic wandering at its own rate as
            // it runs down, so a streak leans and does not stay a stripe
            let a = 0;
            for (let k = 0; k < HARM.length; k++)
              a += AMP[k] * Math.sin(HARM[k] * A + PHS[k] + f * DRF[k]);
            // A run is not equally strong all the way down: it gathers here
            // and thins out there. A slow second field turns the noise up and
            // down, which is what stops the streaks reading as painted lines.
            const env = 0.42 + 0.34 * Math.sin(A * 4 + 0.9)
                             + 0.24 * Math.sin(A * 2 - f * 3.0 + 2.4);
            // A running glaze POOLS: thin and pale where it was pulled over
            // the shoulder, thick and dark where it gathered above the foot.
            let sv = 0.56 + a * (0.40 + 0.42 * Math.max(0, env))
                          + (f - 0.45) * 0.28
                          // fine grain, and it must run VERTICALLY. Keyed on
                          // the height it made nine horizontal rings round
                          // the pot: the same trap as the roji stones and the
                          // chasen tines. A poured glaze has no rings.
                          + 0.022 * Math.sin(A * 137 + y * 40);
            sv = Math.max(0, Math.min(1, sv));
            // The pale runs are FEW: they need a high value to appear at all,
            // so most of the pot stays dark olive and only a handful of runs
            // come up to ochre.
            let c = sv < 0.40 ? mix(K[0], K[1], sv / 0.40)
                  : sv < 0.74 ? mix(K[1], K[2], (sv - 0.40) / 0.34)
                  : mix(K[2], K[3], (sv - 0.74) / 0.26);
            // the lip, where the glaze is thinnest and the iron burns rust
            const lip = Math.max(0, (y - HH * 0.955) / (HH * 0.045));
            if (lip > 0) c = mix(c, RUST, Math.min(1, lip) * 0.72);
            // the inside: amber rather than green, and a little occluded
            const inside = r < outerAt(y) - 0.0025 && y < HH * 0.99;
            if (inside) {
              c = mix(c, [0.680, 0.545, 0.210], 0.55);
              const deep = Math.max(0, Math.min(1, (HH - y) / HH));
              const k2 = 1 - 0.42 * deep * deep;
              c = [c[0] * k2, c[1] * k2, c[2] * k2];
            }
            for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] = toLin(c[ch]);
          }
          geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3));
        }
        paint(bg);
        glaze(fg, 9.1, [0.300, 0.185, 0.125], [0.470, 0.310, 0.215], 0.34,
              undefined, 0, 0, 0, 0.25);

        const g = new THREE.Group();
        g.add(new THREE.Mesh(bg, new THREE.MeshStandardMaterial({
          // wet: a high-fired ash glaze is nearly a mirror, and it is the
          // gloss that makes the streaks read as glass over clay
          color: 0xffffff, vertexColors: true, roughness: 0.30,
          metalness: 0.03, side: THREE.DoubleSide,
        })));
        g.add(new THREE.Mesh(fg, new THREE.MeshStandardMaterial({
          // and the foot is raw clay: matte, and it must be, or the pot has
          // no floor to stand on
          color: 0xffffff, vertexColors: true, roughness: 0.88,
          metalness: 0.0, side: THREE.DoubleSide,
        })));
        return g;
      },
    },
    {
      key: "hishaku", jp: "柄杓", rom: "hishaku",
      desc: "The ladle. A length of bamboo culm cut just below a node, so " +
            "the node itself is the floor of the cup and no joint has to " +
            "hold water. The handle is a second piece driven through the " +
            "wall, and its end shows on the inside. Water is taken from the " +
            "kettle with it and half of it goes back.",
      build() {
        // Two pieces, and the construction is the whole interest of the
        // object: the cup is a section of CULM cut just below a node, so the
        // floor is the node and nothing has to be made watertight. The handle
        // is a separate strip driven through a slot in the wall near the
        // bottom, and its cut end stands inside the cup, which you can see in
        // the photographs looking down into it.
        // A fifth wider, at his eye: 54mm across rather than 45, and the same
        // 46 deep, so the cup is now wider than it is tall. The wall stays at
        // 3mm, since a culm's wall does not scale with its bore. One happy
        // consequence: the angle within which the interior stays visible is
        // atan(width / depth), so widening the cup opens that cone from 47
        // degrees to 52 and the mouth reads a little better.
        const R = 0.0270, WALL = 0.0030, HT = 0.0460, FLOOR = 0.0040;
        const bamboo = () => new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.54,
          metalness: 0.0, side: THREE.DoubleSide,
        });
        const g = new THREE.Group();

        // the cup: up the outside, square across the rim, down the inside,
        // and in across the node that closes it
        const cg = lathe([
          [0.0000, 0.0000], [0.0000, R - 0.0005], [0.0000, R - 0.0005],
          [0.0020, R], [0.0230, R + 0.0002], [0.0430, R + 0.0001],
          [HT, R - 0.0001], [HT, R - 0.0001],
          [HT, R - WALL], [HT, R - WALL],
          [0.0430, R - WALL - 0.0001], [0.0200, R - WALL - 0.0002],
          [0.0080, R - WALL - 0.0004], [FLOOR + 0.0006, R - WALL - 0.0018],
          [FLOOR, R - WALL - 0.0060], [FLOOR, 0.0000],
        ], 72, 3.3, 0.10);
        // The inside of a bamboo cup is a warmer yellow than the outside, and
        // the outside carries the fine vertical fibre of the culm skin. Both
        // are in the photographs and both are what says bamboo rather than
        // turned wood.
        glaze(cg, 2.2, [0.735, 0.706, 0.630], [0.898, 0.876, 0.818], 0.22,
              undefined, 0, 0, 0, 0.40);
        // The INSIDE has to be darker, or the mouth reads as a solid disc and
        // the cup is not a cup. glaze cannot do this: it sees only position,
        // and a point on the inner wall and a point on the outer wall at the
        // same height are the same to it. But they are not the same to light,
        // because the inside of a tube shades itself. So: a second pass that
        // knows which side of the wall it is on, darkening toward the floor,
        // where least of the sky can reach.
        (function inside(geo) {
          const pa = geo.attributes.position, ca = geo.attributes.color;
          for (let i = 0; i < pa.count; i++) {
            const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
            const r = Math.hypot(x, z);
            if (r > R - WALL * 0.45) continue;                // outer wall
            if (y > HT - 0.0006) continue;                     // the cut rim, pale
            if (y < FLOOR - 0.0004) continue;                 // the underside
            // Not merely darker: WARMER. The photograph looking into the cup
            // shows an almost white exterior and a mid brown interior, which
            // is not one material in two lights but two surfaces: outside is
            // shaved back to the pale flesh of the culm, inside is the skin of
            // the bore, and it is brown. So the three channels come down by
            // different amounts.
            // The darkening also stands in for occlusion, which the renderer
            // does not do: my room has a bright ceiling and a cup's interior
            // looks straight up into it, so without this the inside catches
            // MORE light than the outside and the mouth reads as a cap.
            const deep = Math.max(0, Math.min(1, (HT - y) / (HT - FLOOR)));
            const f0 = 1 - 0.32 * deep;
            ca.setXYZ(i, ca.getX(i) * 0.50 * f0,
                         ca.getY(i) * 0.30 * f0,
                         ca.getZ(i) * 0.175 * f0);
          }
        })(cg);
        g.add(new THREE.Mesh(cg, bamboo()));

        // ---- the handle -------------------------------------------------
        // Perpendicular to the cup's axis, which is what makes the cup hang
        // level when the handle is held level.
        // Nicolas has one in front of him, so this is measured off the object
        // itself and not off a photograph: the handle is wedged a little
        // ABOVE the middle of the cup's height, and it comes through the far
        // face of the wall by only three or four millimetres. Not at the node,
        // not under the rim, and not across the mouth.
        //
        // I had it crossing the whole interior, because a line runs right
        // across the inside of the cup in one of his photographs and I took
        // it for the handle's end. It cannot be: the stub is 4mm long. So
        // that line is something else, a split in the node most likely. Twice
        // now on this object I have read a mark in a photograph as the thing
        // I was looking for. A photograph shows what is there; it does not say
        // what it is.
        // THIRTY DEGREES, RISING. The handle is not perpendicular to the cup's
        // axis, which is what I had assumed and what would make the cup hang
        // level from a level handle. It leaves the cup and goes away and UP at
        // about 30 degrees, so with the handle held level the mouth tips
        // FORWARD, away from you: which is the attitude for pouring out.
        const SLOPE = 30 * Math.PI / 180;
        const DX = Math.cos(SLOPE), DY = Math.sin(SLOPE);
        const YH = HT * 0.565;                    // a little above half height
        // s runs along the handle's OWN axis from the stub to the cut end,
        // through the wall at (R, YH). The stub reaches 3.6mm past the inner
        // face of the wall, measured along that axis.
        const sIn = (R - WALL - R) / DX;          // where it leaves the inner face
        const S0 = sIn - 0.0036, S1 = 0.2910;
        const px_ = (s) => R + DX * s, py_ = (s) => YH + DY * s;
        const NS = 14, EX = 0.5, M = 150;
        const pos = [], idx = [], col = [];
        // Width: CONSTANT. Three photographs all show it widening toward the
        // cut end, which had me believing it; but the vertical one shows it
        // widest in the MIDDLE, and that is the signature of perspective on a
        // flat object, not of shape. What is real is the fan at the joint.
        const wAt = (d) => {
          if (d < 0) return 0.0046;                         // the stub inside
          if (d < 0.034) return 0.0050 + 0.0029 * Math.pow(1 - d / 0.034, 1.7);
          return 0.0050 - 0.00045 * (d - 0.034) / (S1 - 0.034);
        };
        const tAt = (d0) => {
          const d = Math.max(0, d0);
          let t = 0.0019 + 0.0010 * Math.max(0, 1 - d / 0.030);
          const end = (S1 - d) / 0.014;                     // the scarf cut
          if (end < 1) t *= 0.30 + 0.70 * Math.max(0, end);
          const node = Math.max(0, 1 - Math.abs(d - 0.160) / 0.004);
          return t * (1 + 0.22 * node);
        };
        // Both ends need a cap. The stub stands inside the cup where it can be
        // looked straight into, and an uncapped sweep is an open pipe.
        let prev = -1;
        for (let i = -1; i <= M + 1; i++) {
          const j = Math.max(0, Math.min(M, i));
          const cap = (i < 0 || i > M) ? 0.03 : 1;
          const sv = S0 + (S1 - S0) * j / M;
          const d = sv;                            // 0 at the wall
          const w = wAt(d) * cap, h = tAt(d) * cap;
          const x = px_(sv), y = py_(sv);
          // The fan HUGS the cup: near the joint the strip's edges curve back
          // to lie on the cylinder, which is why it looks moulded to the wall
          // rather than butted against it.
          const hug = d > -0.001 ? Math.max(0, 1 - d / 0.030) : 0;
          const scarf = (S1 - d) / 0.014 < 1 ? (1 - (S1 - d) / 0.014) : 0;
          const base = pos.length / 3;
          for (let sg = 0; sg < NS; sg++) {
            const ph = sg / NS * Math.PI * 2;
            const cp = Math.cos(ph), sp = Math.sin(ph);
            const u = h * Math.sign(cp) * Math.pow(Math.abs(cp), EX);
            const v = w * Math.sign(sp) * Math.pow(Math.abs(sp), EX);
            const dxx = -hug * (v * v) / (2 * R);
            // the section's thin axis is the handle's own normal, so it tilts
            // with the slope instead of staying vertical
            const ux = -DY * u, uy = DX * u;
            pos.push(x + ux + dxx * DX - scarf * 0.011 * (0.5 + 0.5 * Math.sign(u)),
                     y + uy + dxx * DY - scarf * h * 0.6, v);
            const node = Math.max(0, 1 - Math.abs(Math.max(0, d) - 0.160) / 0.0022);
            const gr = 0.900 - 0.050 * Math.abs(v) / Math.max(1e-9, w)
                     + 0.018 * Math.sin(sg * 2.7 + 1.1);
            const k = 1 - 0.55 * node * node;
            col.push(toLin(gr * k), toLin(gr * 0.945 * k), toLin(gr * 0.775 * k));
          }
          if (prev >= 0) {
            for (let sg = 0; sg < NS; sg++) {
              const n = (sg + 1) % NS;
              idx.push(prev + sg, prev + n, base + n, prev + sg, base + n, base + sg);
            }
          }
          prev = base;
        }
        const hg = new THREE.BufferGeometry();
        hg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        hg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        hg.setIndex(idx);
        hg.computeVertexNormals();
        g.add(new THREE.Mesh(hg, bamboo()));

        // Stood on the handle, cup uppermost, and then turned so the mouth
        // comes round toward the camera: the cup's axis and the handle are
        // perpendicular, so standing the handle up lays the mouth sideways
        // and a turn about the handle is what opens it to view.
        // Stand the HANDLE upright with the cup uppermost. That is 120 degrees,
        // not 90, because the handle already rises 30 from the cup, and it
        // forces the mouth to tip 30 DOWNWARD once the handle is vertical.
        // Which sounds like it would hide the interior, and would, except that
        // the turn about the vertical then brings the mouth's own axis round
        // to face the camera: 38 degrees off it, inside the 47 the cup allows,
        // so the mouth stays open. Worth writing down because the two
        // rotations look like they fight and do not.
        return g;      // natural: cup upright, handle rising away at 30
      },
      // The POSE is kept OUT of the geometry. build() returns the object in
      // its natural attitude, sitting on y = 0 as it would sit on a mat, and
      // pose() is only how this chapter chooses to show it alone in a square
      // frame. A tea room can then lay the same object down and ignore all of
      // this. Baking the presentation into the mesh was the one thing that
      // would have made these objects unusable anywhere else.
      pose(o) {
          o.rotation.z = -(Math.PI / 2 + 30 * Math.PI / 180);
          // The angle is forced by geometry, and there is less room than I
          // assumed. You can see INTO a cup only while the view stays within
          // atan(diameter / depth) of its axis, and this cup is as deep as it
          // is wide, so that limit is 47 degrees. Beyond it the near wall
          // closes the mouth completely, which is what happened when I swung it
          // out to 61: the ladle turned into a sealed cylinder. And the squash
          // of the mouth's ellipse is COS of the angle off axis, so inside the
          // limit it can never look very oblique. 48 degrees is the whole of
          // the available compromise: the mouth reads as an opening, a crescent
          // of the far inner wall shows, and the handle still shows its face.
          const face = new THREE.Group(); face.add(o); face.rotation.y = -1.50;
          return face;
      },
    },
    {
      key: "futaoki", jp: "蓋置", rom: "futaoki",
      desc: "The rest, and the smallest thing in the room. The lid of the " +
            "kettle is set on it, and the ladle after that. A ring of bamboo " +
            "cut so that a node falls inside it, which is why it has a floor " +
            "without anyone having given it one.",
      build() {
        // Measured off the photograph marked for the ro: as tall as it is
        // wide, the node three tenths of the way down from the rim, and the
        // node's ridge standing 6 per cent proud of the diameter.
        //
        // The node is also the FLOOR. That is the whole idea of the object:
        // a length of culm cut above and below one node needs nothing added
        // to hold a wet ladle, and you can see straight down onto it.
        // The node sits near the MIDDLE. My first photograph, the one marked
        // for the ro, put it at 31 per cent down from the rim, and I built it
        // there; two more pieces since then both measure 46. Two against one,
        // so it moves. Which also deepens the well, since the node is the floor:
        // 26mm of water sits in it now instead of 15.
        const R = 0.0230, HT = 0.0480, WALL = 0.0042, NODE = 0.0259;
        // One continuous path makes the whole solid: out along the node's
        // underside, down the inside of the lower tube, across the cut base,
        // up the outside past the node's ridge, over the rim, down the inside
        // of the upper cup, and in across the node's top face.
        const g = lathe([
          [NODE - 0.0003, 0.0000], [NODE - 0.0001, 0.0140], [NODE + 0.0001, 0.0186],
          [0.0246, 0.0188], [0.0180, 0.0187], [0.0100, 0.0186],
          [0.0000, 0.0184], [0.0000, 0.0184],
          [0.0000, 0.0222], [0.0000, 0.0222],
          [0.0015, 0.0228], [0.0100, 0.0229], [0.0190, 0.0230],
          [0.0226, 0.0234], [NODE, 0.0244], [0.0292, 0.0235],
          [0.0360, 0.0229], [0.0440, 0.0227],
          [HT, R - 0.0004], [HT, R - 0.0004],
          [HT, R - WALL], [HT, R - WALL],
          [0.0450, 0.0187], [0.0380, 0.0186], [0.0300, 0.0184],
          [0.0276, 0.0150], [NODE + 0.0014, 0.0000],
        // 120 sides, and the count is forced by the fibre below: a mesh of N
        // sides carries at most N/2 cycles round the circumference, and past
        // that a fine stripe folds into a broad soft band. At 72 sides my 61
        // cycle fibre aliased into exactly that.
        ], 120, 6.8, 0.10);

        // The colour is where this object is decided. Four surfaces on one
        // turned line: a warm golden skin below the node, a paler and greener
        // one above it (two internodes never weather alike), a brown scarred
        // ring at the node itself, and a pale cream interior.
        (function paint(geo) {
          const pa = geo.attributes.position;
          const rgb = new Float32Array(pa.count * 3);
          const LO = [0.735, 0.615, 0.310], HI = [0.800, 0.710, 0.415];
          const BAND = [0.430, 0.300, 0.130], SCAR = [0.235, 0.150, 0.070];
          const IN = [0.885, 0.845, 0.735];
          const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t,
                                    a[1] + (b[1] - a[1]) * t,
                                    a[2] + (b[2] - a[2]) * t];
          for (let i = 0; i < pa.count; i++) {
            const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
            const r = Math.hypot(x, z), A = Math.atan2(z, x);
            const inside = r < R - WALL * 0.55;
            let c;
            if (inside) {
              // the bore, pale, and darker the deeper it lies: the upper cup
              // measures its depth from the rim, the lower tube from the base
              const up = y > NODE;
              const d = up ? (HT - y) / (HT - NODE) : y / NODE;
              // and only lightly: the well is 15mm deep in a 38mm bore, so it
              // is a saucer, not a shaft, and it should look like one
              c = mix(IN, [0.300, 0.262, 0.205], Math.min(1, d * 0.52));
            } else {
              c = mix(LO, HI, Math.max(0, Math.min(1, (y - NODE + 0.010) / 0.020)));
              // the fibre, running lengthwise as it must
              const fib = 0.011 * Math.sin(A * 37 + 1.2) + 0.006 * Math.sin(A * 53);
              c = [c[0] + fib, c[1] + fib * 0.95, c[2] + fib * 0.70];
            }
            // the node ring, uneven all the way round, with darker scars
            const nb = Math.max(0, 1 - Math.abs(y - NODE) / 0.0036);
            if (nb > 0 && !inside) {
              const w = 0.5 + 0.5 * Math.sin(A * 9 + 0.6) * Math.sin(A * 23 + 2.2);
              c = mix(c, mix(BAND, SCAR, w * w), Math.pow(nb, 0.65) * (0.55 + 0.42 * w));
            }
            for (let ch = 0; ch < 3; ch++)
              rgb[i * 3 + ch] = toLin(Math.max(0, Math.min(1, c[ch])));
          }
          geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3));
        })(g);

        const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.40,
          metalness: 0.0, side: THREE.DoubleSide,
        }));
        // Tipped toward the viewer, because the inside is the object. The
        // camera these objects share sits only nine degrees above the
        // horizon, and a rim seen from nine degrees is a sliver: the well is
        // shallow and wide, so the cone within which it can be looked into is
        // nearly seventy degrees, and it was being missed by a hair. Twenty
        // degrees of lean spends almost nothing and opens it.
        return m;
      },
      // The POSE is kept OUT of the geometry. build() returns the object in
      // its natural attitude, sitting on y = 0 as it would sit on a mat, and
      // pose() is only how this chapter chooses to show it alone in a square
      // frame. A tea room can then lay the same object down and ignore all of
      // this. Baking the presentation into the mesh was the one thing that
      // would have made these objects unusable anywhere else.
      pose(o) {
        const tip = new THREE.Group(); tip.add(o); tip.rotation.x = 0.34;
        return tip;
      },
    },
    {
      key: "mizusashi", jp: "水指", rom: "mizusashi",
      desc: "The fresh water, and the only cold thing in the room. It is " +
            "already standing when the guests come in, and everything after " +
            "that is drawn from it: the kettle is topped up from it, the " +
            "bowl is rinsed from it. Stoneware, under a flat lacquer lid.",
      build() {
        // Straight-sided, which is the plain form. A mizusashi is the biggest
        // object in the set and the least demonstrative: it stands at the
        // back and is opened once.
        const R = 0.0875, HT = 0.1500;
        const g = new THREE.Group();

        const bg = lathe([
          [0.0000, 0.0000], [0.0000, 0.0700], [0.0000, 0.0700],
          [0.0040, 0.0762], [0.0200, 0.0822], [0.0500, 0.0860],
          [0.0850, R], [0.1150, 0.0868], [0.1380, 0.0845],
          [HT, 0.0838], [HT, 0.0838],
          [HT, 0.0788], [HT, 0.0788],
          [0.1400, 0.0784], [0.1000, 0.0800], [0.0500, 0.0790],
          [0.0140, 0.0740], [0.0080, 0.0400], [0.0080, 0.0000],
        ], 80, 4.2, 0.18);
        // Ash glazed stoneware: a warm grey buff, thinner and paler over the
        // shoulder where it was pulled, and speckled with iron.
        // The mottle has to be SMALL here. glaze's blobs are about 35mm
        // across, which on a raku bowl of 116 is a cloud or two and on a jar
        // of 175 is camouflage. Turned right down, and the character is
        // carried by the iron speckle instead, which is fine enough to read
        // as a surface rather than as a pattern.
        glaze(bg, 5.6, [0.345, 0.315, 0.258], [0.650, 0.615, 0.522], 0.12,
              undefined, 0, 0, 0.34, 0.60);
        // and the inside is darker, the same reason as the ladle: a jar's
        // mouth looks up into a bright ceiling and would otherwise come out
        // lighter than its own wall
        (function inside(geo) {
          const pa = geo.attributes.position, ca = geo.attributes.color;
          for (let i = 0; i < pa.count; i++) {
            const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
            if (Math.hypot(x, z) > 0.0812) continue;
            if (y > HT - 0.0006) continue;
            const deep = Math.max(0, Math.min(1, (HT - y) / HT));
            const k = 0.72 - 0.46 * Math.pow(deep, 1.2);
            ca.setXYZ(i, ca.getX(i) * k, ca.getY(i) * k * 0.94, ca.getZ(i) * k * 0.86);
          }
        })(bg);
        g.add(new THREE.Mesh(bg, new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.62,
          metalness: 0.0, side: THREE.DoubleSide,
        })));

        // The lid is BLACK LACQUER, a nuri-buta, and that pairing is a real
        // thing in the room rather than a decision of mine: the coldest,
        // plainest, heaviest object in the set wears the same finish as the
        // smallest and most refined one. It is flat and a hair wider than the
        // mouth, and it carries a small waisted knob, because the lid has to
        // be lifted and there is nothing else to take hold of. The profile
        // simply keeps going instead of closing at the centre: the knob is
        // not a second piece, it is the same turned line continuing upward.
        const lg = lathe([
          [0.1508, 0.0000], [0.1508, 0.0600], [0.1508, 0.0872],
          [0.1508, 0.0872], [0.1560, 0.0884], [0.1560, 0.0884],
          [0.1598, 0.0872], [0.1622, 0.0800], [0.1638, 0.0600],
          [0.1646, 0.0300], [0.1650, 0.0140],
          [0.1654, 0.0104], [0.1690, 0.0081], [0.1730, 0.0100],
          [0.1752, 0.0113], [0.1763, 0.0098], [0.1769, 0.0058],
          [0.1771, 0.0000],
        ], 80, 4.2, 0);
        g.add(new THREE.Mesh(lg, new THREE.MeshStandardMaterial({
          color: 0x0e0d0f, roughness: 0.085, metalness: 0.0,
          side: THREE.DoubleSide,
        })));
        return g;
      },
    },
    {
      key: "kama", jp: "釜", rom: "kama",
      desc: "The kettle, and the only thing in the room that makes a sound. " +
            "Cast iron, never washed, filled once and kept just off the " +
            "boil, and its note over the fire has names: wind in the pines " +
            "is the one everybody knows. Sadler's chapter opens with kettles " +
            "because they are the objects most often given a name.",
      build() {
        // Measured off five photographs. The silhouette had to be read
        // carefully: the LUGS widen it across the shoulder and the cast
        // SHADOW widens it below the belly, so neither end of the outline is
        // the pot. Comparing the left and right edges about the axis is what
        // separates them: through the clean middle the two agree to a
        // constant offset, and where they stop agreeing is where something
        // that is not the body has been measured.
        //
        // What the clean part says: 250mm across by 192 tall, so distinctly
        // wider than tall, and the widest point is HIGH, at about two thirds.
        // Below it the wall runs almost straight for a third of the height
        // before rounding into the base.
        const R = 0.1250, HB = 0.1920;
        const g = new THREE.Group();

        const bg = lathe([
          // The base is FLAT, and Nicolas had to tell me: none of the five
          // photographs shows the underside, and my own reading of the lower
          // silhouette ran into the cast shadow and then tapered to a point,
          // so I built a spinning top. The lesson is not about kettles. Where
          // a measurement degrades it does not announce itself; it just keeps
          // returning numbers, and the numbers keep looking like a shape.
          [0.0000, 0.0000], [0.0000, 0.0450], [0.0000, 0.0450],
          [0.0035, 0.0520], [0.0100, 0.0632], [0.0185, 0.0755],
          [0.0290, 0.0885], [0.0410, 0.1005], [0.0540, 0.1105],
          [0.0640, 0.1160], [0.0720, 0.1191],
          [0.0820, 0.1210], [0.0920, 0.1213], [0.1021, 0.1214],
          [0.1121, 0.1215], [0.1235, 0.1214],
          // the mould seam, left standing as a fine ridge: a kettle is cast
          // in two halves and the join is not ground off
          [0.1321, 0.1250], [0.1321, 0.1250],
          [0.1421, 0.1219], [0.1521, 0.1169], [0.1622, 0.1100],
          [0.1722, 0.1005], [0.1772, 0.0949], [0.1822, 0.0880],
          [0.1872, 0.0790], [HB, 0.0681],
          [0.1955, 0.0640], [0.1978, 0.0631],       // the neck
          [0.2035, 0.0631], [0.2048, 0.0629], [0.2048, 0.0629],
          [0.2048, 0.0581], [0.2048, 0.0581],       // the mouth, cut square
          [0.1980, 0.0584], [0.1900, 0.0630],       // and down inside
          [0.1780, 0.0770], [0.1600, 0.1000],
          [0.1300, 0.1150], [0.0900, 0.1120],
          [0.0500, 0.0980], [0.0300, 0.0730],
          [0.0170, 0.0480], [0.0110, 0.0400],
          [0.0090, 0.0330], [0.0085, 0.0000],
        ], 120, 8.4, 0.14);
        // Raw cast iron. I wanted the GRAIN of the sand mould and turned the
        // speckle up to get it, and it came out as blotches like mould on
        // bread. The reason is a limit of the mesh, not of the value: the
        // vertices on a kettle 250mm across sit 6.5mm apart, and the speckle
        // is hashed on a 0.6mm quantum. A hash finer than the sampling is
        // white noise, one independent value per vertex, and Gouraud then
        // smears each one over its own 6.5mm patch. Sand grain cannot be put
        // in vertex colours at this size; it would want a normal map.
        //
        // So the surface is left nearly plain and the ROUGHNESS is what says
        // raw iron. That is honest: unpolished cast iron really does read by
        // how it fails to reflect rather than by any pattern on it.
        glaze(bg, 1.9, [0.215, 0.194, 0.181], [0.392, 0.360, 0.340], 0.05,
              undefined, 0, 0, 0, 0.55);
        // two turned lines round the body, and the inside dark
        (function marks(geo) {
          const pa = geo.attributes.position, ca = geo.attributes.color;
          for (let i = 0; i < pa.count; i++) {
            const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
            const r = Math.hypot(x, z);
            const outer = r > 0.050 || y < 0.0080;
            if (!outer) {
              const k = 0.34 - 0.18 * Math.min(1, (0.2048 - y) / 0.10);
              ca.setXYZ(i, ca.getX(i) * k, ca.getY(i) * k, ca.getZ(i) * k);
              continue;
            }
            const line = Math.max(Math.max(0, 1 - Math.abs(y - 0.1720) / 0.0016),
                                  Math.max(0, 1 - Math.abs(y - 0.0530) / 0.0016));
            if (line > 0) {
              const k = 1 - 0.42 * line;
              ca.setXYZ(i, ca.getX(i) * k, ca.getY(i) * k, ca.getZ(i) * k);
            }
          }
        })(bg);
        const iron = new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.86,
          metalness: 0.18, side: THREE.DoubleSide,
        });
        g.add(new THREE.Mesh(bg, iron));

        // The two kantsuki, the lugs a lifting ring passes through. They are
        // what widened my first measurement of the shoulder, so they are also
        // the reason the profile above is trustworthy.
        const lugMat = new THREE.MeshStandardMaterial({
          color: 0x2a2522, roughness: 0.68, metalness: 0.32,
        });
        [0, Math.PI].forEach((az) => {
          const L = new THREE.Group();
          const boss = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), lugMat);
          boss.scale.set(0.0075, 0.0135, 0.0105);
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.0082, 0.0034, 10, 26), lugMat);
          ring.rotation.y = Math.PI / 2;      // the hole looks outward
          ring.position.x = 0.0072;
          L.add(boss); L.add(ring);
          L.position.set(Math.cos(az) * 0.1155, 0.1530, Math.sin(az) * 0.1155);
          L.rotation.y = -az;
          g.add(L);
        });

        // The lid is BRONZE, not iron: a flat disc with a stepped edge that
        // overhangs the mouth by a hair, dark brown with a warm sheen.
        const lid = lathe([
          [0.2050, 0.0000], [0.2050, 0.0400], [0.2050, 0.0628],
          [0.2050, 0.0628], [0.2062, 0.0649], [0.2062, 0.0649],
          [0.2092, 0.0645], [0.2100, 0.0600], [0.2104, 0.0400],
          [0.2108, 0.0180], [0.2110, 0.0000],
        ], 100, 2.4, 0);
        g.add(new THREE.Mesh(lid, new THREE.MeshStandardMaterial({
          color: 0x4e3226, roughness: 0.38, metalness: 0.62,
          side: THREE.DoubleSide,
        })));

        // and the knob is SILVER, a small ribbed bud on a washer. Three
        // metals in one object, which is the point of it: iron for the fire,
        // bronze for the lid, silver for the finger.
        const knobMat = new THREE.MeshStandardMaterial({
          color: 0xc9c9ce, roughness: 0.24, metalness: 0.94,
        });
        const knob = lathe([
          [0.2108, 0.0000], [0.2108, 0.0105], [0.2114, 0.0108],
          [0.2118, 0.0060], [0.2128, 0.0038], [0.2150, 0.0034],
          [0.2168, 0.0055], [0.2186, 0.0092], [0.2205, 0.0113],
          [0.2224, 0.0108], [0.2238, 0.0082], [0.2246, 0.0046],
          [0.2249, 0.0028], [0.2258, 0.0034], [0.2264, 0.0026],
          [0.2266, 0.0000],
        ], 40, 3.1, 0);
        g.add(new THREE.Mesh(knob, knobMat));

        // tipped a little, so the lid and its knob are read as a lid and not
        // as a line: the shared camera sits nine degrees up and this object
        // is wider than it is tall
        return g;
      },
      // The POSE is kept OUT of the geometry. build() returns the object in
      // its natural attitude, sitting on y = 0 as it would sit on a mat, and
      // pose() is only how this chapter chooses to show it alone in a square
      // frame. A tea room can then lay the same object down and ignore all of
      // this. Baking the presentation into the mesh was the one thing that
      // would have made these objects unusable anywhere else.
      pose(o) {
        const tip = new THREE.Group(); tip.add(o); tip.rotation.x = 0.20;
        return tip;
      },
    },
    {
      key: "fukusa", jp: "帛紗", rom: "fukusa",
      desc: "A square of silk, folded, and the only thing here that is never " +
            "set down: it is worn, tucked at the waist, and taken out to wipe " +
            "the caddy and the scoop. Nothing on them needs cleaning. The " +
            "folding and refolding of it is the gesture, not the wiping.",
      build() {
        // The one object with neither an axis of revolution nor a wire to run
        // along. A folded cloth is best described as a RIBBON THAT DOUBLES BACK
        // ON ITSELF: its centreline runs the length of a layer, turns through
        // half a circle at the fold, runs back, turns again. So it is a sweep
        // after all, only the line it follows is the fold pattern rather than
        // the shape of the object.
        //
        // A fukusa is about 285mm square. Folded in half one way and in four
        // the other, it makes a packet of roughly 142 by 70 with four
        // thicknesses, which is what is carried at the waist.
        const W = 0.070, D = 0.142, T = 0.00105, R = 0.00175;
        const path = [];
        const p2 = (x, y) => path.push([x, y]);
        const arc = (cx, cy, a0, a1, n) => {
          for (let i = 1; i <= n; i++) {
            const a = a0 + (a1 - a0) * i / n;
            p2(cx + R * Math.cos(a), cy + R * Math.sin(a));
          }
        };
        // The free edges are STAGGERED, not flush: a cloth folded by hand never
        // quite lines up, and the little step is most of what says cloth rather
        // than card.
        p2(0.0020, 0); p2(W, 0);
        arc(W, R, -Math.PI / 2, Math.PI / 2, 9);           // fold, right
        p2(0, 2 * R);
        arc(0, 3 * R, -Math.PI / 2, -Math.PI * 1.5, 9);    // fold, left
        p2(W, 4 * R);
        arc(W, 5 * R, -Math.PI / 2, Math.PI / 2, 9);       // fold, right
        p2(0.0062, 6 * R);
        const cl = chaikin(path, 1);

        // The section is a STADIUM, a millimetre of thickness by the full depth
        // of the packet with its ends rounded off. Silk has no edge to speak
        // of, so a square end would read as sheet metal.
        const NS = 14, EX = 0.5;
        const pos = [], idx = [], col = [];
        // Vermilion, which is the site's one colour and is also the colour a
        // fukusa is most often dyed. Purple is the other; ask Nicolas.
        const SILK = [0.760, 0.235, 0.150], DEEP = [0.395, 0.105, 0.072];
        let prev = -1;
        for (let i = 0; i < cl.length; i++) {
          const P = cl[i];
          const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
          let tx = b[0] - a[0], ty = b[1] - a[1];
          const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
          const nx = -ty, ny = tx;
          const base = pos.length / 3;
          for (let sg = 0; sg < NS; sg++) {
            const ph = sg / NS * Math.PI * 2;
            const cp = Math.cos(ph), sp = Math.sin(ph);
            const u = (T / 2) * Math.sign(cp) * Math.pow(Math.abs(cp), EX);
            const v = (D / 2) * Math.sign(sp) * Math.pow(Math.abs(sp), EX);
            // WHAT MAKES IT CLOTH rather than a stack of card, and it took
            // three tries: a folded cloth is not four flat layers with air
            // between them, it BOWS. Each layer arches a little along its
            // length, and the higher ones arch more because they have the ones
            // below to ride over, so the packet opens toward its free edges
            // instead of closing like a book. And it WAVES across its width,
            // which is the only thing here that could not be a rigid object.
            const along = Math.min(1, Math.max(0, P[0] / W));
            const layer = P[1] / (6 * R);                 // 0 at the bottom, 1 at the top
            const bow = 0.0019 * Math.sin(Math.PI * along) * layer;
            const wave = 0.0011 * Math.sin(v * 27.0 + layer * 2.4)
                       * (0.35 + 0.65 * Math.sin(Math.PI * along));
            pos.push(P[0] + u * nx, P[1] + u * ny + bow + wave, v);
            // Silk reads by its SHEEN, which runs with the weave: brighter
            // where the surface faces the light and deepening fast as it turns
            // away, much faster than a matt cloth would.
            // The surface normal, not the centreline's. Around the section the
            // outward direction is cos(ph) along the in-plane normal and
            // sin(ph) along the depth, so its upward component is cp * ny. I
            // used ny alone, which is the same for every point around a given
            // section: the top face and the underside came out identical and
            // the sheen landed on the edges instead.
            const face = Math.max(0, (cp * ny) * 0.80 + 0.20);
            const k = Math.pow(face, 0.55);
            const w = 0.020 * Math.sin(v * 420) + 0.014 * Math.sin(P[0] * 380)
                    + 0.055 * Math.sin(v * 9.5 + 1.1);
            for (let c = 0; c < 3; c++)
              col.push(toLin(Math.max(0, Math.min(1,
                DEEP[c] + (SILK[c] - DEEP[c]) * k + w))));
          }
          if (prev >= 0) {
            for (let sg = 0; sg < NS; sg++) {
              const n = (sg + 1) % NS;
              idx.push(prev + sg, prev + n, base + n, prev + sg, base + n, base + sg);
            }
          }
          prev = base;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.44,
          metalness: 0.0, side: THREE.DoubleSide,
        }));
        m.position.x = -W / 2;
        const grp = new THREE.Group(); grp.add(m);
        return grp;
      },
      // Tipped and turned a little, so both the folded edge and the staggered
      // free edges are in view: those two edges are the whole of what tells you
      // it is folded.
      pose(o) {
        const t = new THREE.Group(); t.add(o); t.rotation.y = -0.55;
        const u = new THREE.Group(); u.add(t); u.rotation.x = 0.34;
        return u;
      },
    },
  ];

  global.DOGU = {
    OBJECTS: OBJECTS,
    // the tools too: the room will want to build a mat and a hearth, and
    // whatever builds them should be able to speak the same language
    lathe: lathe, glaze: glaze, chaikin: chaikin, hash3: hash3, toLin: toLin,
  };
})(this);
