/* Auth context: holds the current user, exposes signup / login / logout.
   The JWT is kept in localStorage by src/lib/api.js; the profile is
   fetched from GET /api/auth/me on mount when a token exists. */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken, getToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    let alive = true;
    if (!getToken()) return undefined;
    api("/auth/me")
      .then(({ user: u }) => alive && setUser(u))
      .catch(() => {
        setToken(null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async signup(name, email, password) {
        const { user: u, token } = await api("/auth/register", {
          method: "POST",
          body: { name, email, password },
        });
        setToken(token);
        setUser(u);
        return u;
      },
      async login(email, password) {
        const { user: u, token } = await api("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        setToken(token);
        setUser(u);
        return u;
      },
      async refresh() {
        const { user: u } = await api("/auth/me");
        setUser(u);
        return u;
      },
      logout() {
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* eslint-disable react-refresh/only-export-components -- hook must live with its provider */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
