// THE CONTROLS OF EVERY SPACE, in one place.
//
// A space declares what its keys mean and this builds the panel from it: a cap
// and a gloss per row, bound to the key AND pressable with a finger, lit while
// it is doing something, plus the ring of four arrows wherever there is
// somewhere to walk.
//
// WHY PRESSABLE IS THE POINT: a phone has no arrow keys. Written as labels the
// rows read like instructions a visitor cannot follow, and a garden you can
// look at but not walk is a picture.
//
// ONE HELD MAP, SHARED. The ring's arrows and the keyboard's arrows write to
// the same place, so a space asks one thing whether it is walking and there is
// no second implementation to drift from the first.
//
// ONE VOCABULARY, and it is the reason this is a file rather than a habit:
//   ARROWS   to move            DRAG     to turn
//   H        from above         I        what this is
//   S        the sound of the place
//   + -      the light          PG UP/DN to rise, to crouch
// A space that means one of these uses that cap. A space with a verb of its
// own gives it a cap of its own.
(function () {
  "use strict";

  const HELD = {};

  // A CAP IS THE KEY IT NAMES. Caps absent from this table are labels: DRAG
  // and MOUSE name the hand and not a key, and a label is not pressable.
  const CODES = {
    A: "KeyA", D: "KeyD", H: "KeyH", I: "KeyI", R: "KeyR", S: "KeyS",
    T: "KeyT", V: "KeyV", SPACE: "Space",
    "PG UP": "PageUp", "PG DN": "PageDown",
    "+": "Equal", "−": "Minus",
  };
  // and the ones a cap can be pressed INSTEAD of, for keyboards that put them
  // elsewhere
  const ALSO = { Equal: ["NumpadAdd"], Minus: ["NumpadSubtract"] };
  const ARROWS = { up: "ArrowUp", dn: "ArrowDown", lf: "ArrowLeft", rt: "ArrowRight" };
  const SAYS = { up: "forward", dn: "back", lf: "turn left", rt: "turn right" };

  function Controls(spec) {
    const el = document.getElementById(spec.id) || document.createElement("div");
    el.id = spec.id;
    el.className = "ctl" + (spec.cls ? " " + spec.cls : "");
    el.textContent = "";
    el.hidden = spec.hidden !== false;
    if (!el.parentNode) document.body.appendChild(el);

    let ring = null;
    if (spec.ring) {
      ring = document.createElement("div");
      ring.className = "ring ctl-ring";
      Object.keys(ARROWS).forEach(function (k) {
        const code = ARROWS[k];
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ar " + k;
        b.dataset.key = code;
        b.setAttribute("aria-label", SAYS[k]);
        // A PRESS IS A KEY HELD DOWN, and a finger that slides off is a key
        // let go: without the leave and cancel the room walked on for ever.
        const down = function (ev) { ev.preventDefault(); HELD[code] = true; };
        const up = function () { HELD[code] = false; };
        b.addEventListener("pointerdown", down);
        b.addEventListener("pointerup", up);
        b.addEventListener("pointerleave", up);
        b.addEventListener("pointercancel", up);
        ring.appendChild(b);
      });
      el.appendChild(ring);
    }

    const keys = document.createElement("div");
    keys.className = "keys";
    const rows = (spec.rows || []).map(function (r) {
      const caps = [r.cap];
      // A ROW MAY ANSWER TO MORE THAN ONE KEY and still be one cap: rising and
      // crouching are one thing done two ways. `keys` is what the keyboard
      // does, `press` is what a finger on the row does, and a row with keys
      // but no press is a row only a keyboard can work.
      const codes = r.keys ? Object.keys(r.keys) : [CODES[r.cap]];
      const live = !!r.press;
      const b = document.createElement(live ? "button" : "div");
      if (b.tagName === "BUTTON") b.type = "button";
      b.className = "krow" + (live ? "" : " label");
      const cap = document.createElement("kbd");
      cap.textContent = caps[0];
      b.appendChild(cap);
      const says = document.createElement("span");
      says.className = "d";
      says.textContent = r.says || "";
      b.appendChild(says);
      if (live) {
        b.addEventListener("click", function (ev) {
          ev.preventDefault(); r.press();
        });
      }
      keys.appendChild(b);
      return { r: r, el: b, says: says, codes: codes };
    });
    el.appendChild(keys);

    // THE KEYBOARD, bound once. A row with a press answers to its key; the
    // arrows are held rather than pressed, and the space reads that off the
    // shared map. e.code is the PHYSICAL key, so this is the same finger on
    // AZERTY.
    const held = spec.held !== false;
    function wants(code) {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i].r;
        if (r.keys) {
          const ks = Object.keys(r.keys);
          for (let j = 0; j < ks.length; j++) {
            if (ks[j] === code) return r.keys[ks[j]];
            if ((ALSO[ks[j]] || []).indexOf(code) >= 0) return r.keys[ks[j]];
          }
          continue;
        }
        const c = rows[i].codes[0];
        if (!c || !r.press) continue;
        if (c === code || (ALSO[c] || []).indexOf(code) >= 0) return r.press;
      }
      return null;
    }
    addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (spec.live && !spec.live()) return;
      if (held && ARROWS_SET[e.code]) {
        HELD[e.code] = true;
        e.preventDefault();            // or the page scrolls under the space
        return;
      }
      const act = wants(e.code);
      if (!act) return;
      e.preventDefault();
      act();
    });
    addEventListener("keyup", function (e) {
      if (ARROWS_SET[e.code]) HELD[e.code] = false;
    });

    function paint() {
      if (ring) {
        ring.querySelectorAll(".ar").forEach(function (b) {
          b.classList.toggle("on", !!HELD[b.dataset.key]);
        });
      }
      rows.forEach(function (q) {
        if (q.r.lit) q.el.classList.toggle("on", !!q.r.lit());
      });
    }
    function says(cap, text) {
      rows.forEach(function (q) {
        if (q.r.cap === cap) q.says.textContent = text;
      });
    }
    function show(on) { el.hidden = !on; }

    return { el: el, paint: paint, says: says, show: show, held: HELD,
             rows: rows };
  }

  const ARROWS_SET = {};
  Object.keys(ARROWS).forEach(function (k) { ARROWS_SET[ARROWS[k]] = 1; });

  Controls.held = HELD;
  Controls.ARROWS = ARROWS;
  window.Controls = Controls;
})();
