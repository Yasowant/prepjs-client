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

async function refresh() {
  const { refreshToken } = getTokens();
  if (!refreshToken) throw new Error("No refresh token");
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("Refresh failed");
  const tokens = await res.json();
  setTokens(tokens);
  return tokens.accessToken;
}

export async function api(path, { method = "GET", body, auth = false, _retried = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const { accessToken } = getTokens();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !_retried) {
    try {
      await refresh();
      return api(path, { method, body, auth, _retried: true });
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
