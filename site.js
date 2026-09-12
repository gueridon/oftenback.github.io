// Shared across every page: inject the side menu (mark + room list, which
// never fades, ever), and fade in the page's own content on load.
document.addEventListener("DOMContentLoaded", () => {
  // The site's furniture belongs to the TOP document. The chashitsu chapter
  // frames the room in three dimensions, and that page loads this file too:
  // unguarded, it injected a second menu inside the frame and drew its cream
  // veil over the room. A framed page is a component, not a visit.
  if (window !== window.top) return;
  const here = location.pathname.split("/").pop() || "";
  // The cherry window IS the home page now: room one is where you arrive, and
  // the blob is its overture rather than a page of its own. The old cream
  // landing is kept, unlinked, as landing-blob.html.
  const isHome = here === "" || here === "index.html";


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
  // The blob on its pale field is a CURTAIN-RAISER, and a curtain rises once.
  // On the first arrival of a visit the veil is held opaque while the blob has
  // its moment; on every return home afterwards there is no blob and no hold --
  // you land straight in the cherry window, which is the whole point of its
  // being home. sessionStorage rather than localStorage: coming back to the
  // site another day should still open with the overture.
  const OVERTURE_KEY = "nk-overture-seen";
  const firstArrival = isHome && !sessionStorage.getItem(OVERTURE_KEY);
  if (firstArrival) {
    sessionStorage.setItem(OVERTURE_KEY, "1");
    veil.dataset.hold = "true";
  }
  // There were once two crossings that carried the mark itself across a page
  // boundary and so had to skip the veil. Both are gone: the blob is never
  // large on a pale field except in the overture, which is a curtain and not a
  // crossing. Every page now simply fades in, or holds its own veil.
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
    { href: "nakata.html", label: "nakata" },
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
    { href: "chanoyu.html", label: "chanoyu", chapters: [
      { href: "tearoom-roji.html", label: "roji" },
      { href: "chashitsu.html", label: "chashitsu" },
      { href: "dogu.html", label: "dogu" },
    ] },
  ];
  const lit = (s) => s.href === here ||
    (s.chapters || []).some((c) => c.href === here);
  // Only the house you are IN opens. A menu listing every chapter of every
  // house would be a table of contents; this one is a place-marker, and it
  // should stay as quiet as the rest of the page.
  const subsHtml = (s) => (!lit(s) || !s.chapters) ? "" :
    '<div class="subs">' + s.chapters.map((c) =>
      '<span class="link sub"></span>' +
      `<a class="stop sub${c.href === here ? " here" : ""}" href="${c.href}">${c.label}</a>`
    ).join("") + "</div>";
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
  const sideHtml = brandHtml +
    '<div class="stops-wrap"><span class="link"></span>' + stopsHtml + '</div>';

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
        if (href === here) return;
        leaveTo(href);
      });
    });
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

  // ---- the overture -------------------------------------------------------
  // You arrive, the blob has the stage for a moment, then the curtain lifts
  // and the cherry window is behind it. No page change, and no journey: the
  // blob goes where it stands and the mark is simply waiting in the corner.
  //
  // Once per visit only. The veil is the curtain, held opaque above.
  if (firstArrival) {
    const OV_HOLD = 2300;                 // how long the blob keeps the stage
    const OV_FADE = 620;                  // it goes; it does not travel
    const aside = document.querySelector(".side");

    const ovStyle = document.createElement("style");
    ovStyle.textContent =
      "#overture{position:fixed;inset:0;z-index:61;display:flex;" +
      "align-items:center;justify-content:center;pointer-events:none;}" +
      "#overture .center{pointer-events:auto;}";
    document.head.appendChild(ovStyle);

    const ov = document.createElement("div");
    ov.id = "overture";
    ov.innerHTML = '<a class="center" href="#" aria-label="oftenback">' +
      '<canvas width="156" height="156" aria-hidden="true"></canvas>' +
      '<span class="title">OFTENBACK</span></a>';
    document.body.appendChild(ov);
    const big = ov.querySelector(".center");
    if (typeof startNakataBlob === "function") startNakataBlob(ov.querySelector("canvas"));

    // the room list waits, and arrives with the mark rather than before it
    if (aside) { aside.style.transition = "opacity .8s ease"; aside.style.opacity = "0"; }

    let timer = null, played = false;
    function raise() {
      if (played) return;
      played = true;
      clearTimeout(timer);
      veil.classList.add("gone");

      // No journey. The blob used to fly from the centre to its dock -- the
      // same crossing it made between pages -- and Nicolas read the start of
      // that flight as the mark being redrawn in a corner and dragged across
      // the screen. It should simply GO, and simply BE THERE: one thing
      // leaves the middle, the same thing is waiting in the corner.
      //
      // Which also means all the dock measurement this used to need is gone:
      // nothing has to land anywhere, so nothing can land wrong.
      big.style.transition = "opacity " + OV_FADE + "ms ease";
      big.style.opacity = "0";
      // it reappears rather than arriving: a beat of nothing in between
      setTimeout(() => { if (aside) aside.style.opacity = "1"; }, OV_FADE * 0.75);
      setTimeout(() => { ov.remove(); window.__overtureDone = true; }, OV_FADE + 120);
    }
    timer = setTimeout(raise, OV_HOLD);
    // and it can be skipped: impatience is allowed
    big.addEventListener("click", (e) => { e.preventDefault(); raise(); });
  }
});
