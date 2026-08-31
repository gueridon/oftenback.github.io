// shell.js - the shared Nakata masthead + nav, injected into #shell on each page.

// The wall is the front page as of 2026-08-30: index.html IS the wall, and browse
// moved to browse.html. It had to be a real file rename and not an nginx `index`
// directive, because GitHub Pages serves index.html for a directory and gives no way
// to change that. A config change would have worked on the LAN and silently failed in
// public, which is the worst of the available outcomes.
const PAGES = [
  { href: "index.html", label: "the wall" },
  { href: "browse.html", label: "browse" },
  { href: "edit.html", label: "edit" },
  { href: "add.html", label: "add" },
  { href: "covers.html", label: "covers" },
  { href: "stats.html", label: "stats" },
  { href: "print-barcodes.html", label: "barcodes" },
];

export function renderShell(active) {
  // Visiting /vinyl/ leaves nothing to pop, so the fallback must name the page the
  // server actually serves for a bare directory. Otherwise the front page highlights
  // some other nav entry than the one you are looking at.
  const here = active || location.pathname.split("/").pop() || "index.html";
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
// Shown only on the EDITING copy. On the public site the notion is meaningless,
// because that page IS the publication, and a visitor to oftenback.io should not
// be reading our internal plumbing. Gated on the HOST rather than on the state:
// hiding when a state is unknown would bring back the ambiguity above, whereas
// hiding where the concept does not apply does not.
function isEditingCopy() {
  const h = location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local") ||
         /^192\.168\./.test(h) || /^10\./.test(h) ||
         /^172\.(1[6-9]|2\d|3[01])\./.test(h);
}

async function showPublishState(host) {
  if (!isEditingCopy()) return;
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
        "showing stale data. Click to publish.");
    arm(tag, host);
  } catch (e) {
    set("unknown", "publish state unknown",
        "Could not reach the backend: " + e.message);
  }
}

// The chip named the drift and then told you to go and run a command. Now it is the
// command. Armed ONLY in the "behind" state: there is nothing to press when the sites
// already match, and pressing it when the state is unknown would be acting on a reading
// we do not have.
//
// The confirm is deliberate. This chip sits among the nav links, and a stray click here
// pushes the collection to a PUBLIC website. One keystroke is a fair price for that.
function arm(tag, host) {
  tag.classList.add("act");
  tag.setAttribute("role", "button");
  tag.tabIndex = 0;

  const go = async () => {
    if (tag.dataset.busy) return;
    if (!confirm("Publish now?\n\nMirrors to the LAN site, commits, and pushes to "
               + "oftenback.io, which is public.")) return;

    tag.dataset.busy = "1";
    tag.className = "pubstate unknown";
    tag.textContent = "publishing...";
    tag.title = "Mirroring to the LAN site, committing all three repos, pushing.";

    // Report per step, because the steps fail differently: a dead network fails the
    // pushes while the LAN mirror still succeeds, and "publish failed" alone would
    // hide the fact that the local site is in fact current.
    const detail = steps => steps.map(st =>
      (st.ok ? "ok   " : "FAIL ") + st.name
      + (st.output ? "\n       " + st.output.replace(/\n/g, "\n       ") : "")).join("\n\n");

    try {
      const res = await fetch("/vinyl/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const r = await res.json().catch(() => ({}));
      const steps = r.steps || [];
      if (r.ok) {
        tag.className = "pubstate ok";
        tag.textContent = "published";
        tag.title = detail(steps) + "\n\nGitHub Pages rebuilds in about a minute.";
        // Ask the instrument again rather than trust what we just did.
        setTimeout(() => { tag.remove(); showPublishState(host); }, 2000);
      } else {
        const bad = steps.filter(st => !st.ok);
        tag.className = "pubstate behind act";
        tag.textContent = "publish failed" + (bad.length ? ": " + bad[0].name : "");
        tag.title = (r.error ? r.error + "\n\n" : "") + (detail(steps) || "no detail")
                  + "\n\nClick to try again.";
      }
    } catch (e) {
      tag.className = "pubstate behind act";
      tag.textContent = "publish failed";
      tag.title = "Could not reach the backend: " + e.message + "\n\nClick to try again.";
    } finally {
      delete tag.dataset.busy;
    }
  };

  tag.onclick = go;
  tag.onkeydown = ev => {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); }
  };
}

export function setTag(text) {
  const t = document.getElementById("tag");
  if (t) t.textContent = text;
}
