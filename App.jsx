import { useState, useEffect } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Remplace ces valeurs par les tiennes depuis supabase.com → Settings → API
export const SUPABASE_URL = "https://TON-PROJECT-ID.supabase.co";
export const SUPABASE_ANON_KEY = "ta-anon-key-ici";

// Simple Supabase client sans dépendance externe
export const supabase = {
  async query(table, method = "GET", body = null, filters = "") {
    const url = `${SUPABASE_URL}/rest/v1/${table}${filters}`;
    const res = await fetch(url, {
      method,
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": method === "POST" ? "return=representation" : "return=minimal",
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) throw new Error(await res.text());
    if (method === "GET") return res.json();
    return res.status === 204 ? null : res.json();
  },
  async signUp(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const saved = localStorage.getItem("mg_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setLoading(false);
  }, []);

  function handleLogin(userData) {
    localStorage.setItem("mg_user", JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("mg_user");
    setUser(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E2235", borderTop: "3px solid #6C63FF", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Auth onSuccess={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
