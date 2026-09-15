// water-fill.js
// ---------------------------------------------------------------------------
// Water in a vessel, and the level of it.
//
// This room has never had any water inside it. The tsukubai in the roji is
// the only water on the site and it is a flat plane in a stone basin; a bowl
// that fills, is emptied, fills again and is emptied again is another thing.
//
// A SURFACE IS A DISC, and its radius is the vessel's own at that height,
// measured on the mesh. A chawan's wall is not a cylinder, so one radius for
// the whole depth is either a disc floating in the middle of the bowl or a
// disc through its side.
//
// It lives here rather than inside the tea room because the bench needs the
// same water: two pages cannot share geometry that is written inside one of
// them. Sizes are in METRES.
// ---------------------------------------------------------------------------
(function (global) {
  "use strict";

  const _v = new THREE.Vector3();

  // The vessel's inside, as twenty-four rings from its floor to its lip: the
  // NARROWEST vertex at each height, which is the inner wall. Down at the
  // foot there is no inside at all and the narrowest thing is the axis
  // itself, so a caller gives the floor separately -- it has usually
  // measured it already for something else.
  function profile(obj, rings) {
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj, true);
    const c = box.getCenter(new THREE.Vector3());
    const N = rings || 24, lo = box.min.y, hi = box.max.y, step = (hi - lo) / N;
    const ring = new Array(N + 1).fill(1e9);
    obj.traverse((m) => {
      // WATER IS NOT THE VESSEL. The film clings to the inside of the bowl
      // as a child of it, so once it exists a second profile taken of the
      // bowl would measure the film's own wall a millimetre in -- and every
      // number downstream would drift. A surface never measures itself.
      if (m.name === "froth-film" || m.name === "water") return;
      const pa = m.geometry && m.geometry.attributes && m.geometry.attributes.position;
      if (!pa) return;
      for (let i = 0; i < pa.count; i++) {
        _v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld);
        const k = Math.round((_v.y - lo) / step);
        if (k < 0 || k > N) continue;
        const r = Math.hypot(_v.x - c.x, _v.z - c.z);
        if (r < ring[k]) ring[k] = r;
      }
    });
    return { lo: lo, hi: hi, step: step, ring: ring, c: c, box: box };
  }

  function radiusAt(pr, y) {
    const q = Math.max(0, Math.min(pr.ring.length - 1.001, (y - pr.lo) / pr.step));
    const i = Math.floor(q), f = q - i;
    const a = pr.ring[i], b = pr.ring[i + 1];
    if (a > 1e8) return b > 1e8 ? 0 : b;
    if (b > 1e8) return a;
    return a + (b - a) * f;
  }

  // PALE, NOT DARK, and that was a surprise worth writing down. Water is
  // dark in the hand, and a smooth dark disc in a black chawan is invisible:
  // with no environment map it reflects the two lights in two small spots
  // and nothing else. What a guest actually sees in a bowl of hot water is
  // the paper window lying in it. So the surface carries that -- pale,
  // smooth, and with a little light of its own against the shadow the bowl's
  // own wall throws over it. The same lesson the matcha taught, on another
  // object.
  function material(o) {
    o = o || {};
    return new THREE.MeshStandardMaterial({
      color: o.color === undefined ? 0x8fa8ad : o.color,
      roughness: 0.05, metalness: 0.0,
      emissive: o.emissive === undefined ? 0x20302f : o.emissive,
      emissiveIntensity: 1.0,
      transparent: true, opacity: o.opacity === undefined ? 0.62 : o.opacity,
      side: THREE.DoubleSide,
    });
  }

  function make(parent, o) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 48), material(o));
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    m.frustumCulled = false;         // it is moved and scaled every frame
    m.name = "water";
    if (parent) parent.add(m);
    return m;
  }

  // level 0 is the vessel's floor and 1 its lip; under a hundredth there is
  // none at all. Returns the radius it took, so a caller can say what it saw.
  function fill(water, pr, floorY, level) {
    if (!water) return 0;
    if (level <= 0.01) { water.visible = false; return 0; }
    const y = floorY + (pr.hi - floorY) * Math.min(1, level);
    const r = Math.max(0.001, radiusAt(pr, y) - 0.0015);
    const p = new THREE.Vector3(pr.c.x, y, pr.c.z);
    if (water.parent) water.parent.worldToLocal(p);
    water.position.copy(p);
    water.scale.set(r, r, 1);
    water.visible = true;
    return r;
  }

  // ---- WHAT THE FROTH LEAVES BEHIND ---------------------------------------
  // A film on the inner wall, not a pool on the floor: "quand le bol
  // reapparait, il est vide mais un peu de mousse verte le recouvre a
  // l'interieur." A pool would be right and invisible -- a residue lies at
  // the bottom, and the bottom of this bowl cannot be seen from a seated
  // guest's eye. What CAN be seen is the far inner wall, so that is what is
  // tinted.
  //
  // The surface is not drawn freehand: the profile already holds the inner
  // radius at twenty four heights, measured on the mesh, so the film is a
  // lathe of those very points, inset a millimetre so as not to fight the
  // ceramic for the same pixels.
  function film(obj, pr, floorY, o) {
    o = o || {};
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj, true);
    // NOT A FILM: PATCHES. A continuous skin up the wall read as water --
    // "la mousse laissee ressemble a de l'eau, comme si le bol etait
    // maintenant rempli d'eau" -- because a smooth surface of one colour at
    // one level is exactly what a liquid is. What froth leaves is uneven:
    // "faisons des taches vertes de tailles differentes sur les parois
    // interieures." So: a scatter of small discs lying on the wall itself,
    // each one tangent to it, none of them level with another.
    const group = new THREE.Group();
    group.name = "froth-film";
    const mat = new THREE.MeshStandardMaterial({
      color: o.color === undefined ? 0x9ec258 : o.color,
      roughness: 0.88, metalness: 0.0,
      emissive: o.emissive === undefined ? 0x22350c : o.emissive,
      emissiveIntensity: 1.0,
      transparent: true, opacity: o.opacity === undefined ? 0.55 : o.opacity,
      side: THREE.DoubleSide, depthWrite: false,
    });
    // DETERMINISTIC, not random: the same bowl must speckle the same way
    // every time the page is opened, or a still cannot be compared with the
    // one before it.
    const hash = (i) => {
      const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    const N = o.count === undefined ? 22 : o.count;
    const upTo = o.upTo === undefined ? 0.70 : o.upTo;
    const lipY = pr.hi;
    for (let i = 0; i < N; i++) {
      // up the wall, and round it, both spread by the hash
      const f = 0.06 + hash(i * 3 + 1) * upTo;
      const y = floorY + (lipY - floorY) * f;
      const r = radiusAt(pr, y);
      if (!(r > 0.004)) continue;
      const th = hash(i * 3 + 2) * Math.PI * 2;
      // the wall's own slope at that height, so the patch lies ON it
      const dr = (radiusAt(pr, y + pr.step) - radiusAt(pr, y - pr.step)) /
                 (2 * pr.step);
      const nIn = new THREE.Vector3(-Math.cos(th), dr, -Math.sin(th)).normalize();
      // SIZES THAT DIFFER, which is the whole of what he asked for: a fifth
      // of a patch to a whole one, and the small ones outnumber the big.
      const s = 0.0022 + Math.pow(hash(i * 3 + 3), 2.2) * 0.0075;
      const disc = new THREE.Mesh(new THREE.CircleGeometry(s, 12), mat);
      disc.position.set(pr.c.x + Math.cos(th) * (r - 0.0008), y,
                        pr.c.z + Math.sin(th) * (r - 0.0008));
      obj.worldToLocal(disc.position);
      disc.lookAt(disc.position.clone().add(nIn));
      group.add(disc);
    }
    if (!group.children.length) return null;
    group.visible = false;
    group.traverse((c) => { c.frustumCulled = false; });
    obj.add(group);
    // the material is shared by every patch, so one opacity moves them all
    group.material = mat;
    return group;
  }

  global.WATER = { profile: profile, radiusAt: radiusAt, make: make,
                   fill: fill, material: material, film: film };
})(this);
