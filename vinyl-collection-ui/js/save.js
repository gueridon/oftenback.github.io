// save.js - persist changes via the local `vinyl serve` endpoint, or fall back
// to a JSON download when viewed on the read-only static host.

export async function saveRecords(records) {
  const res = await fetch("/vinyl/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(records, null, 2),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`save failed (${res.status}): ${text || "no detail"}`);
  }
  return await res.json();
}

export async function saveAvailable() {
  try {
    const res = await fetch("/vinyl/api/save", { method: "GET" });
    return res.status === 405 || res.status === 404 || res.status === 200;
  } catch {
    return false;
  }
}

export function downloadAsJson(records, filename = "vinyl.json") {
  const blob = new Blob([JSON.stringify(records, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}
