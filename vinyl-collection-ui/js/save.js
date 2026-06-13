// save.js — persist record changes back to disk via the local `vinyl serve`
// endpoint. If the endpoint isn't available (i.e. we're being viewed on the
// deployed read-only site), saveRecords() throws and the caller should fall
// back to a download-JSON UI.

export async function saveRecords(records) {
  const res = await fetch("/api/save", {
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

// Detect whether we're running under `vinyl serve` (which exposes /api/save).
// Used by the editor to decide whether to render Save buttons vs a download
// link with a message about needing to run `vinyl serve`.
export async function saveAvailable() {
  try {
    // POSTing with an empty array would actually wipe the file; instead we
    // probe with a GET, which the endpoint rejects (405) — but the distinction
    // we care about is "endpoint exists at all" (any response except network
    // failure) vs "doesn't exist" (network failure or 404 from a static host).
    const res = await fetch("/api/save", { method: "GET" });
    return res.status === 405 || res.status === 404 || res.status === 200;
  } catch {
    return false;
  }
}

// Trigger a browser download of the records as JSON. Fallback when /api/save
// isn't available.
export function downloadAsJson(records, filename = "vinyl.json") {
  const blob = new Blob([JSON.stringify(records, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
