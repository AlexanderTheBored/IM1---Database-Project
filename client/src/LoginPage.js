import React, { useState } from "react";
import { setAuth } from "./auth";

const S = {
  page: { fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#faf8f4", color: "#2c2820", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { background: "#fff", border: "1px solid #e8e2d8", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 12px 40px rgba(0,0,0,.06)" },
  logo: { fontSize: 28, fontWeight: 700, color: "#8b7355", letterSpacing: 2, textAlign: "center", marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#8a7e6e", textAlign: "center", marginBottom: 28 },
  label: { fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#8a7e6e", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 },
  input: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, width: "100%", padding: "12px 14px", border: "1px solid #ddd5c8", borderRadius: 8, background: "#faf8f4", color: "#2c2820", outline: "none", boxSizing: "border-box" },
  group: { marginBottom: 16 },
  btn: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 8, padding: "13px 28px", cursor: "pointer", width: "100%", background: "#8b7355", color: "#faf8f4", marginTop: 4 },
  switchText: { fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#8a7e6e", textAlign: "center", marginTop: 18 },
  link: { background: "none", border: "none", color: "#8b7355", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: 0 },
  error: { fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#c0392b", background: "#fdf0ee", border: "1px solid #f2d4cf", borderRadius: 8, padding: "10px 14px", marginBottom: 16 },
};

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ username: "", password: "", email: "", firstName: "", lastName: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });

  const finishLogin = (data) => {
    setAuth({ token: data.token, user: data.user });
    window.location.href = data.user.role === "customer" ? "/" : "/admin";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { username: form.username, password: form.password }
        : { username: form.username, password: form.password, email: form.email, first_name: form.firstName, last_name: form.lastName, phone: form.phone || null };
      const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      finishLogin(data);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <form style={S.card} onSubmit={submit}>
        <div style={S.logo}>AIKE</div>
        <div style={S.sub}>{mode === "login" ? "Sign in to your account" : "Create a guest account"}</div>

        {error && <div style={S.error}>{error}</div>}

        {mode === "register" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={S.group}>
                <label style={S.label}>First Name *</label>
                <input style={S.input} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Maria" />
              </div>
              <div style={S.group}>
                <label style={S.label}>Last Name *</label>
                <input style={S.input} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Santos" />
              </div>
            </div>
            <div style={S.group}>
              <label style={S.label}>Email *</label>
              <input style={S.input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="maria@email.com" />
            </div>
            <div style={S.group}>
              <label style={S.label}>Phone</label>
              <input style={S.input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0917-123-4567" />
            </div>
          </>
        )}

        <div style={S.group}>
          <label style={S.label}>{mode === "login" ? "Username or Email *" : "Username *"}</label>
          <input style={S.input} value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="username" autoFocus />
        </div>
        <div style={S.group}>
          <label style={S.label}>Password *</label>
          <input style={S.input} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
        </div>

        <button type="submit" disabled={busy} style={{ ...S.btn, opacity: busy ? 0.6 : 1 }}>
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={S.switchText}>
          {mode === "login" ? (
            <>New guest? <button type="button" style={S.link} onClick={() => { setMode("register"); setError(""); }}>Create an account</button></>
          ) : (
            <>Already have an account? <button type="button" style={S.link} onClick={() => { setMode("login"); setError(""); }}>Sign in</button></>
          )}
        </div>
        <div style={{ ...S.switchText, marginTop: 10 }}>
          <button type="button" style={S.link} onClick={() => (window.location.href = "/")}>← Back to booking site</button>
        </div>
      </form>
    </div>
  );
}
