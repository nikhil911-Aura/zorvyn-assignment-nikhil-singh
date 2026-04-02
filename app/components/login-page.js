"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { ButtonSpinner } from "./loader";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-[420px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-5">
            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-text-muted text-sm">Sign in to your Finance Dashboard</p>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-7">
          {error && (
            <div className="bg-danger-subtle border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm mb-5 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary outline-none transition-colors focus:border-accent placeholder:text-text-muted/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary outline-none transition-colors focus:border-accent placeholder:text-text-muted/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <ButtonSpinner />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-5 bg-bg-card/50 border border-border rounded-xl p-4">
          <p className="text-[11px] font-semibold text-text-muted/60 uppercase tracking-wider mb-3">Demo Accounts</p>
          <div className="space-y-2">
            {[
              { email: "admin@example.com", role: "Admin", color: "text-accent" },
              { email: "analyst@example.com", role: "Analyst", color: "text-warning" },
              { email: "viewer@example.com", role: "Viewer", color: "text-text-muted" },
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword("password123"); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-bg-input transition-colors text-left cursor-pointer bg-transparent border-none"
              >
                <span className="text-xs text-text-primary">{acc.email}</span>
                <span className={`text-[10px] font-bold tracking-wide ${acc.color}`}>{acc.role}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-muted/50 mt-2 text-center">Password: password123</p>
        </div>
      </div>
    </div>
  );
}
