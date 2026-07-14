import { createContext, useContext, useEffect, useState } from "react";
import { api, setTokens, clearTokens } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return setLoading(false);
    api("/auth/me", { auth: true })
      .then((d) => setUser(d.user))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    setTokens(data);
    setUser(data.user);
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  function updateUser(patch) {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
