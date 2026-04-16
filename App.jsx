import { useState, useEffect } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

// ─── SUPABASE CONFIG (projet "défaut") ───────────────────────────────────────
// ✅ Déjà configuré — remplace uniquement SUPABASE_URL par ton URL depuis Data API
export const SUPABASE_URL = "https://cssbnvwgutkphmajzzst.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_pUS5UL-8mxHtFskXHMI5ow_sZhl26fc";

// ─── CLIENT SUPABASE LÉGER ────────────────────────────────────────────────────
export const supabase = {
  async authFetch(path, body) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async dbFetch(table, method = "GET", body = null, filters = "", token = null) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filters}`, {
      method,
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token || SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": method === "POST" ? "return=representation" : "return=minimal",
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (method === "GET") return res.json();
    return res.status < 300 ? null : res.json();
  },

  async signUp(email, password) {
    return this.authFetch("/signup", { email, password });
  },

  async signIn(email, password) {
    return this.authFetch("/token?grant_type=password", { email, password });
  },
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mg_session");
      if (saved) {
        const session = JSON.parse(saved);
        // Vérifie que le token n'est pas expiré
        if (session.expires_at && Date.now() < session.expires_at * 1000) {
          setUser(session);
        } else {
          localStorage.removeItem("mg_session");
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  function handleLogin(userData) {
    localStorage.setItem("mg_session", JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("mg_session");
    setUser(null);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #1A2035", borderTop: "3px solid #6C63FF", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 13, color: "#3D4A63", fontFamily: "system-ui" }}>Chargement...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Auth onSuccess={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
