"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="a-login-root">
      <div className="a-login-card">
        {/* Brand */}
        <div className="a-login-brand">
          <div className="a-login-brand-icon">⚡</div>
          <div>
            <div className="a-login-brand-name">InfoGrid</div>
            <div className="a-login-brand-sub">Admin Panel</div>
          </div>
        </div>

        <h1 className="a-login-heading">Sign in</h1>
        <p className="a-login-sub">Enter your credentials to continue</p>

        <form className="a-login-form" onSubmit={handleSubmit}>
          <div className="a-login-field">
            <label htmlFor="username" className="a-login-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="a-login-input"
              placeholder="administrator"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="a-login-field">
            <label htmlFor="password" className="a-login-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="a-login-input"
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="a-login-error">{error}</p>}

          <button
            type="submit"
            className="a-login-btn"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
