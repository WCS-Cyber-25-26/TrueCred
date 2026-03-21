"use client";

import { ShieldCheck, Cpu, Link2, Layers, Globe, Code2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FeatureCard } from "@/app/components/ui/grid-feature-cards";

const FEATURES = [
  {
    title: "Instant Verification",
    icon: ShieldCheck,
    description:
      "Credential checks complete in under 3 seconds — no waiting, no manual review.",
  },
  {
    title: "AI Fraud Detection",
    icon: Cpu,
    description:
      "99% accuracy on forgery detection using multi-layer machine learning models.",
  },
  {
    title: "Blockchain Immutability",
    icon: Link2,
    description:
      "Every credential is hashed and written on-chain. Tamper-proof by design.",
  },
  {
    title: "Bulk Verification",
    icon: Layers,
    description:
      "Process thousands of credentials simultaneously — built for enterprise HR pipelines.",
  },
  {
    title: "Global Coverage",
    icon: Globe,
    description:
      "Connected to 3,000+ institutions worldwide across 140 countries.",
  },
  {
    title: "API Access",
    icon: Code2,
    description:
      "Integrate directly into your HR stack with our REST API and webhooks.",
  },
];

function AnimatedContainer({ className, delay = 0.1, children, style }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", y: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.8 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export default function Benefits() {
  return (
    <section
      id="features"
      className="py-16 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, #020817 0%, #0a1628 50%, #020817 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-5xl space-y-10 px-4">
        {/* Heading */}
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <span
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs"
            style={{
              border: "1px solid rgba(37,99,235,0.3)",
              color: "#60a5fa",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Why TrueCred
          </span>
          <h2
            className="mt-4 text-3xl font-bold tracking-wide md:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Syne', sans-serif", color: "#ffffff" }}
          >
            Built for Trust at Scale
          </h2>
          <p
            className="mt-4 text-sm md:text-base"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Everything you need to verify, trust, and act on credentials —
            instantly.
          </p>
        </AnimatedContainer>

        {/* Feature grid */}
        <AnimatedContainer
          delay={0.3}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          style={{
            border: "1px dashed rgba(37,99,235,0.2)",
          }}
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={i}
              feature={feature}
              index={i}
              style={{
                borderRight:
                  i % 3 !== 2
                    ? "1px dashed rgba(37,99,235,0.2)"
                    : undefined,
                borderBottom:
                  i < 3 ? "1px dashed rgba(37,99,235,0.2)" : undefined,
              }}
            />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}
