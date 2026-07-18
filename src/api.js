// In dev, Vite proxies /api → localhost:4000.
// In production (Vercel), set VITE_API_URL to your backend URL, e.g. https://prepjs-api.onrender.com
const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

function getTokens() {
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// Retries network-level failures (server cold start on Render, flaky mobile
// connections). HTTP errors (4xx/5xx) are NOT retried — only unreachable server.
async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (err.name === "AbortError") throw err; // user cancelled — don't retry
      if (attempt >= retries) {
        throw new Error(
          "Can't reach the server — it may just be waking up. Please try again in a few seconds."
        );
      }
      // backoff: 1.5s, 3s, 4.5s — enough for a cold server to boot
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1500));
    }
  }
}

// Fire-and-forget ping to wake a sleeping server as soon as the app opens.
export function warmUpServer() {
  fetch(`${BASE}/health`).catch(() => {});
}

async function refresh() {
  const { refreshToken } = getTokens();
  if (!refreshToken) throw new Error("No refresh token");
  const res = await fetchWithRetry(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("Refresh failed");
  const tokens = await res.json();
  setTokens(tokens);
  return tokens.accessToken;
}

export async function api(path, { method = "GET", body, auth = false, signal, _retried = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const { accessToken } = getTokens();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }
  const res = await fetchWithRetry(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 401 && auth && !_retried) {
    try {
      await refresh();
      return api(path, { method, body, auth, signal, _retried: true });
    } catch {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.code = data.code;
    err.data = data;
    throw err;
  }
  return data;
}
