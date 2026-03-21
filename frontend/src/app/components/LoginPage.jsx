"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3 7V12C3 16.55 7.08 20.74 12 22C16.92 20.74 21 16.55 21 12V7L12 2Z"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InputField({ label, id, icon: Icon, right, inputProps }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="text-xs uppercase tracking-widest font-display font-bold"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </label>
        {right}
      </div>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200"
          style={{ color: focused ? "#60a5fa" : "#475569" }}
        />
        <input
          id={id}
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          className="w-full pl-11 pr-4 py-3 text-sm outline-none transition-all duration-200 font-body"
          style={{
            backgroundColor: "#0d1f3c",
            border: `1px solid ${focused ? "rgba(59,130,246,0.6)" : "rgba(30,58,138,0.4)"}`,
            borderRadius: 8,
            color: "#ffffff",
            boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      const user = login(data.token);
      const role = user?.role;
      if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "STUDENT") router.push("/dashboard/student");
      else router.push("/dashboard/university");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: "#020817" }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(37,99,235,0.07) 0%, transparent 80%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
        style={{
          backgroundColor: "#0a1628",
          border: "1px solid rgba(30,58,138,0.4)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Top-left corner bracket */}



        <div className="p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <ShieldIcon />
              <span className="font-display font-bold text-white text-xl tracking-tight">
                TrueCred
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold font-display"
              style={{ color: "#ffffff" }}
            >
              Welcome Back
            </h1>
            <p className="mt-1 text-sm font-body" style={{ color: "#94a3b8" }}>
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <InputField
              label="Work Email"
              id="email"
              icon={Mail}
              inputProps={{
                type: "email",
                required: true,
                value: email,
                placeholder: "name@institution.edu",
                onChange: (e) => setEmail(e.target.value),
              }}
            />

            <InputField
              label="Password"
              id="password"
              icon={Lock}
              right={
                <Link
                  href="/forgot-password"
                  className="text-xs font-display font-bold transition-colors duration-200"
                  style={{ color: "#60a5fa" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
                >
                  Forgot?
                </Link>
              }
              inputProps={{
                type: "password",
                required: true,
                value: password,
                placeholder: "••••••••",
                onChange: (e) => setPassword(e.target.value),
              }}
            />

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2 text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                  borderRadius: 6,
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-display font-bold text-white transition-all duration-200 disabled:opacity-60"
              style={{
                backgroundColor: btnHover && !loading ? "#1d4ed8" : "#2563eb",
                borderRadius: 8,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Logging in…
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            className="mt-8 pt-6 text-center"
            style={{ borderTop: "1px solid rgba(30,58,138,0.3)" }}
          >
            <p className="text-sm font-body" style={{ color: "#475569" }}>
              Don&apos;t have an institutional account?
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-display font-bold transition-colors duration-200"
              style={{ color: "#60a5fa" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
            >
              <UserPlus className="w-4 h-4" />
              Contact us to partner
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
