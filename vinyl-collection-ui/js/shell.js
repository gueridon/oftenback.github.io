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
  if (host) host.innerHTML = html;
}

export function setTag(text) {
  const t = document.getElementById("tag");
  if (t) t.textContent = text;
}
