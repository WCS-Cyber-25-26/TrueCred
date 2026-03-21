"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const DOT_GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='rgba(59%2C130%2C246%2C0.18)'/%3E%3C/svg%3E")`;

function ShieldIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3 7V12C3 16.55 7.08 20.74 12 22C16.92 20.74 21 16.55 21 12V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CredentialCard() {
  const [progressWidth, setProgressWidth] = useState("0%");

  useEffect(() => {
    const timer = setTimeout(() => setProgressWidth("100%"), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative pb-5 pr-5">
      {/* Main card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(30,58,138,0.5)",
          backgroundColor: "#0a1628",
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{
            backgroundColor: "#0d1f3c",
            borderBottom: "1px solid rgba(30,58,138,0.4)",
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.7)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(234,179,8,0.7)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.7)" }} />
          </div>
          <span className="font-mono text-xs" style={{ color: "#64748b" }}>
            truecred://verify
          </span>
        </div>

        {/* Scan zone */}
        <div className="relative overflow-hidden" style={{ height: "160px" }}>
          {/* Animated scan line */}
          <div
            className="animate-scan absolute left-0 right-0 z-10"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.8), transparent)",
              boxShadow: "0 0 10px 2px rgba(96,165,250,0.35)",
            }}
          />

          {/* Mock certificate placeholder */}
          <div
            className="mx-4 mt-4 rounded p-4"
            style={{
              background: "linear-gradient(135deg, rgba(30,41,59,0.4), rgba(15,23,42,0.2))",
              border: "1px solid rgba(51,65,85,0.3)",
            }}
          >
            <div className="space-y-2.5">
              <div className="flex gap-2 items-center mb-3">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: "rgba(30,58,138,0.3)" }} />
                <div className="space-y-1 flex-1">
                  <div className="h-1.5 rounded" style={{ backgroundColor: "rgba(100,116,139,0.3)", width: "60%" }} />
                  <div className="h-1.5 rounded" style={{ backgroundColor: "rgba(100,116,139,0.2)", width: "40%" }} />
                </div>
              </div>
              <div className="h-1.5 rounded" style={{ backgroundColor: "rgba(100,116,139,0.25)", width: "85%" }} />
              <div className="h-1.5 rounded" style={{ backgroundColor: "rgba(100,116,139,0.2)", width: "70%" }} />
              <div className="h-1.5 rounded" style={{ backgroundColor: "rgba(100,116,139,0.15)", width: "55%" }} />
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div className="px-4 pb-4 pt-3 space-y-3">
          {/* Hash row */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "#475569" }}>
              Document Hash
            </p>
            <p className="font-mono text-[11px]" style={{ color: "#94a3b8" }}>
              0x7f3a9c2e1b4d8f6a...b9c2e1d4
            </p>
          </div>

          {/* Metadata 2×2 grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "Issued By", value: "MIT" },
              { label: "Date", value: "2024-05-18" },
              { label: "Recipient", value: "J. Smith" },
              { label: "Degree", value: "BSc CompSci" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: "#475569" }}>
                  {label}
                </p>
                <p className="font-mono text-[11px] mt-0.5" style={{ color: "#cbd5e1" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div style={{ height: "1px", backgroundColor: "rgba(30,58,138,0.4)" }} />

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[9px] uppercase tracking-widest" style={{ color: "#475569" }}>
                Verification Progress
              </p>
              <p className="font-mono text-[10px]" style={{ color: "#60a5fa" }}>
                100%
              </p>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(30,58,138,0.3)" }}>
              <div
                className="h-full rounded-full transition-all ease-out"
                style={{
                  width: progressWidth,
                  transitionDuration: "1200ms",
                  background: "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Verified badge — outside card so it overflows */}
      <div className="absolute bottom-0 right-0">
        <div className="relative">
          <div
            className="animate-ping-slow absolute inset-0 rounded-xl"
            style={{ backgroundColor: "rgba(16,185,129,0.2)" }}
          />
          <div
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{
              backgroundColor: "#059669",
              boxShadow: "0 4px 24px rgba(16,185,129,0.35)",
            }}
          >
            <CheckIcon size={13} />
            VERIFIED
          </div>
        </div>
      </div>
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16"
      style={{ backgroundColor: "#020817" }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: DOT_GRID_SVG }}
      />

      {/* Left-column glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 20% 55%, rgba(29,78,216,0.18) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">
          {/* ── Left Column ─────────────────────── */}
          <div className="space-y-8">
            {/* Eyebrow pill */}
            <motion.div {...fadeUp(0)}>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1"
                style={{
                  border: "1px solid rgba(59,130,246,0.3)",
                  backgroundColor: "rgba(23,37,84,0.3)",
                }}
              >
                <span
                  className="animate-blink w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#60a5fa" }}
                />
                <span
                  className="font-mono text-[10px] tracking-widest uppercase"
                  style={{ color: "#93c5fd" }}
                >
                  AI · Blockchain · Zero Fraud
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.1)}
              className="font-display leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", fontWeight: 800 }}
            >
              <span className="block text-white">Verify</span>
              <span className="block">
                <span className="hero-shimmer">What</span>
                <span className="text-white"> Matters.</span>
              </span>
            </motion.h1>

            {/* Body copy */}
            <motion.p
              {...fadeUp(0.2)}
              className="text-base leading-relaxed max-w-md"
              style={{ color: "#94a3b8" }}
            >
              TrueCred uses advanced AI and blockchain technology to eliminate diploma fraud,
              providing universities and corporations with instant, tamper-proof credential
              verification.
            </motion.p>

            {/* CTA row */}
            <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-3">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors duration-200"
                style={{ backgroundColor: "#2563eb" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
              >
                <ShieldIcon size={15} />
                Verify a Credential
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-5 py-3 rounded-lg text-sm transition-all duration-200"
                style={{ border: "1px solid rgba(51,65,85,1)", color: "#cbd5e1" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(51,65,85,1)";
                  e.currentTarget.style.color = "#cbd5e1";
                }}
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stats strip */}
            <motion.div {...fadeUp(0.4)}>
              <div
                className="inline-flex items-center gap-0 mt-2"
                style={{ borderTop: "1px solid rgba(30,58,138,0.3)", paddingTop: "1.25rem" }}
              >
                {[
                  { value: "2.4M+", label: "Certs Verified" },
                  { value: "99%", label: "Accuracy" },
                  { value: "340+", label: "Partners" },
                ].map((stat, i) => (
                  <div key={stat.label} className="flex items-center">
                    {i > 0 && (
                      <div
                        className="self-stretch mx-6"
                        style={{ width: "1px", backgroundColor: "rgba(30,58,138,0.4)" }}
                      />
                    )}
                    <div>
                      <p
                        className="font-display font-bold text-xl leading-none"
                        style={{ color: "#ffffff" }}
                      >
                        {stat.value}
                      </p>
                      <p className="text-[11px] mt-1 uppercase tracking-wider" style={{ color: "#64748b" }}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right Column — Credential Card ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <CredentialCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
