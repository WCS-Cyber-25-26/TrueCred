"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Globe3D from "./Globe3D";

export default function TrueCredHero() {
  return (
    <section
      className="relative w-full overflow-hidden pb-10 pt-32 font-light text-white antialiased md:pb-16 md:pt-20"
      style={{
        background: "linear-gradient(180deg, #020817 0%, #0a1628 60%, #020817 100%)",
      }}
    >
      {/* Right glow */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(37,99,235,0.12) 0%, rgba(2,8,23,0) 60%)",
        }}
      />
      {/* Left glow (mirrored) */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 pointer-events-none -scale-x-100"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(37,99,235,0.12) 0%, rgba(2,8,23,0) 60%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span
            className="mb-6 inline-block rounded-full px-3 py-1 text-xs"
            style={{
              border: "1px solid rgba(37,99,235,0.3)",
              color: "#60a5fa",
            }}
          >
            AI · BLOCKCHAIN · ZERO FRAUD
          </span>

          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Verify What Matters with{" "}
            <span style={{ color: "#60a5fa" }}>Blockchain-Secured</span> Credentials
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl" style={{ color: "rgba(255,255,255,0.6)" }}>
            TrueCred uses advanced AI and blockchain technology to eliminate diploma fraud,
            providing universities and corporations with instant, reliable credential verification.
          </p>

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:mb-0 sm:flex-row">
            <Link
              href="/verify"
              className="truecred-button relative w-full overflow-hidden rounded-full px-8 py-4 text-white shadow-lg transition-all duration-300 sm:w-auto"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(37,99,235,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Verify a Certificate
            </Link>
            <a
              href="/about#how-it-works"
              className="flex w-full items-center justify-center gap-2 transition-colors sm:w-auto"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              <span>See how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          {/* Globe — radial mask feathers all edges at the compositing level */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "420px",
              marginBottom: "-100px",
              overflow: "hidden",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 85% at 50% 55%, black 35%, transparent 72%)",
              maskImage:
                "radial-gradient(ellipse 75% 85% at 50% 55%, black 35%, transparent 72%)",
            }}
          >
            <Globe3D height={900} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
