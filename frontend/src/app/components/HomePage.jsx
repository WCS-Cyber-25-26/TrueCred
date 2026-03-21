"use client"

import TrueCredHero from "./ui/hero";
import Benefits from "./Benefits";
import TrustIndicators from "./TrustIndicators";
import ContactSection from "./ContactSection";

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#020817" }}>
      <TrueCredHero />

      {/* Themed divider */}
      <div className="relative flex items-center justify-center px-6 md:px-12 mx-auto max-w-5xl py-2">
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(37,99,235,0.4))" }} />
        <div
          style={{
            margin: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1px solid rgba(37,99,235,0.35)",
            background: "rgba(13,31,60,0.8)",
            color: "#3b82f6",
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L3 7V12C3 16.55 7.08 20.74 12 22C16.92 20.74 21 16.55 21 12V7L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(37,99,235,0.4))" }} />
      </div>

      <Benefits />

      <ContactSection />
    </div>
  );
}
