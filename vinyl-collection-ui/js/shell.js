// shell.js — the shared Nakata masthead + nav, injected into #shell on each page.

const PAGES = [
  { href: "index.html", label: "browse" },
  { href: "edit.html", label: "edit" },
  { href: "add.html", label: "add" },
  { href: "covers.html", label: "covers" },
  { href: "stats.html", label: "stats" },
  { href: "print-barcodes.html", label: "barcodes" },
];

export function renderShell(active) {
  const here = active || location.pathname.split("/").pop() || "browse.html";
  const nav = PAGES.map(p =>
    `<a href="./${p.href}"${here.endsWith(p.href) ? ' class="active"' : ""}>${p.label}</a>`
  ).join("");
  const html = `
    <header class="masthead"><nav>${nav}</nav>
    </header>
    <div class="rule"></div>`;
  const host = document.getElementById("shell");
  if (host) {
    host.innerHTML = html;
    showPublishState(host);
  }
}

// The Tab5 shelf browser and the QR scanner both read the PUBLIC copy at
// oftenback.io, not this one. Drift there is therefore invisible from here, which
// is how eight records sat unseen between 2026-08-02 and 2026-08-21. The command
// to fix it always existed; the signal did not.
//
// THREE states, always one of them shown. An indicator that renders nothing when
// healthy cannot be distinguished from one that is broken, and that is the same
// mistake in a new place (traps.md #15: make the omission speak).
//
//   in sync   muted    "published"
//   behind    accent   "not published: 3 records, 2 new covers"
//   unknown   muted    "publish state unknown"
//
// On GitHub Pages there is no backend, so it settles on "unknown", which is
// honest: from there we genuinely cannot see the publish state.
async function showPublishState(host) {
  const nav = host.querySelector("nav");
  if (!nav) return;

  const tag = document.createElement("span");
  tag.className = "pubstate";
  nav.appendChild(tag);

  const set = (cls, text, title) => {
    tag.className = "pubstate " + cls;
    tag.textContent = text;
    tag.title = title;
  };

  set("unknown", "checking...", "Asking the backend how far the public copy is behind");

  try {
    const res = await fetch("/vinyl/api/publish-status", { cache: "no-store" });
    if (!res.ok) {
      return set("unknown", "publish state unknown",
                 "The backend did not answer (HTTP " + res.status + "). " +
                 "This page cannot tell whether the public site is up to date.");
    }
    const s = await res.json();
    if (!s.available) {
      return set("unknown", "publish state unknown",
                 "Backend reachable but cannot compare: " + (s.reason || "unknown reason"));
    }
    if (!s.stale) {
      return set("ok", "published",
                 "The public site at oftenback.io matches this one. " +
                 "The Tab5 and the QR scanner are seeing the current collection.");
    }
    const bits = [];
    if (s.records) bits.push("records");
    if (s.newCovers) bits.push(s.newCovers + " new covers");
    if (s.updatedCovers) bits.push(s.updatedCovers + " updated covers");
    if (s.webFiles) bits.push(s.webFiles + " web files");
    if (s.unpushed > 0) bits.push(s.unpushed + " unpushed commits");
    set("behind", "not published: " + (bits.join(", ") || "changes pending"),
        "The public site is behind this one, so the Tab5 and the QR scanner are " +
        "showing stale data. Run: vinyl publish");
  } catch (e) {
    set("unknown", "publish state unknown",
        "Could not reach the backend: " + e.message);
  }
}

export function setTag(text) {
  const t = document.getElementById("tag");
  if (t) t.textContent = text;
}
