"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ── Animated counter ───────────────────────────────────── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { count, ref };
}

/* ── Metric card ────────────────────────────────────────── */
function MetricCard({ label, targetNum, suffix, prefix }) {
  const { count, ref } = useCounter(targetNum, 2200);

  return (
    <div ref={ref} className="text-center px-8 py-2">
      <p className="font-display font-bold text-3xl text-white mb-1">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-[11px] uppercase tracking-widest" style={{ color: "#475569" }}>
        {label}
      </p>
    </div>
  );
}

/* ── Institution marquee ────────────────────────────────── */
const INSTITUTIONS = [
  "MIT", "Stanford", "Oxford", "ETH Zürich", "NUS",
  "UCL", "TU Berlin", "McGill", "UNSW", "Caltech",
];

function InstitutionChip({ name }) {
  return (
    <span
      className="font-mono text-sm whitespace-nowrap px-4 py-2 rounded"
      style={{
        border: "1px solid rgba(30,58,138,0.4)",
        backgroundColor: "#0d1f3c",
        color: "#94a3b8",
      }}
    >
      {name}
    </span>
  );
}

/* ── Section ────────────────────────────────────────────── */
export default function TrustIndicators() {
  return (
    <section style={{ backgroundColor: "#020817" }}>
      {/* Row A — Metrics strip */}
      <div
        className="py-12"
        style={{
          backgroundColor: "#0a1628",
          borderTop: "1px solid rgba(30,58,138,0.3)",
          borderBottom: "1px solid rgba(30,58,138,0.3)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0"
            style={{ borderColor: "rgba(30,58,138,0.3)" }}
          >
            {[
              { label: "Credentials Verified", targetNum: 2400000, suffix: "+", prefix: "" },
              { label: "Fraud Cases Prevented", targetNum: 18400, suffix: "+", prefix: "" },
              { label: "Universities Onboarded", targetNum: 340, suffix: "+", prefix: "" },
              { label: "Avg Verification Time", targetNum: 3, suffix: "s", prefix: "<" },
            ].map((m, i) => (
              <div key={m.label} className="flex items-center">
                {i > 0 && (
                  <div
                    className="hidden sm:block self-stretch mx-0"
                    style={{ width: "1px", backgroundColor: "rgba(30,58,138,0.4)", margin: "0" }}
                  />
                )}
                <MetricCard {...m} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Row B — Scrolling institution marquee */}
      <div className="py-10 overflow-hidden">
        <p
          className="text-center text-[11px] uppercase tracking-widest mb-6"
          style={{ color: "#334155" }}
        >
          Trusted by leading institutions
        </p>
        <div className="relative">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 w-20 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #020817, transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 z-10 w-20 pointer-events-none"
            style={{ background: "linear-gradient(-90deg, #020817, transparent)" }}
          />

          <div className="flex gap-3 animate-marquee" style={{ width: "max-content" }}>
            {[...INSTITUTIONS, ...INSTITUTIONS].map((name, i) => (
              <InstitutionChip key={i} name={name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
