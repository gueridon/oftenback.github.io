// shell.js — the shared Nakata masthead + nav, injected into #shell on each page.

const PAGES = [
  { href: "index.html", label: "browse" },
  { href: "edit.html", label: "edit" },
  { href: "add.html", label: "add" },
  { href: "covers.html", label: "covers" },
  { href: "stats.html", label: "stats" },
  { href: "print-barcodes.html", label: "barcodes" },
  { href: "print-dividers.html", label: "dividers" },
];

export function renderShell(active) {
  const here = active || location.pathname.split("/").pop() || "browse.html";
  const nav = PAGES.map(p =>
    `<a href="./${p.href}"${here.endsWith(p.href) ? ' class="active"' : ""}>${p.label}</a>`
  ).join("");
  const html = `
    <header class="masthead">
      <svg class="enso" width="50" height="50" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="37" fill="none" stroke="var(--accent)" stroke-width="7.5"
          stroke-linecap="round" stroke-dasharray="205 40" transform="rotate(-28 50 50)"/>
      </svg>
      <div class="words">
        <h1>The Collection</h1>
        <div class="tag" id="tag">records</div>
      </div>
      <nav>${nav}</nav>
    </header>
    <div class="rule"></div>`;
  const host = document.getElementById("shell");
  if (host) host.innerHTML = html;
}

export function setTag(text) {
  const t = document.getElementById("tag");
  if (t) t.textContent = text;
}
