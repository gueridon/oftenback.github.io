// shell.js — common page shell: top nav + footer with collection counts.

const PAGES = [
  { href: "./index.html", label: "edit" },
  { href: "./view.html", label: "browse" },
  { href: "./stats.html", label: "stats" },
  { href: "./print-barcodes.html", label: "barcodes" },
  { href: "./print-dividers.html", label: "dividers" },
];

export function renderShell(activeHref) {
  const here = activeHref || location.pathname.split("/").pop() || "index.html";
  const links = PAGES.map(({ href, label }) => {
    const isActive = here.endsWith(href.replace("./", ""));
    return `<a href="${href}"${isActive ? ' class="active"' : ""}>${label}</a>`;
  }).join("");

  const topbar = `
    <header class="topbar">
      <h1>vinyl</h1>
      <nav>${links}</nav>
    </header>
  `;
  document.body.insertAdjacentHTML("afterbegin", topbar);
}

export function renderFooter(records) {
  const total = records.length;
  const withCovers = records.filter(r => r.coverImage).length;
  const footer = `
    <footer class="footer">
      ${total} records, ${withCovers} with cover art
    </footer>
  `;
  document.body.insertAdjacentHTML("beforeend", footer);
}
