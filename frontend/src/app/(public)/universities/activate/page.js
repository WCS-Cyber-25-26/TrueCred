"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7V12C3 16.55 7.08 20.74 12 22C16.92 20.74 21 16.55 21 12V7L12 2Z"
          stroke="#60a5fa"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 12L11 14L15 10" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-display font-bold text-white text-xl tracking-tight">TrueCred</span>
    </div>
  );
}

function ActivateContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h2 style={{ color: "white", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Invalid Invite Link
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          This invite link is missing a token. Please use the link provided in your invitation.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 style={{ color: "white", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Account Activated!
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
          Your university account is ready. You can now log in with your credentials.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            background: "#2563eb",
            color: "white",
            padding: "10px 28px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/universities/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "#0d1f3c",
    border: "1px solid rgba(37,99,235,0.25)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "white",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2
          className="font-display"
          style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 6 }}
        >
          Accept University Invite
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Set a password to activate your university account.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label
            className="font-display"
            style={{ display: "block", color: "#60a5fa", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#2563eb"}
            onBlur={e => e.target.style.borderColor = "rgba(37,99,235,0.25)"}
          />
        </div>

        <div>
          <label
            className="font-display"
            style={{ display: "block", color: "#60a5fa", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#2563eb"}
            onBlur={e => e.target.style.borderColor = "rgba(37,99,235,0.25)"}
          />
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "11px 0",
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginTop: 4,
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1d4ed8"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#2563eb"; }}
        >
          {loading ? "Activating..." : "Accept Invite"}
        </button>
      </form>
    </>
  );
}

export default function ActivatePage() {
  return (
    <div
      className="font-body"
      style={{
        minHeight: "100vh",
        background: "#020817",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Logo />
        </div>

        {/* Card */}
        <div
          style={{
            background: "#0a1628",
            border: "1px solid rgba(37,99,235,0.25)",
            borderRadius: 16,
            padding: "32px 28px",
          }}
        >
          <Suspense fallback={<p style={{ color: "#94a3b8" }}>Loading...</p>}>
            <ActivateContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
