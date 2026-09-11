// chashitsu-layout.js
// ---------------------------------------------------------------------------
// THE ROOM'S FURNISHING, as one function. Mats, the hearth cut in them, the
// fire, the middle pillar, the host's knees and every utensil, for any of the
// eight layouts the table describes.
//
// It comes out of room3d.html for the third time this pattern has paid: the
// utensils went into dogu-objects.js, the room's table into
// chashitsu-room.js, and now the furnishing. The reason is the same each
// time, and it is not tidiness. Two places that draw the same thing from two
// copies WILL disagree, and the disagreement is always found late. Read from
// one function they cannot.
//
// It knows nothing of a page: no camera, no canvas, no HUD. It fills the
// group it is handed and RETURNS what the room decides -- where the fire is,
// where the host kneels, which way he faces, and where a guest sits. The page
// does what it likes with those.
//
// Coordinates are the PLAN's: x and z run 0 to 2865mm from the alcove corner,
// the same numbers the flat chapter uses. A page whose room sits elsewhere
// positions the group and converts with group.localToWorld.
// ---------------------------------------------------------------------------
(function (global) {
  "use strict";

  const ROOM = global.ROOM, DOGU = global.DOGU;
  const M = ROOM.MAT_WIDE;                 // one plan unit, in metres
  const U = ROOM.U, RO = ROOM.RO;
  const u = (n) => n * M;                  // plan units to metres
  const WALL_H = 2.00;                     // Sadler puts a small room near six shaku
  const MAT_T = 0.055;                     // a tatami's thickness
  const RO_DEEP = 0.36;

  const mat = (c, r, s) => new THREE.MeshStandardMaterial({
    color: c, roughness: r === undefined ? 0.9 : r, metalness: 0,
    side: s || THREE.FrontSide });

  // The alcove's own materials and depth, which both rooms must share or the
  // two tokonoma will drift apart in colour as well as in shape.
  const PLASTER = mat(0x8d7f6c, 0.98, THREE.DoubleSide);
  const WOOD = mat(0x4a3a2c, 0.72);
  const TOKO_D = 0.62;                     // the alcove, off the plan

  // Whatever is being filled at the moment. slab() writes into it, which is
  // how the original page's helper worked and why it stays a closure variable
  // rather than an argument threaded through forty calls.
  let into = null;
  const slab = (w, h, d, m, x, y, z) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z); into.add(b); return b;
  };

  // group: what to fill, emptied first.
  // opt.ti: which of the four hearth positions. opt.rev: the reversed style.
  // opt.knees: draw the host's knee mark.
  function layout(group, opt) {
    const TI = (opt && opt.ti) | 0;
    const REV = !!(opt && opt.rev);
    const KNEES = !opt || opt.knees !== false;
    const TYPE = ROOM.TYPES[TI];
    const roX = REV ? U - TYPE.ro[0] - RO : TYPE.ro[0];
    const roY = TYPE.ro[1];
    const mirror = (x) => REV ? U - x : x;
  group.clear();
  into = group;

    // ---- the floor ---------------------------------------------------------
    // Five mats in the pinwheel, straight off the plan's own table. Each keeps
    // its dark heri along the two LONG edges only, which is how a mat is bound
    // and is also what makes a pinwheel legible from above.
    const STRAW = mat(0xcdbd92, 0.95), HERI = mat(0x2f2a26, 0.85);
    const HW = 0.030;                        // the binding, 30mm
    // The hearth is CUT INTO a mat, so the mat it falls in is built as the
    // rectangles left around the hole rather than as one slab with a lid.
    function mats() {
      for (const k in ROOM.MATS) {
        const s = ROOM.MATS[k];
        let w = s.w, h = s.h;
        if (k === TYPE.temae && TYPE.shorten) h *= TYPE.shorten;
        const cut = roX >= s.x - 1e-6 && roX + RO <= s.x + w + 1e-6 &&
                    roY >= s.y - 1e-6 && roY + RO <= s.y + h + 1e-6;
        const rects = cut
          ? [[s.x, s.y, w, roY - s.y],
             [s.x, roY + RO, w, s.y + h - (roY + RO)],
             [s.x, roY, roX - s.x, RO],
             [roX + RO, roY, s.x + w - (roX + RO), RO]]
          : [[s.x, s.y, w, h]];
        for (const [rx, ry, rw, rh] of rects) {
          if (rw < 1e-4 || rh < 1e-4) continue;
          slab(u(rw), MAT_T, u(rh), STRAW,
               u(rx + rw / 2), -MAT_T / 2, u(ry + rh / 2));
        }
        // the binding, on the long sides
        const long = s.w > s.h ? "x" : "z";
        for (const sgn of [-1, 1]) {
          if (long === "x")
            slab(u(w), MAT_T + 0.001, HW, HERI,
                 u(s.x + w / 2), -MAT_T / 2, u(s.y + (sgn < 0 ? 0 : h)));
          else
            slab(HW, MAT_T + 0.001, u(h), HERI,
                 u(s.x + (sgn < 0 ? 0 : w)), -MAT_T / 2, u(s.y + h / 2));
        }
      }
    }
    mats();

    // ---- the hearth --------------------------------------------------------
    // 0.44 of a mat width is 420mm, against a real ro of 1.4 shaku, 424.
    const RCX = u(roX + RO / 2), RCZ = u(roY + RO / 2);
    const pit = mat(0x140f0d, 0.95, THREE.BackSide);
    slab(u(RO), RO_DEEP, u(RO), pit, RCX, -RO_DEEP / 2 - 0.001, RCZ);
    // The ash comes most of the way UP, not down at the bottom: a ro is filled
    // near to the mat and the fire sits in the top of it.
    const ASH = -0.085;
    slab(u(RO) * 0.97, 0.006, u(RO) * 0.97, mat(0xa8a096, 0.99), RCX, ASH, RCZ);

    // The gotoku, the trivet, whose name is the five virtues: three legs
    // standing in the ash with a ring on top, and the kettle sits on the ring.
    // Mostly out of sight down the hole, which is the point of showing it.
    const IRON = mat(0x241f1c, 0.72);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.006, 8, 22), IRON);
    ring.rotation.x = Math.PI / 2; ring.position.set(RCX, ASH + 0.055, RCZ);
    into.add(ring);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2 + 0.4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.058, 6), IRON);
      leg.position.set(RCX + Math.cos(a) * 0.062, ASH + 0.028, RCZ + Math.sin(a) * 0.062);
      into.add(leg);
    }
    // Charcoal, and the only light in the room that is not daylight.
    //
    // opt.fire scales it, because how bright an emissive reads depends on the
    // tone mapping in front of it: room3d renders linear, the roji renders
    // ACESFilmic at exposure 1.1.
    //
    // But that turned out NOT to be why Nicolas could not see the fire in the
    // roji, and the handle is honest only if the record is. Measured with the
    // real cause fixed, the roji's embers reach a warmth of 156 against
    // room3d's 174, and the multiplier changes nothing: 156, 155, 153 at one,
    // two and four times, because they already saturate. So the default of 1 is
    // right and this is a tuning handle, not a correction.
    const FB = (opt && opt.fire) || 1;
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + 1.1, r = 0.030 + (i % 2) * 0.018;
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.028, 0.055),
        new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.98,
          emissive: 0x6b2408, emissiveIntensity: 0.55 * FB }));
      c.position.set(RCX + Math.cos(a) * r, ASH + 0.016, RCZ + Math.sin(a) * r);
      c.rotation.y = a; into.add(c);
    }
    const fire = new THREE.PointLight(0xff8f45, 0.42 * FB, 0.95, 2);
    fire.position.set(RCX, ASH + 0.05, RCZ);
    into.add(fire);


    // ---- 中柱 naka-bashira -------------------------------------------------
    // The middle pillar, and the brother of the alcove post. It belongs to
    // the DAIME alone, which is why it could not be built before the room
    // learned to change type: `pillar: true` sits in the same table the flat
    // plan reads, and the plan has drawn it since the chapter's first day.
    //
    // Sadler: Rikyu's son Do-an suggested it, and Oribe made the three mat
    // daime popular. It stands at the hearth, on the far side of it from the
    // host, and it is slighter than the alcove post: a sapling rather than a
    // trunk, and it leans.
    if (TYPE.pillar) {
      const PX_ = u(roX + (REV ? -0.16 : RO + 0.16));
      const PZ_ = u(roY - 0.10);
      const NS2 = 24, M2 = 34, pos2 = [], idx2 = [], col2 = [];
      const toLin2 = DOGU.toLin;
      let prev2 = -1;
      for (let i = 0; i <= M2; i++) {
        const f = i / M2, y = f * WALL_H;
        // a real lean, not just a wander: a naka-bashira is set out of plumb
        const dx = (REV ? -1 : 1) * (0.055 * f + 0.013 * Math.sin(f * 3.1 + 0.4));
        const dz = 0.022 * f + 0.010 * Math.sin(f * 2.4 + 1.7);
        const r = 0.042 - 0.010 * f;            // 84mm at the foot, 64 at the head
        const base = pos2.length / 3;
        for (let k = 0; k < NS2; k++) {
          const t2 = k / NS2 * Math.PI * 2;
          const lob = 1 + 0.034 * Math.sin(3 * t2 + f * 2.4)
                        + 0.019 * Math.sin(5 * t2 + f * 3.8);
          const rr = r * lob;
          pos2.push(PX_ + dx + Math.cos(t2) * rr, y, PZ_ + dz + Math.sin(t2) * rr);
          // 24 sides carry 12 cycles, so the fibre sits at 7 and 11
          const g4 = 0.455 + 0.032 * Math.sin(7 * t2 + 0.6)
                           + 0.019 * Math.sin(11 * t2)
                           + 0.022 * Math.sin(f * 24 + t2 * 2.0);
          col2.push(toLin2(g4), toLin2(g4 * 0.830), toLin2(g4 * 0.620));
        }
        if (prev2 >= 0) {
          for (let k = 0; k < NS2; k++) {
            const n = (k + 1) % NS2;
            idx2.push(prev2 + k, prev2 + n, base + n, prev2 + k, base + n, base + k);
          }
        }
        prev2 = base;
      }
      const gp = new THREE.BufferGeometry();
      gp.setAttribute("position", new THREE.Float32BufferAttribute(pos2, 3));
      gp.setAttribute("color", new THREE.Float32BufferAttribute(col2, 3));
      gp.setIndex(idx2);
      gp.computeVertexNormals();
      into.add(new THREE.Mesh(gp, new THREE.MeshStandardMaterial({
        color: 0xffffff, vertexColors: true, roughness: 0.50, metalness: 0,
      })));
    }

    // ---- the utensils, at true size ----------------------------------------
    // The whole reason the objects were moved out of their page.
    const put = (key, px, pz, ry) => {
      const o = DOGU.OBJECTS.find((q) => q.key === key);
      if (!o || !o.build) return null;
      const m = o.build();
      m.position.set(u(px), 0, u(pz));
      if (ry) m.rotation.y = ry;
      into.add(m); return m;
    };
    // The utensil mat runs x 0..1, z 1..3 in plan units, and the hearth is cut
    // out of its far corner at x 0.56..1.00, z 1.06..1.50. Everything therefore
    // stands in the x 0.15..0.50 band, clear of the hole: my first placings
    // were eyeballed from the host's knees and left the bowl hanging over the
    // edge of the ro.
    // ARRANGED TO BE SEEN, not to be correct. Nicolas: the true layout matters
    // less here than being able to read the utensils on the mat, so this is a
    // display and says so. Sadler's own plan of a four-and-a-half mat room
    // (chapter 15) puts the hearth in the CENTRAL half mat and the alcove on
    // the other side; ours differs, and that is a question for the plan chapter
    // rather than something to settle by quietly moving furniture here.

    // ONE BEARING for the handles, and it is the ladle's: -2.4550 rad, the
    // direction Nicolas aimed it at. The scoop keeps it, so the two run

    // ---- the utensils -------------------------------------------------------
    // ONE RULE instead of eight arrangements, which was Nicolas's decision and
    // the right one: eight hand-made layouts would be eight things to correct
    // every time anything moved.
    //
    // The four-and-a-half in its normal style keeps exactly what he and I
    // built together, figure by figure off the ruler. Every other room gets
    // the COMPOSITE -- bowl, scoop and whisk as one piece -- set at the corner
    // of the hearth nearest his left knee, with the rest arranged about it.
    //
    // And they are arranged in the HOST'S OWN FRAME, not the room's: forward
    // is from where he kneels toward the fire, left is his left hand. Held
    // that way the arrangement follows him into any of the eight without a
    // single number needing to change, and the reversed styles come out right
    // for free, because his left is still his left when the room is mirrored.
    // WHERE HE KNEELS, from four rules of Nicolas's rather than from a figure
    // in the table. The table's `host` was a pair of numbers per room, eight
    // things to keep right; these four rules are one thing, and they hold in
    // every room including the ones we have not looked at:
    //
    //   1. the knees are on the mat that CONTAINS the hearth
    //   2. in the LARGER of the two parts the hearth leaves of it
    //   3. pointing at the hearth, PARALLEL to the mat's edges
    //   4. on the mat's centre line across its width
    //
    // Rule 3 is the one that changes the most: his facing is now square to
    // the mat instead of running diagonally at the fire.
    const usedMats = {};
    for (const mk in ROOM.MATS) {
      const sm = ROOM.MATS[mk];
      usedMats[mk] = { x: sm.x, y: sm.y, w: sm.w, h: sm.h };
      if (mk === TYPE.temae && TYPE.shorten) usedMats[mk].h *= TYPE.shorten;
    }
    let hostMat = null;
    for (const mk in usedMats) {
      const m2 = usedMats[mk];
      if (roX >= m2.x - 1e-6 && roX + RO <= m2.x + m2.w + 1e-6 &&
          roY >= m2.y - 1e-6 && roY + RO <= m2.y + m2.h + 1e-6) { hostMat = m2; break; }
    }
    if (!hostMat) hostMat = usedMats[TYPE.temae];   // should not happen; say so if it does
    const longX = hostMat.w > hostMat.h;
    const a0 = longX ? hostMat.x : hostMat.y;
    const a1 = longX ? hostMat.x + hostMat.w : hostMat.y + hostMat.h;
    const r0 = longX ? roX : roY, r1 = r0 + RO;
    const onHigh = (a1 - r1) >= (r0 - a0);         // which part is larger
    // How far the knees stand clear of the hearth's edge is the one thing the
    // four rules do not fix, so it is a number here and Nicolas can change it:
    const KNEE_CLEAR = 0.120;
    const alongK = onHigh ? r1 + KNEE_CLEAR / M : r0 - KNEE_CLEAR / M;
    const across = longX ? hostMat.y + hostMat.h / 2 : hostMat.x + hostMat.w / 2;
    const KNEE = new THREE.Vector3(u(longX ? alongK : across), 0,
                                   u(longX ? across : alongK));
    const FWD = longX ? new THREE.Vector3(onHigh ? -1 : 1, 0, 0)
                      : new THREE.Vector3(0, 0, onHigh ? -1 : 1);
    // and the rest of him is behind his knees
    const H = KNEE.clone().addScaledVector(FWD, -0.178);
    const LFT = new THREE.Vector3(FWD.z, 0, -FWD.x);        // up cross forward
    window.__frame = { FWD: FWD, LFT: LFT, KNEE: KNEE,
                       RC: new THREE.Vector3(RCX, 0, RCZ), RO: u(RO) };
    const bear = (dx, dz) => Math.atan2(-dz, dx);
    // The handles point from the fire back TOWARD him, which is how you leave
    // a thing you mean to pick up. Derived rather than remembered: it comes
    // out at -2.3846 against the -2.4550 he set by eye, four degrees apart.
    const SET_AZ = bear(-FWD.x, -FWD.z);

    // ---- where the host kneels ----------------------------------------------
    // A mark on the mat, because everything else is placed FROM him: if he is
    // wrong, all of it is wrong, and until now he was an invisible pair of
    // numbers. Nicolas asked for a cursive M, whose two humps are his two
    // knees, and that is exactly the right drawing: it shows the pair, it
    // shows which way he faces, and it is obviously a guide rather than a
    // thing in the room.
    //
    // Drawn once into a canvas and laid flat. The image's UP is his forward,
    // so the mark turns with him and reads the same in all eight rooms.
    if (KNEES) {
      const KW = 0.400, KD = 0.550;                 // what a seiza occupies
      const c = document.createElement("canvas");
      c.width = 256; c.height = 352;
      const k = c.getContext("2d");
      k.strokeStyle = "rgba(227,66,52,0.80)";
      k.lineWidth = 13; k.lineCap = "round"; k.lineJoin = "round";
      k.beginPath();
      k.moveTo(24, 320);
      k.bezierCurveTo(24, 150, 40, 62, 76, 62);     // up over the left knee
      k.bezierCurveTo(112, 62, 128, 170, 128, 300); // down to the feet
      k.bezierCurveTo(128, 170, 144, 62, 180, 62);  // up over the right knee
      k.bezierCurveTo(216, 62, 232, 150, 232, 320); // and down
      k.stroke();
      // the knees themselves, so the two points are unambiguous
      k.fillStyle = "rgba(227,66,52,0.95)";
      [[76, 62], [180, 62]].forEach((q) => {
        k.beginPath(); k.arc(q[0], q[1], 13, 0, 6.2832); k.fill();
      });
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mk = new THREE.Mesh(new THREE.PlaneGeometry(KW, KD),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true,
          depthWrite: false, side: THREE.DoubleSide }));
      mk.rotation.x = -Math.PI / 2;
      // after lying it flat the image's up points along local -z, so the group
      // turns until that is his forward
      const mg = new THREE.Group();
      mg.add(mk);
      mg.rotation.y = Math.atan2(-FWD.x, -FWD.z);
      mg.position.copy(H).setY(0.0025);   // the canvas puts the knees 178 forward
      into.add(mg);
    }

    const putAt = (key, q, ry) => {
      const o = DOGU.OBJECTS.find((x) => x.key === key);
      const m = o.build();
      m.position.set(q.x, 0, q.z);
      if (ry !== undefined) m.rotation.y = ry;
      m.name = key;                    // so a probe can tell the utensils apart
      into.add(m); return m;
    };

    if (TI === 0 && !REV) {
      // his own placing, kept verbatim
      putAt("mizusashi", new THREE.Vector3(0.248, 0, 1.172));
      putAt("kensui", new THREE.Vector3(0.153, 0, 1.929));
      const natP = new THREE.Vector3(0.245, 0, 1.366);
      putAt("natsume", natP);
      const scoop = putAt("chashaku", natP, -2.4550);
      scoop.position.y = 0.0728;        // the lid is at 64.5, the scoop dips 8.3
      scoop.name = "chashaku";
      putAt("chasen", new THREE.Vector3(0.292, 0, 1.447)).name = "chasen";
      putAt("chawan", new THREE.Vector3(0.540, 0, 1.515));
      putAt("futaoki", new THREE.Vector3(0.885, 0, 1.480));
      const ladle = putAt("hishaku", new THREE.Vector3(0.8927, 0, 1.4737), -2.4550);
      ladle.rotation.z = -0.7545;
      ladle.position.y = 0.06615;
    } else {
      // ---- three rules of alignment -----------------------------------------
      // Nicolas's, and they place everything from the hearth's own diagonal:
      //
      //   the bowl sits at the corner of the hearth nearest his left knee;
      //   the lid rest, with the ladle, sits at the OPPOSITE corner;
      //   the water jar and the caddy line up on that same diagonal, running
      //     OUTWARD from the hearth past the bowl, the jar furthest out and
      //     the caddy between it and the bowl.
      //
      // So the hearth's diagonal does the whole arrangement, and there is
      // nothing left to place by eye.
      const knee = KNEE.clone().addScaledVector(LFT, 0.10);   // his left knee
      let near = null, far = null;
      const corners = [];
      for (const cx of [roX, roX + RO]) {
        for (const cz of [roY, roY + RO]) corners.push(new THREE.Vector3(u(cx), 0, u(cz)));
      }
      for (const q of corners) {
        const d = q.distanceTo(knee);
        if (!near || d < near.d) near = { q: q, d: d };
      }
      // The bowl turns so that the SCOOP lies parallel to the mat with its
      // handle toward the host. The scoop's handle is its local +X, measured:
      // that end is 6.1mm wide and 2.4mm thick where the other is 16.8mm
      // thick, the bend of the scoop. And bear() aims local +X. So aiming it
      // at -FWD is the whole instruction, and that is SET_AZ, already the
      // host's own bearing. It used to point back at the FIRE, which turned
      // the scoop across the mat in every room but the first.
      const set = DOGU.chawanSet();
      set.position.copy(near.q);
      set.rotation.y = SET_AZ;
      set.name = "set";
      into.add(set);

      // ---- the free square beside the hearth --------------------------------
      // Corrected by Nicolas, and his correction is a better rule than mine:
      // the water jar and the caddy do not run out along the hearth's
      // diagonal, they stand in the SQUARE BESIDE THE HEARTH, the part of the
      // hearth's own mat that the hearth leaves free across its width, with
      // the jar deepest and the caddy between it and the bowl.
      //
      // My version ran the diagonal outward past the bowl and straight into
      // the host: measured, the caddy landed 51mm from his left knee where it
      // needed 94. Beside the hearth there is room, and the arrangement is
      // the one he laid out by hand in the first room.
      //
      // So the frame is the free square's own: ACROSS from the hearth's edge
      // toward the free side, ALONG from the hearth's far end back toward the
      // host. Read out of the first room, his two objects sit at
      //     jar    across 287, along 160
      //     caddy  across 290, along 354
      // and putting those numbers back through this frame reproduces his
      // placing to a tenth of a millimetre, which is the check that the frame
      // is the same idea he had. Turned by the free side, they follow into any
      // of the eight.
      const across = (() => {
        // which side of the hearth the mat leaves free, across its width
        const lo = longX ? hostMat.y : hostMat.x;
        const hi = lo + (longX ? hostMat.h : hostMat.w);
        const c0 = longX ? roY : roX, c1 = c0 + RO;
        const toLo = c0 - lo, toHi = hi - c1;
        const sgn = toHi >= toLo ? 1 : -1;
        return longX ? new THREE.Vector3(0, 0, sgn) : new THREE.Vector3(sgn, 0, 0);
      })();
      const half = u(RO) / 2;
      const O = new THREE.Vector3(RCX, 0, RCZ)
        .addScaledVector(FWD, half).addScaledVector(across, half);
      const BACK = FWD.clone().negate();
      const inSquare = (ac, al) => O.clone()
        .addScaledVector(across, ac).addScaledVector(BACK, al);
      putAt("mizusashi", inSquare(0.287, 0.160));
      putAt("natsume", inSquare(0.290, 0.354));

      // ---- the lid rest and the ladle ---------------------------------------
      // His rule, exactly: the corner opposite the bowl, on the SIDE OF THE
      // HEARTH THE HOST SITS AT. So the two corners of the hearth's near edge
      // are the bowl's and the rest's. The bowl already took the one nearest
      // his left knee, so the rest takes its mirror across the hearth, same
      // distance forward.
      const RC = new THREE.Vector3(RCX, 0, RCZ);
      const bowlRel = near.q.clone().sub(RC).setY(0);
      let restQ = RC.clone()
        .addScaledVector(FWD, bowlRel.dot(FWD))
        .addScaledVector(LFT, -bowlRel.dot(LFT));
      const side = bowlRel.dot(LFT) >= 0 ? 1 : -1;   // the side the bowl took

      // In the corner-hearth the fire touches the wall, so that corner IS the
      // wall: the rest's own box left the mats by 24mm there. So it is pulled
      // straight back in along the hearth's edge, by the least that puts both
      // the rest and the ladle on the floor.
      //
      // And the handle takes the FIRST of his two allowed directions that can
      // be made to fit, aimed at his knee before parallel to the mat, with
      // the pull searched inside that choice. Ordered the other way round the
      // corner-hearth kept the smallest pull, 25mm, and paid for it with the
      // one handle direction nobody wants: the ladle lying back across the
      // bowl, because parallel-toward-the-host missed the mat by 2mm.
      //
      // bear() aims the ladle's local +X, which is its handle: in his room 1
      // the ladle and the scoop carry the SAME rotation.y, -2.4550, because
      // both are that one axis.
      const inMats = (o) => { o.updateMatrixWorld(true);
        const bb = new THREE.Box3().setFromObject(o);
        return bb.min.x > 0 && bb.max.x < u(U) && bb.min.z > 0 && bb.max.z < u(U); };
      const towardBowl = near.q.clone().sub(restQ).setY(0).normalize();
      // The handle stands at 45 degrees to the hearth's edge, turned back
      // toward the host: the edge runs along towardBowl, the host lies along
      // -FWD, so the bisector of the two is the direction. That is also what
      // he drew by hand in room 1, where the handle came out at 39 degrees
      // from the edge. The other diagonal and the straight-back parallel are
      // kept only as fallbacks for a corner with no floor.
      const D45 = (a1, b1) => a1.clone().add(b1).setY(0).normalize();
      const HANDLES = [
        ["45 vers le bol", () => D45(FWD.clone().negate(), towardBowl)],
        ["45 de l'autre cote", () => D45(FWD.clone().negate(), towardBowl.clone().negate())],
        ["parallele, vers l'hote", () => FWD.clone().negate()],
      ];
      const fut = putAt("futaoki", restQ);
      let ladle = null, PULL = 0, HAND = "";
      outer:
      for (const [label, dirOf] of HANDLES) {
        for (let d = 0; d <= 0.30; d += 0.005) {
          fut.position.copy(restQ.clone().addScaledVector(towardBowl, d));
          if (!inMats(fut)) continue;
          const dir = dirOf(fut.position);
          if (ladle) into.remove(ladle);
          ladle = putAt("hishaku", fut.position.clone().addScaledVector(dir, -0.008),
                        bear(dir.x, dir.z));
          ladle.rotation.z = -0.7545;
          ladle.position.y = 0.06615;
          if (inMats(ladle)) { PULL = d; HAND = label; break outer; }
        }
      }
      window.__rest = { pull: Math.round(PULL * 1000), handle: HAND };

      // The slop bowl has no rule of his, so it took a guess of mine, 440 back
      // and 160 to his left, and the guess was wrong: the knee marker is
      // 400 x 550, so 160 across is INSIDE it. The bowl was standing on the
      // host. His own room 1 puts it 377 back and 325 to his left, just clear
      // of the marker's width, so those are the numbers, mirrored to whichever
      // side the bowl took, and pulled in if that side is a wall.
      // ---- the slop bowl, beside him ----------------------------------------
      // Nicolas's rule, and the one object that had none: BESIDE the host,
      // not behind him and not under him, and always on the side that hides
      // it from the guests, which is the side of him away from them. That is
      // right for what it is: the water already used, kept out of their sight
      // until it leaves the room.
      //
      // Beside is a measurement, not a feeling. The marker is 400 wide and
      // the bowl's own radius is 72, so anything under 272 across is standing
      // on him: 302 across leaves 30mm of daylight, and he confirmed that
      // distance. Along, he put it level with the host's FEET, which is his
      // own room 1, 377 back. The marker runs from 97 in front of the knees
      // to 453 behind, so 377 is near its foot without being at its heels.
      //
      // Two wrong ones of mine on the way: 160 across, which put the bowl
      // inside his body, and 453 back, which put it behind him.
      //
      // Where the guests sit is a field of the room table, not a guess, and
      // REV mirrors it with everything else, so the side follows the eight
      // layouts by itself.
      const GUESTS = (() => {
        const g = TYPE.guests;
        let x = 0, z = 0;
        g.forEach((q) => { x += mirror(q[0]); z += q[1]; });
        return new THREE.Vector3(u(x / g.length), 0, u(z / g.length));
      })();
      window.__guests = GUESTS.clone().sub(KNEE).setY(0).dot(LFT);
      const away = GUESTS.clone().sub(KNEE).setY(0).dot(LFT) >= 0 ? -1 : 1;
      putAt("kensui", KNEE.clone().addScaledVector(FWD, -0.377)
                                  .addScaledVector(LFT, 0.302 * away));
    }

    // And the kettle stands ON THE TRIVET, down in the hearth, not on the
    // mat: sunk 90 into the ro its lid comes about 100 above the floor, which
    // is where a kettle's lid is when you reach for it kneeling.
    const kettle = putAt("kama", new THREE.Vector3(RCX, 0, RCZ));
    kettle.position.y = ASH + 0.061;

    // The seat and what it faces belong to the room, so they are set here and
    // the looking-about machinery lives outside: registering the pointer
    // listeners in here would have stacked a new pair on every change of
    // room, and each one would have turned the head again.
  // What the ROOM decides and the page must be told: where a guest sits and
  // what he faces. The seat is not a tuned number, it is the table's own
  // `guests` field; the aim is the fire. Returning them instead of writing
  // them into one page's camera is the whole reason this file exists.
  const gseat = TYPE.guests[0];
  const seat = new THREE.Vector3(u(mirror(gseat[0])) + (REV ? 0.06 : -0.06),
                                 1.01, u(gseat[1]) + 0.30);
  const aim = new THREE.Vector3(RCX, 0.34, RCZ);

  group.traverse((o) => {
    if (o.isMesh && !o.material.isMeshBasicMaterial) {
      o.castShadow = true; o.receiveShadow = true;
    }
  });

  return { TYPE: TYPE, RC: new THREE.Vector3(RCX, 0, RCZ), KNEE: KNEE,
           FWD: FWD, LFT: LFT, seat: seat, aim: aim,
           // The EMBERS, down on the ash at -85, and NOT the same point as
           // `aim`, which is the kettle's body 340 up. A page framing the fire
           // must frame what glows: framed by `aim` the test passed at once
           // while the embers sat 8% outside the frame, and the fire stayed
           // out of shot. That was the whole of "on ne voit pas le feu".
           ember: new THREE.Vector3(RCX, ASH + 0.02, RCZ),
           roX: roX, roY: roY, hostMat: hostMat };
  }


  // ---- the tokonoma -------------------------------------------------------
  // The alcove and everything in it: the bay behind the back wall, the raised
  // board, the otoshigake lintel, the kakemono, one flower in a bamboo tube,
  // and the toko-bashira in its corner.
  //
  // Extracted for the fourth time this pattern has paid, and this time because
  // the pavilion in the roji had INVENTED a second tokonoma: a platform
  // 1700 x 320 x 1000 standing a metre into the room. A tokonoma is a recess
  // beyond the wall, not a shelf inside it, and the plan's three by three has
  // no room for the shelf. One function, one alcove, and the question cannot
  // come back.
  //
  // opt.glow: false to leave out the warm point light, for a page that lights
  // its own interior.
  function tokonoma(group, opt) {
    into = group;
      // the alcove: the back wall stands a bay deeper, and the wall beside it
      slab(u(U) + 0.04, WALL_H, 0.02, PLASTER, u(U / 2), WALL_H / 2, -TOKO_D - 0.01);
      slab(u(U - 2) + 0.02, WALL_H, TOKO_D, PLASTER, u(2 + (U - 2) / 2), WALL_H / 2, -TOKO_D / 2);
      // ---- the alcove ---------------------------------------------------------
      // Its raised board, its lintel, and what hangs in it. Until now it was a
      // recess and nothing else: unlit and empty, it read as a hole in the wall.
      // A tokonoma is the one place in the room you are meant to look at, so an
      // empty one is not restraint, it is an unfinished room.
      slab(u(2), 0.045, TOKO_D, WOOD, u(1), -0.0225, -TOKO_D / 2);
      // the otoshigake, the lintel that lowers the opening below the ceiling
      const TOKO_TOP = 1.60;
      slab(u(2), 0.075, 0.045, mat(0x3f3225, 0.8), u(1), TOKO_TOP + 0.0375, -0.022);
      slab(u(2) + 0.04, WALL_H - TOKO_TOP - 0.075, TOKO_D, PLASTER,
           u(1), (TOKO_TOP + 0.075 + WALL_H) / 2, -TOKO_D / 2);

      // The KAKEMONO. Paper, a silk mounting, a rod at the top and a weighted
      // roller at the foot, all drawn once into a canvas rather than built: at
      // this size the geometry of a scroll is a rectangle and everything that
      // matters about it is the image.
      // It carries the four principles, the same 和敬清寂 the chanoyu chapter
      // hangs as a modern kakemono, so the two places agree.
      const scroll = (function () {
        const W = 220, H = 640, c = document.createElement("canvas");
        c.width = W; c.height = H;
        const g2 = c.getContext("2d");
        g2.fillStyle = "#6d6047"; g2.fillRect(0, 0, W, H);          // the mounting silk
        g2.fillStyle = "#5b4f39"; g2.fillRect(0, 0, W, 8); g2.fillRect(0, H - 8, W, 8);
        g2.fillStyle = "#ddd3b8"; g2.fillRect(16, 96, W - 32, H - 200);  // the paper
        g2.fillStyle = "#7a6c50";
        g2.fillRect(16, 96, W - 32, 2); g2.fillRect(16, H - 106, W - 32, 2);
        // a little foxing, so the paper is not a flat swatch
        for (let i = 0; i < 260; i++) {
          const x = 18 + Math.random() * (W - 36), y = 100 + Math.random() * (H - 208);
          g2.fillStyle = "rgba(150,126,88," + (0.03 + Math.random() * 0.07).toFixed(3) + ")";
          g2.beginPath(); g2.arc(x, y, 1 + Math.random() * 5, 0, 6.3); g2.fill();
        }
        g2.fillStyle = "#241b13";
        g2.font = "600 44px serif"; g2.textAlign = "center"; g2.textBaseline = "middle";
        ["和", "敬", "清", "寂"].forEach((ch, i) => g2.fillText(ch, W / 2, 175 + i * 76));
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })();
      const kake = new THREE.Mesh(
        new THREE.PlaneGeometry(0.400, 1.164),
        new THREE.MeshStandardMaterial({ map: scroll, roughness: 0.92, metalness: 0 }));
      kake.position.set(u(1), 0.435 + 1.164 / 2, -TOKO_D + 0.014);
      into.add(kake);
      // its rods
      slab(0.420, 0.012, 0.012, mat(0x2b2119, 0.8), u(1), 1.605, -TOKO_D + 0.020);
      slab(0.452, 0.022, 0.022, mat(0x2b2119, 0.8), u(1), 0.428, -TOKO_D + 0.024);

      // one flower, in a bamboo tube on the board
      // lathe and glaze come from the shared file, which is exactly why they were
      // exposed alongside the objects: the room wants to turn a bamboo tube too.
      const vase = DOGU.lathe([
        [0.000, 0.000], [0.000, 0.026], [0.000, 0.026], [0.004, 0.028],
        [0.090, 0.029], [0.170, 0.028], [0.176, 0.027], [0.176, 0.027],
        [0.176, 0.022], [0.176, 0.022], [0.100, 0.023], [0.020, 0.022],
        [0.012, 0.000],
      ], 32, 4.4, 0.10);
      DOGU.glaze(vase, 7.2, [0.300, 0.255, 0.170], [0.560, 0.500, 0.360], 0.20,
            undefined, 0, 0, 0, 0.30);
      const vm = new THREE.Mesh(vase, mat(0xffffff, 0.55));
      vm.material.vertexColors = true; vm.material.side = THREE.DoubleSide;
      vm.position.set(u(1) - 0.30, 0.045, -TOKO_D + 0.19);
      into.add(vm);
      // A bare branch and one bud, which is all a tea room allows. Both were
      // placed by typed coordinates and both were wrong for it: the stem was a
      // cylinder turned about its MIDDLE, and its middle sits above the rim, so
      // tilting it swung the foot 45mm sideways in a tube of 22mm inner radius
      // and the branch came out through the wall. The bud's position was a third
      // set of typed numbers that simply missed the stem's real tip.
      //
      // So they become one group, rooted just inside the rim, and the bud rides
      // the tip by arithmetic. Turned about the root the foot barely moves, and
      // the bud cannot come off whatever the tilt.
      const VASE_Y = 0.045, MOUTH = 0.176, R_IN = 0.022;   // from the tube's profile
      const spray = new THREE.Group();
      spray.position.set(u(1) - 0.30, VASE_Y + MOUTH - 0.026, -TOKO_D + 0.19);
      spray.rotation.z = -0.30; spray.rotation.x = 0.12;
      into.add(spray);
      const STEM_L = 0.210;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0032, STEM_L, 5),
        mat(0x36301f, 0.9));
      stem.position.y = STEM_L / 2;              // rooted at the group, not centred
      spray.add(stem);
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.010, 12, 9),
        mat(0xb8574a, 0.62));
      bud.position.y = STEM_L + 0.006;           // riding the tip, 4mm into it
      spray.add(bud);

      // ---- the toko-bashira ---------------------------------------------------
      // The alcove post, and the one member of the room that is deliberately NOT
      // squared: a natural trunk, barely worked, standing floor to ceiling at the
      // corner of the tokonoma. Everything else here is a straight line, which is
      // exactly why it tells: the room admits one thing that grew.
      //
      // Built as a sweep rather than a lathe, because a lathe has a straight axis
      // and the whole point of this post is that its axis wanders. Rings up the
      // height, each displaced a little and each a little narrower than the last.
      (function tokobashira() {
        const BX = u(2) - 0.062, BZ = -0.052;      // in the corner of the alcove
        const NS = 28, M = 40;                     // 28 sides caps the grain at 14
        const pos = [], idx = [], col = [];
        const toLin = DOGU.toLin;
        let prev = -1;
        for (let i = 0; i <= M; i++) {
          const f = i / M, y = f * WALL_H;
          // the wander: two slow bends, a few millimetres each, plus a lean
          const dx = 0.026 * Math.sin(f * 2.3 + 0.7) + 0.011 * Math.sin(f * 5.1 + 2.2);
          const dz = 0.019 * Math.sin(f * 1.9 + 2.9) + 0.009 * Math.sin(f * 4.3);
          const r = 0.059 - 0.011 * f;             // 118mm at the foot, 96 at the head
          const base = pos.length / 3;
          for (let k = 0; k < NS; k++) {
            const t = k / NS * Math.PI * 2;
            // out of round, and the lobes drift as they rise, the way a trunk does
            const lob = 1 + 0.030 * Math.sin(3 * t + f * 2.0)
                          + 0.017 * Math.sin(5 * t + f * 3.4);
            const rr = r * lob;
            pos.push(BX + dx + Math.cos(t) * rr, y, BZ + dz + Math.sin(t) * rr);
            // grain running UP the post, which is the way a fibre runs, and at 9
            // and 13 cycles it stays under what 28 sides can carry
            const g = 0.485 + 0.034 * Math.sin(9 * t + 1.1) + 0.020 * Math.sin(13 * t)
                    + 0.024 * Math.sin(f * 26 + t * 2.0);
            col.push(toLin(g), toLin(g * 0.845), toLin(g * 0.640));
          }
          if (prev >= 0) {
            for (let k = 0; k < NS; k++) {
              const n = (k + 1) % NS;
              idx.push(prev + k, prev + n, base + n, prev + k, base + n, base + k);
            }
          }
          prev = base;
        }
        const g3 = new THREE.BufferGeometry();
        g3.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g3.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        g3.setIndex(idx);
        g3.computeVertexNormals();
        into.add(new THREE.Mesh(g3, new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.52, metalness: 0,
        })));
      })();

      // The light the little window is FOR. It enters travelling across the
      // alcove, so it rakes the scroll rather than facing it, which is what a
      // bokuseki-mado is placed to do; and a soft warm point stands in for the
      // bounce off the board, without which the back of the recess stays black
      // however bright the paper looks.
      const glow = new THREE.PointLight(0xffe9c4, 0.55, 1.5, 2);
      glow.position.set(0.26, 1.05, -0.30);
      if (!opt || opt.glow !== false) into.add(glow);
    group.traverse((o) => {
      if (o.isMesh && !o.material.isMeshBasicMaterial) {
        o.castShadow = true; o.receiveShadow = true;
      }
    });

    // Where the alcove IS, so a page can aim at it without a magic number. A
    // tea room is arranged around two things, the fire and the tokonoma, and a
    // page that wants both in one frame must be told where the second stands.
    // Its centre, at the height of the scroll rather than of the board.
    // Where each thing IS, so a page can point at it without transcribing a
    // coordinate. The roji had the scroll's dot at z -1860 and the flower's at
    // -1150, which were true of the tokonoma it used to invent: after the shared
    // alcove moved in, both dots hung in the air over the wrong places. A
    // transcribed position is a position that will be wrong once.
    return {
      centre: new THREE.Vector3(u(1), 1.05, -TOKO_D / 2),
      scroll: new THREE.Vector3(u(1), 0.435 + 1.164 / 2, -TOKO_D + 0.014),
      flower: new THREE.Vector3(u(1) - 0.30, VASE_Y + MOUTH + 0.12, -TOKO_D + 0.19),
    };
  }

  global.CHASHITSU = {
    layout: layout, tokonoma: tokonoma, TOKO_D: TOKO_D,
    U: U, RO: RO, M: M, u: u,
    WALL_H: WALL_H, MAT_T: MAT_T, RO_DEEP: RO_DEEP,
  };
})(this);
