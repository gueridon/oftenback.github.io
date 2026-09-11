// The room, drawn FLAT. One drawer for every page that needs the plan.
//
// It lived inside chashitsu.html, and then room3d.html wanted the same picture
// in a corner so a visitor could see what he is standing in. Copying it would
// have been the copy this project keeps learning not to make, and the two
// would have parted company the first time a mat moved. So the drawing came
// out here, beside the table it reads (chashitsu-room.js) and the furnishing
// that raises it in three dimensions (chashitsu-layout.js).
//
// It knows nothing of a page: no note, no buttons, no layout. It builds the
// parts into an <svg> you hand it and gives you back one function, draw(ti,
// reversed). What the text says around it belongs to whoever mounted it.
(function (global) {
  const NS = "http://www.w3.org/2000/svg";

  // The frame the drawing is composed in: three units of room, plus the bay
  // the alcove stands in above it. Any page mounting a plan wants this on its
  // <svg>, so it is published rather than retyped.
  const VIEWBOX = "0 -0.74 3 3.74";

  // A default look, injected once, and deliberately WEAK: it is matched on an
  // attribute, so a page with its own `#plan .mat` rules keeps them. That is
  // how chashitsu.html goes on looking exactly as it did.
  const CSS = `
    svg[data-chashitsu-plan]{display:block;width:100%;height:auto;overflow:visible;}
    svg[data-chashitsu-plan] .wall{fill:none;stroke:#3d3530;stroke-width:2.2;
      vector-effect:non-scaling-stroke;}
    svg[data-chashitsu-plan] .mat{fill:#efe7da;stroke:#c9bfae;stroke-width:1;
      vector-effect:non-scaling-stroke;
      transition:x .55s cubic-bezier(.5,0,.2,1),height .55s cubic-bezier(.5,0,.2,1);}
    svg[data-chashitsu-plan] .mat.temae{fill:#e7dcc9;}
    svg[data-chashitsu-plan] .ro{fill:#e34234;stroke:none;
      transition:x .55s cubic-bezier(.5,0,.2,1),y .55s cubic-bezier(.5,0,.2,1);}
    svg[data-chashitsu-plan] .toko{fill:#e3d9c9;stroke:#3d3530;stroke-width:1.4;
      vector-effect:non-scaling-stroke;transition:x .55s cubic-bezier(.5,0,.2,1);}
    /* non-scaling-stroke is NOT optional on any of these, and this rule is why
       it is worth saying so. The viewBox is three units wide, so a stroke-width
       of 3.4 in user units is a line WIDER THAN THE ROOM: with round caps it
       drew a dark lozenge across the whole plan. Dropped by accident when this
       CSS was transcribed out of chashitsu.html, and invisible there, because
       that page's own #plan rules keep the property and win over these. Only a
       page relying on the default here could show it. */
    svg[data-chashitsu-plan] .door{stroke:#3d3530;stroke-width:3.4;stroke-linecap:round;
      vector-effect:non-scaling-stroke;
      transition:x1 .55s cubic-bezier(.5,0,.2,1),x2 .55s cubic-bezier(.5,0,.2,1);}
    svg[data-chashitsu-plan] .pillar{fill:#3d3530;transition:opacity .4s ease;}
    svg[data-chashitsu-plan] .who{transition:cx .55s cubic-bezier(.5,0,.2,1),
      cy .55s cubic-bezier(.5,0,.2,1);}
    svg[data-chashitsu-plan] .host{fill:#3d3530;}
    svg[data-chashitsu-plan] .guest{fill:none;stroke:#3d3530;stroke-width:1.3;
      vector-effect:non-scaling-stroke;}

    /* The same plan in reverse video, for a page that wants a DARK panel like
       the cards in the roji. Only the values change: the vermillion hearth is
       left alone, because it is the one accent and it carries on either
       ground. Asked for by mounting with { dark: true }. */
    svg[data-chashitsu-plan][data-dark] .wall{stroke:rgba(255,255,255,.88);}
    svg[data-chashitsu-plan][data-dark] .mat{fill:rgba(255,255,255,.07);
      stroke:rgba(255,255,255,.26);}
    svg[data-chashitsu-plan][data-dark] .mat.temae{fill:rgba(255,255,255,.15);}
    svg[data-chashitsu-plan][data-dark] .toko{fill:rgba(255,255,255,.17);
      stroke:rgba(255,255,255,.80);}
    svg[data-chashitsu-plan][data-dark] .door{stroke:rgba(255,255,255,.92);}
    svg[data-chashitsu-plan][data-dark] .pillar{fill:rgba(255,255,255,.88);}
    svg[data-chashitsu-plan][data-dark] .host{fill:rgba(255,255,255,.92);}
    svg[data-chashitsu-plan][data-dark] .guest{stroke:rgba(255,255,255,.72);}
  `;
  let cssDone = false;
  function injectCSS() {
    if (cssDone) return;
    cssDone = true;
    const st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function mount(svg, opt) {
    const U = global.ROOM.U, RO = global.ROOM.RO;
    const MATS = global.ROOM.MATS, TYPES = global.ROOM.TYPES;
    const caps = (opt && opt.caps) || {};
    injectCSS();
    svg.setAttribute("data-chashitsu-plan", "");
    if (opt && opt.dark) svg.setAttribute("data-dark", "");
    if (!svg.getAttribute("viewBox")) svg.setAttribute("viewBox", VIEWBOX);

    const make = (t, a) => {
      const e = document.createElementNS(NS, t);
      for (const k in a) e.setAttribute(k, a[k]);
      svg.appendChild(e);
      return e;
    };

    const parts = { mats: {} };
    // the alcove, along the top wall, outside the mats
    parts.toko = make("rect", { class: "toko", x: 0, y: -0.62, width: 2, height: 0.62 });
    for (const k in MATS) {
      const m = MATS[k];
      parts.mats[k] = make("rect", { class: "mat", x: m.x, y: m.y, width: m.w, height: m.h });
    }
    parts.ro = make("rect", { class: "ro", x: 0, y: 0, width: RO, height: RO });
    parts.pillar = make("circle", { class: "pillar", cx: 0, cy: 0, r: 0.085, opacity: 0 });
    parts.wall = make("rect", { class: "wall", x: 0, y: 0, width: U, height: U });
    // the crawl-in door, a gap in the bottom wall
    parts.door = make("line", { class: "door", x1: 1.85, y1: U, x2: 2.75, y2: U });
    parts.host = make("circle", { class: "who host", cx: 0, cy: 0, r: 0.14 });
    parts.guests = [0, 1].map(() => make("circle", { class: "who guest", cx: 0, cy: 0, r: 0.13 }));

    // Reverse is a true mirror of the room, so it is one transform on the whole
    // drawing rather than eight more sets of coordinates. That is also what it
    // IS: Sadler's reverse style is the normal one seen in a looking glass.
    function draw(ti, reversed) {
      const t = TYPES[ti];
      const mirror = (x) => (reversed ? U - x : x);
      for (const k in MATS) {
        const m = MATS[k], r = parts.mats[k];
        let x = m.x, w = m.w, h = m.h;
        if (k === t.temae && t.shorten) h *= t.shorten;   // cut at the foot, not
                                                          // the head: the hearth
                                                          // is at the head
        r.setAttribute("x", reversed ? U - x - w : x);
        r.setAttribute("y", m.y);
        r.setAttribute("width", w);
        r.setAttribute("height", h);
        r.classList.toggle("temae", k === t.temae);
      }
      // THE ALCOVE DOES NOT MIRROR, and this is a correction, not the original
      // intent. It used to, on the argument that the alcove is part of the room
      // and turns with it. But the 3D room never mirrored it -- `tokonoma()` in
      // chashitsu-layout.js does not read `rev` at all -- so the flat plan and
      // the room showed the tokonoma on opposite sides in the four reversed
      // arrangements, while room3d's own comment claimed the two could not
      // disagree.
      //
      // Of the two ways to end that, this is the one that creates no new fault:
      // mirroring the 3D alcove would swing the bay's solid block against
      // room3d's paper wall and open its bokuseki-mado into it, which is the
      // exact mistake the roji already paid for. Whether the tradition turns
      // the tokonoma with the rest is a question for Nicolas's practice and is
      // parked on purpose; the classification the table quotes speaks only of
      // where the hearth is cut.
      parts.toko.setAttribute("x", 0);
      if (caps.toko) caps.toko.style.left = ((0 + 1) / U * 100) + "%";
      const rx = reversed ? U - t.ro[0] - RO : t.ro[0];
      parts.ro.setAttribute("x", rx);
      parts.ro.setAttribute("y", t.ro[1]);
      parts.pillar.setAttribute("opacity", t.pillar ? 1 : 0);
      parts.pillar.setAttribute("cx", rx + (reversed ? -0.16 : RO + 0.16));
      parts.pillar.setAttribute("cy", t.ro[1] - 0.10);
      parts.host.setAttribute("cx", mirror(t.host[0]));
      parts.host.setAttribute("cy", t.host[1]);
      t.guests.forEach((g, i) => {
        parts.guests[i].setAttribute("cx", mirror(g[0]));
        parts.guests[i].setAttribute("cy", g[1]);
      });
      parts.door.setAttribute("x1", mirror(1.85));
      parts.door.setAttribute("x2", mirror(2.75));
      if (caps.door) caps.door.style.left = ((reversed ? U - 2.30 : 2.30) / U * 100) + "%";
    }

    return { draw: draw, parts: parts };
  }

  global.CHASHITSU_PLAN = { mount: mount, VIEWBOX: VIEWBOX };
})(this);
