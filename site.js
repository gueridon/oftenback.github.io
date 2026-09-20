// Shared across every page: inject the side menu (mark + room list, which
// never fades, ever), and fade in the page's own content on load.
document.addEventListener("DOMContentLoaded", () => {
  // The site's furniture belongs to the TOP document. The chashitsu chapter
  // frames the room in three dimensions, and that page loads this file too:
  // unguarded, it injected a second menu inside the frame and drew its cream
  // veil over the room. A framed page is a component, not a visit.
  if (window !== window.top) return;
  const here = location.pathname.split("/").pop() || "";
  // ---- the menu takes its tone from what is behind it ---------------------
  // A page with a scene to measure calls this with the mean brightness of
  // the patch the menu stands on, 0 for black and 1 for white. Pages made
  // of cream never call it and keep the defaults.
  //
  // TWO TONES AND A NARROW CROSSOVER, not a blend across the whole range: a
  // colour interpolated through the middle is a mid grey exactly when the
  // background is a mid grey, which is the one case that needed help. So
  // the menu is ink or it is cream, and the few hundredths between are
  // crossed quickly.
  const TONE_DARK = [61, 53, 48], TONE_LIGHT = [232, 225, 214];
  let toneNow = -1;
  window.setMenuTone = function (lum) {
    const el = document.querySelector(".side");
    if (!el || !isFinite(lum)) return;
    const t = Math.max(0, Math.min(1, (lum - 0.44) / 0.14));   // 1 = light bg
    if (toneNow >= 0 && Math.abs(t - toneNow) < 0.02) return;
    toneNow = t;
    const c = TONE_DARK.map((d, i) => Math.round(TONE_LIGHT[i] +
      (d - TONE_LIGHT[i]) * t));
    el.style.setProperty("--soft", `rgb(${c[0]},${c[1]},${c[2]})`);
    // AND THE LIFT GOES THE OTHER WAY, and tightens. A mean is only a
    // mean: the menu is tall and the thing behind it is often dark at the
    // head and bright at the foot, so pale letters end up crossing a lit
    // path whatever tone was chosen. A wide soft shadow does nothing
    // there; a close dark one is an outline and holds them.
    const near = t > 0.5;
    el.style.setProperty("--side-shadow",
      near ? "rgba(61,53,48,0.14)"
           : `rgba(12,9,7,${(0.22 + 0.34 * (1 - t)).toFixed(2)})`);
    el.style.setProperty("--side-blur", near ? "8px" : "3px");
    // AND THE NARROW BAR'S BACKDROP with them. It is invisible on a wide
    // screen, but the same reading answers it: a strip of cream over a
    // sunlit wall, a strip of ink over a dark corner. Without this the bar
    // was a pale band across the top of the tea garden at every hour.
    el.style.setProperty("--bar-bg",
      near ? "rgba(244,237,226,0.93)" : "rgba(18,14,10,0.62)");
  };
  const hereQ = new URLSearchParams(location.search);
  // HOME IS CREAM, and the mark stands in the middle of it. It was the
  // cherry window for a while and that page is kept whole and unlinked at
  // index-sakura.html, as landing-blob.html is.
  const isHome = here === "" || here === "index.html";
  // HOME CARRIES ITS OWN MARK, in the middle of the page, so the small one
  // above the room list would be a second copy of it and a way home from
  // where you are standing. The stylesheet takes it from there.
  if (isHome) document.body.classList.add("at-home");


  // ---- the veil: every crossing fades, none of them flips ------------------
  // One overlay per page, opaque on arrival and faded away, opaque again on
  // leaving. A page may supply its own #veil with data-hold="true" (the tea
  // garden does, as its loading screen) and dismiss it when it is ready.
  // The veil's rules used to be injected here, which was a THIRD copy of them
  // and, worse, arrived only at DOMContentLoaded -- after the first paint. They
  // live in site.css now: one copy, and already applied when the page first
  // draws. Pages that need covering from the very first frame also ship the
  // element itself in their markup.
  let veil = document.getElementById("veil");
  if (!veil) {
    veil = document.createElement("div");
    veil.id = "veil";
    document.body.appendChild(veil);
  }
  // THE OVERTURE IS RETIRED. It held the veil down, gave the blob the middle
  // of the screen for two and a half seconds, then faded it and let the
  // cherry sky through -- once per visit, tracked in sessionStorage.
  //
  // Home is cream now and the blob does not leave the middle of it, so there
  // is nothing to hand over to and nothing to play once: the thing the
  // overture staged has become the page. What is left of it is a second's
  // wait before the greeting joins the mark, which index.html does itself in
  // four lines. A page that simply IS what it wanted to show needs no
  // curtain, no session key, and no held veil.
  // There were once two crossings that carried the mark itself across a page
  // boundary and so had to skip the veil, and both are gone. The blob IS
  // large on a pale field now, but it is standing still on the page it
  // belongs to rather than travelling between two, which is the thing that
  // had to be choreographed. Every page simply fades in, or holds its own
  // veil.
  if (veil.dataset.hold !== "true") {
    requestAnimationFrame(() => veil.classList.add("gone"));
  }
  window.__veil = veil;

  function leaveTo(href) {
    // looked up live, not closed over: the tea garden's loading screen owns
    // its own #veil and may have swapped or dropped it by now.
    let v = document.getElementById("veil");
    if (!v) {
      v = document.createElement("div");
      v.id = "veil";
      document.body.appendChild(v);
      v.classList.add("gone");
    }
    v.style.transition = "opacity .75s ease";
    requestAnimationFrame(() => v.classList.remove("gone"));
    setTimeout(() => { location.href = href; }, 780);
  }

  const stops = [
    // room one is gone from the list because room one is the home page, and
    // the mark above already IS that link.
    //
    // AND SO IS NAKATA, for now. The room said in as many words that it was
    // still being thought about, which is honest in a room and a broken
    // promise in a menu: a stop that leads to "nothing here yet" costs a
    // visit to find out. It comes back when there is something in it.
    // The walked garden, not the frozen static room: tearoom.html is kept
    // beside it as the original, unlinked. Romanised chanoyu, as on its own
    // opening card.
    // chanoyu is a chapter house now rather than a single room: the stop leads
    // to its index, and stays lit while you are inside any chapter of it.
    // New chapters get added to `chapters` and nothing else has to change.
    // The chapters carry their own labels now, because the menu SHOWS them:
    // standing anywhere in the chanoyu house, its rooms open underneath the
    // stop as a sub-list.
    // Ordered as the house is: what you WALK first, then what you consult.
    // room3d is no longer among them -- it is framed inside the chashitsu
    // chapter now, a window rather than a destination.
    // TWO WINGS, as the house's own index has them: what you WALK, and what
    // you consult. The menu mirrors that page rather than inventing a
    // second arrangement of the same rooms.
    //
    // 茶室 APPEARS IN BOTH, and that is not a slip -- it is one room,
    // walked or consulted, and chanoyu.html says so in as many words. The
    // wings are what make the repetition legible: unnamed, the same word
    // twice would read as a bug.
    { href: "chanoyu.html", label: "chanoyu", wings: [
      { label: "ceremony", chapters: [
        { href: "tearoom-roji.html", label: "roji" },
        { href: "tearoom-roji.html?room", label: "chashitsu" },
        { href: "tearoom-roji.html?room&pure=0", label: "temae" },
      ] },
      { label: "documentation", chapters: [
        { href: "chashitsu.html", label: "chashitsu" },
        { href: "temaeza.html", label: "temaeza" },
        { href: "dogu.html", label: "dogu" },
      ] },
    ] },
  ];
  const rooms = (s) => (s.wings || []).reduce(
    (a, w) => a.concat(w.chapters || []), s.chapters || []);
  const lit = (s) => s.href === here || rooms(s).some((c) => fileOf(c.href) === here);
  const fileOf = (href) => {
    const q = href.indexOf("?");
    return q < 0 ? href : href.slice(0, q);
  };
  // Only the house you are IN opens. A menu listing every chapter of every
  // house would be a table of contents; this one is a place-marker, and it
  // should stay as quiet as the rest of the page.
  // AND ONE LEVEL FURTHER, for a chapter that is several places: shown only
  // when you are standing in that chapter, for the same reason the chapters
  // themselves are -- a menu listing every door of every house is a table of
  // contents, and this one is a place-marker.
  // WHICH OF THEM YOU ARE STANDING IN. Three of the rooms are the same
  // file and only the query tells them apart, so a room is where you are
  // if every parameter IT names is set the way it names it; of several
  // that fit, the one that names the most. Matched by what it ASKS FOR
  // rather than by the whole string: this page is opened with a beat to
  // jump to, a camera, a test, and a room that only lit on an exact match
  // would go dark the moment anything else was added.
  function span(href) {
    if (fileOf(href) !== here) return -1;
    const q = href.indexOf("?");
    const want = new URLSearchParams(q < 0 ? "" : href.slice(q + 1));
    let n = 0;
    for (const [k, v] of want) {
      if (!hereQ.has(k) || (v !== "" && hereQ.get(k) !== v)) return -1;
      n++;
    }
    return n;
  }
  function litRoom(s) {
    let best = -1, at = null;
    rooms(s).forEach((c) => {
      const n = span(c.href);
      if (n > best) { best = n; at = c.href; }
    });
    return at;
  }
  const roomsHtml = (cs, on) => cs.map((c) =>
    '<span class="link sub"></span>' +
    `<a class="stop sub${c.href === on ? " here" : ""}" href="${c.href}">${c.label}</a>`
  ).join("");
  const subsHtml = (s) => {
    if (!lit(s)) return "";
    const on = litRoom(s);
    // ONE BOX FOR BOTH WINGS, not one each. The list is right-aligned, and
    // a box is only as wide as its own widest word: given a box each, the
    // longer heading pushed its whole wing further left and the two wings
    // stopped sharing a left edge.
    if (s.wings) {
      // THE ROOMS ARE INDENTED FROM THEIR WING, in their own box: a
      // margin on each room would have to fight the padding that makes
      // its hit zone, and the thread between them would stay behind.
      //
      // ONE THREAD PER JOIN, and no more. The short stroke belongs to the
      // first wing only, joining it to the stop above; after that the
      // rooms' own trunk is what carries down to the next heading, and
      // emitting both put two strokes over DOCUMENTATION. And the last
      // wing has nothing under it to reach, so it has no trunk.
      const n = s.wings.length;
      return '<div class="subs">' + s.wings.map((w, i) =>
        (i === 0 ? '<span class="link sub"></span>' : "") +
        `<span class="subhead">${w.label}</span>` +
        `<div class="rooms${i < n - 1 ? " joined" : ""}">` +
        roomsHtml(w.chapters, on) + "</div>"
      ).join("") + "</div>";
    }
    if (!s.chapters) return "";
    return '<div class="subs">' + roomsHtml(s.chapters, on) + "</div>";
  };
  const stopsHtml = stops.map((s, i) =>
    `<a class="stop${lit(s) ? " here" : ""}" href="${s.href}">${s.label}</a>` +
    subsHtml(s) +
    (i < stops.length - 1 ? '<span class="link"></span>' : "")
  ).join("");
  const brandHtml = '<a class="brand-mini" href="index.html" aria-label="oftenback -- home">' +
    '<canvas width="102" height="102" aria-hidden="true"></canvas><span>oftenback</span></a>';
  // A divider leads the list, so OFTENBACK reads as its first item rather than
  // a separate object floating above one -- "rattacher directement Offenback a
  // Nakata". Its own type is untouched: the mark keeps its wider, smaller
  // lettering. The divider sits INSIDE .stops-wrap so it floats with the list,
  // leaving .brand-mini perfectly static, which the dock measurement needs.
  // TWO BOXES AND NOT ONE. The outer one carries the slow float that the
  // whole list has always had; the inner one carries the roll. Put on the
  // same element the roll never happened: an animation's transform beats a
  // transition's, so the list only faded and the scale was thrown away --
  // measured, the transform at rest was the float's own translation.
  // THE HAMBURGER exists in the markup at every width and is shown by the
  // stylesheet only when the menu has become a bar. Built here rather than
  // in the narrow branch of anything, because there is no narrow branch:
  // the layout is the stylesheet's business and this is only the control.
  const burgerHtml = '<button class="burger" type="button" ' +
    'aria-label="rooms" aria-expanded="false"><i></i><i></i><i></i></button>';
  const sideHtml = brandHtml + burgerHtml +
    '<div class="stops-wrap"><div class="roll">' +
    '<span class="link"></span>' + stopsHtml + '</div></div>';

  // the mark lives INSIDE the side nav (its first item) -- mark and room
  // list read as one continuous stack, centred together, mark above menu.
  // Not shown on the landing itself -- there, only the big blob and title show.
  if (!document.querySelector(".side")) {
    const aside = document.createElement("aside");
    aside.className = "side map";
    aside.innerHTML = sideHtml;
    document.body.appendChild(aside);
    aside.querySelectorAll(".stop").forEach((a) => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        const href = a.getAttribute("href");
        // Lit is not the same as here. Inside a chapter the stop is lit AND
        // must still work: it is the way back up to the index. Only the page
        // you are literally standing on is inert.
        //
        // AND A WAY IN IS TOLD BY ITS QUERY. "path" is the same file as the
        // room and the temae, so compared by file alone it would be inert
        // from anywhere on that page -- which is exactly where you would
        // press it from.
        // Lit is not the same as here: a room that shares its file with
        // the one you are standing in must still work, because the query
        // is the whole difference between them.
        const inert = a.classList.contains("sub")
          ? a.classList.contains("here") : href === here;
        if (inert) return;
        leaveTo(href);
      });
    });
    // ---- the list unrolls when something comes near it --------------------
    // The hot zone is the MARK plus, once it is open, the list itself:
    // opening on the mark alone would shut again the moment the pointer
    // set off down the rooms, and opening on a band of the window would
    // have the list appear at a corner the reader was only passing.
    // ---- and where it is a bar, a button opens it ------------------------
    // Two ways in, and only one of them alive at a time: the approach of a
    // pointer where the menu hangs in the margin, a press where it is a bar.
    // The same .open class, so the roll is one mechanism.
    const asBar = matchMedia("(max-width:760px)");
    (function hamburger() {
      const b = aside.querySelector(".burger");
      if (!b) return;
      const set = (on) => {
        aside.classList.toggle("open", on);
        b.setAttribute("aria-expanded", on ? "true" : "false");
      };
      b.addEventListener("click", (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        set(!aside.classList.contains("open"));
      });
      // A PRESS ANYWHERE ELSE SHUTS IT. An open panel over the page with no
      // way back but the button again is a trap on a screen this size.
      addEventListener("pointerdown", (ev) => {
        if (!asBar.matches || !aside.classList.contains("open")) return;
        if (!aside.contains(ev.target)) set(false);
      }, { passive: true });
      // and it never survives the width it belongs to
      asBar.addEventListener("change", () => set(false));
    })();
    (function unroll() {
      const mark = aside.querySelector(".brand-mini");
      const wrap = aside.querySelector(".roll");
      if (!mark || !wrap) return;
      const PAD = 76;                  // how close is near, in pixels
      const near = (e, el, pad) => {
        const r = el.getBoundingClientRect();
        return e.clientX > r.left - pad && e.clientX < r.right + pad &&
               e.clientY > r.top - pad && e.clientY < r.bottom + pad;
      };
      let shut = 0;
      addEventListener("pointermove", (e) => {
        if (asBar.matches) return;      // there, the button owns .open
        const open = aside.classList.contains("open");
        const on = near(e, mark, PAD) || (open && near(e, wrap, PAD));
        if (on) {
          clearTimeout(shut);
          aside.classList.add("open");
        } else if (open) {
          // A BREATH BEFORE IT ROLLS UP, because a pointer crossing the
          // gap between the mark and the first room leaves both for an
          // instant, and a list that flickers there is unusable.
          clearTimeout(shut);
          shut = setTimeout(() => aside.classList.remove("open"), 260);
        }
      }, { passive: true });
    })();
    if (typeof startNakataBlob === "function") {
      // a page whose background is not cream can ask for a denser mark
      startNakataBlob(aside.querySelector(".brand-mini canvas"), undefined,
                      window.MARK_ALPHA);
    }
    // .stops-wrap's float restarts fresh (translateY(0)) on every page load;
    // a negative delay derived from the wall clock starts it already
    // "mid-cycle" instead, so it doesn't visibly jump between page loads.
    const stopsWrap = aside.querySelector(".stops-wrap");
    if (stopsWrap) stopsWrap.style.animationDelay = `-${Date.now() % 9000}ms`;
  }

  // every page just fades its own content in, plainly, regardless of how it
  // was reached -- no cross-page choreography, no shared state
  requestAnimationFrame(() => {
    const main = document.querySelector("main");
    if (main) main.classList.add("in");
  });

  // On the landing, clicking the blob slides and shrinks it smoothly into the
  // exact spot the mark docks at on every other page, then navigates -- the
  // one deliberate exception to "no transitions", since the mark is meant to
  // read as a single continuous object as you move through the site. The
  // target is measured from a hidden, throwaway copy of the real .side
  // markup, so it always matches exactly regardless of viewport size or how
  // many stops there are.
  // Two blob animations used to live here and both are retired.
  //
  // The forward one belonged to the cream landing page, which no longer
  // exists. The reverse one grew the small mark back into a big centred blob
  // before navigating home -- and that has to go too, for the reason Nicolas
  // gave: nakata's own background is cream, so a blob swelling to the middle
  // of it IS "le blob sur fond clair", the thing that is supposed to be seen
  // once and never again. The mark now simply fades out with the page, like
  // every other link.
  const markLink = document.querySelector(".brand-mini");
  if (markLink) {
    markLink.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (isHome) return;          // already home; the mark is not a no-op trap
      leaveTo("index.html");
    });
  }

});
