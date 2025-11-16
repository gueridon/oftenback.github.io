// sync.js
// Simple GitHub file helpers using REST API. Exports:
// - githubGetFile(owner, repo, path, token) -> { content: array, sha: string } or null
// - githubCreateOrUpdateFile(owner, repo, path, token, contentString, message) -> API response
//
// Important: token must have repo content read/write rights for the data repo.
//
// Note: Uses fetch and handles 404 (no file found). Caller must provide token (kept locally only).

export async function githubGetFile(owner, repo, path, token) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`
    }
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${await res.text()}`);

  const json = await res.json();
  // content is base64 encoded
  const raw = atob(json.content.replace(/\n/g,''));
  const decoded = decodeURIComponent(escape(raw));
  let parsed;
  try { 
    parsed = JSON.parse(decoded); 
  } catch (e) { 
    parsed = []; 
  }
  return { content: parsed, sha: json.sha, raw: decoded };
}

export async function githubCreateOrUpdateFile(owner, repo, path, token, contentString, message) {
  // contentString is the JSON string to be stored
  const getUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  const getRes = await fetch(getUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`
    }
  });

  let sha;
  if (getRes.status === 200) {
    const getJson = await getRes.json();
    sha = getJson.sha;
  } else if (getRes.status !== 404) {
    // some other error
    const t = await getRes.text();
    throw new Error(`Error checking remote file: ${getRes.status} ${t}`);
  }

  const base64 = btoa(unescape(encodeURIComponent(contentString)));
  const body = {
    message: message || 'Update vinyl.json',
    content: base64
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(getUrl, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!putRes.ok) {
    const txt = await putRes.text();
    throw new Error(`GitHub PUT failed: ${putRes.status} ${txt}`);
  }

  const putJson = await putRes.json();
  return putJson;
}
