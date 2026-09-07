// The ever-morphing blob, shared by the landing's big emblem and the small brand
// mark on every other page (same 9-point wobble math as the phone launcher's
// blobPath() / oftenback.io). Call startNakataBlob(canvasEl) once per canvas;
// each gets its own independent animation loop and phase.
// Pass seedT to pin an EXACT starting phase (e.g. 0) -- used when two canvases
// must wobble identically, like the two door-halves of a split-open reveal,
// which are really one blob clipped into two panels.
// Without seedT, the phase derives from the wall clock (Date.now()) rather
// than a random offset. This matters for the landing-blob -> docked-mark
// handoff across a page navigation: the shape is what keeps wobbling
// independent of position, so if the new page's canvas started at a random
// phase, the shape would visibly jump even though the position/size land
// exactly right. Seeding both from the same real-time clock means whichever
// canvas exists at a given moment is close to the same shape, because
// they're both really just sampling one shared clock, not running their own.
// alpha is optional. It exists because the mark, at the site's usual 10%, is a
// pale whisper on cream and very nearly INVISIBLE over the blue of the cherry
// window -- measured: 26/255 at its strongest. That stopped being a matter of
// taste when the mark became the way home.
function startNakataBlob(cv, seedT, alpha) {
  const ctx = cv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssSize = cv.width; // internal resolution == intended CSS pixel size
  cv.width = cssSize * dpr; cv.height = cssSize * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const CX = cssSize / 2, CY = cssSize / 2, R = cssSize * 0.42;
  const BLOB_RGB = '227,66,52';   // vermillion
  const BLOB_ALPHA = (alpha === undefined ? 0.10 : alpha);

  function blobPath(cx, cy, r, t, seed) {
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) {
      const ang = 2 * Math.PI * i / n;
      const wobble = 0.07 * Math.sin(t * 0.7 + ang * 3 + seed) + 0.05 * Math.sin(t * 0.425 - ang * 2 + seed * 1.7);
      const rr = r * (1 + wobble);
      pts.push([cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]);
    }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const p = new Path2D();
    const first = mid(pts[n - 1], pts[0]);
    p.moveTo(first[0], first[1]);
    for (let i = 0; i < n; i++) {
      const cur = pts[i], next = pts[(i + 1) % n], m = mid(cur, next);
      p.quadraticCurveTo(cur[0], cur[1], m[0], m[1]);
    }
    p.closePath();
    return p;
  }

  let last = performance.now();
  let T = (typeof seedT === 'number') ? seedT : (Date.now() % 1000000) / 1000;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    T += dt;
    ctx.clearRect(0, 0, cssSize, cssSize);
    ctx.fillStyle = 'rgba(' + BLOB_RGB + ',' + BLOB_ALPHA + ')';
    ctx.fill(blobPath(CX, CY, R, T, 0));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
