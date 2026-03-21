"use client";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Users, Target, Shield, Cpu, Zap, Heart, Mail, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";


const HOW_IT_WORKS = [
  {
    icon: Shield,
    title: "Cryptographic Hashing",
    desc: "Each credential receives a unique digital fingerprint that cannot be replicated or altered.",
  },
  {
    icon: Link2,
    title: "Blockchain Verification",
    desc: "Credentials are stored on an immutable ledger, providing transparent and tamper-proof record-keeping.",
  },
  {
    icon: Cpu,
    title: "AI Forgery Detection",
    desc: "Machine learning algorithms scan documents for signs of manipulation, ensuring authenticity at every level.",
  },
];

const TECH_STACK = [
  "Backend: Microservices architecture powered by Python, Java, and JavaScript",
  "Frontend: Next.js with TailwindCSS for a seamless user experience",
  "Security: End-to-end encryption and blockchain integration",
  "AI/ML: Advanced algorithms for document verification and fraud detection",
];

const WHY_TRUECRED = [
  { title: "Instant Verification", desc: "Verify credentials in seconds, not days" },
  { title: "Bank-Level Security", desc: "Military-grade encryption protects data" },
  { title: "Cost-Effective", desc: "Reduce costs while improving accuracy" },
  { title: "Future-Ready", desc: "Designed to grow with your organization" },
];

const VALUES = [
  { icon: Zap, title: "Innovation", desc: "We leverage cutting-edge technology to solve real-world problems" },
  { icon: Shield, title: "Integrity", desc: "Academic credentials deserve uncompromising protection" },
  { icon: Heart, title: "Accessibility", desc: "Verification should be fast, simple, and affordable for everyone" },
  { icon: Users, title: "Collaboration", desc: "Built by students, for institutions, with transparency at our core" },
];

function AnimatedSection({ children, className, style, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function IconBox({ icon: Icon }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: "rgba(37,99,235,0.1)",
        border: "1px solid rgba(37,99,235,0.25)",
        color: "#60a5fa",
      }}
    >
      <Icon width={20} height={20} strokeWidth={1.5} />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <span
      className="mb-4 inline-block rounded-full px-3 py-1 text-xs uppercase"
      style={{
        border: "1px solid rgba(37,99,235,0.3)",
        color: "#60a5fa",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.12em",
      }}
    >
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#020817" }} className="min-h-screen">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-40 pb-24 px-6 md:px-12 text-center overflow-hidden">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)",
          }}
        />
        <AnimatedSection className="relative max-w-4xl mx-auto">
          <SectionLabel>About TrueCred</SectionLabel>
          <h1
            className="mt-4 text-5xl md:text-6xl font-bold tracking-tight font-display"
            style={{ color: "#ffffff" }}
          >
            Securing Credentials{" "}
            <span style={{ color: "#60a5fa" }}>Through Innovation</span>
          </h1>
          <p
            className="mt-6 text-lg md:text-xl max-w-3xl mx-auto font-body"
            style={{ color: "#94a3b8" }}
          >
            We&apos;re building the future of diploma and certificate verification for
            universities and corporations — powered by AI and secured by blockchain.
          </p>
        </AnimatedSection>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center px-6 md:px-12 mx-auto max-w-5xl py-2">
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(37,99,235,0.3))" }} />
        <div style={{ margin: "0 16px", width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(59,130,246,0.5)" }} />
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(37,99,235,0.3))" }} />
      </div>

      {/* ── Mission & Who We Are ────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Mission + Who We Are */}
          <AnimatedSection className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <IconBox icon={Target} />
                <h2 className="text-2xl font-bold font-display" style={{ color: "#ffffff" }}>
                  Our Mission
                </h2>
              </div>
              <p className="text-sm leading-relaxed font-body mb-4" style={{ color: "#94a3b8" }}>
                TrueCred was created to solve a critical problem: credential fraud. In an era where
                diplomas and certificates can be easily forged, institutions need a reliable way to
                verify academic achievements.
              </p>
              <p className="text-sm leading-relaxed font-body" style={{ color: "#94a3b8" }}>
                Our platform combines blockchain technology, cryptographic hashing, and AI-powered
                forgery detection to provide instant, secure credential verification — ensuring that
                every credential tells a true story of achievement.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-5">
                <IconBox icon={Users} />
                <h2 className="text-2xl font-bold font-display" style={{ color: "#ffffff" }}>
                  Who We Are
                </h2>
              </div>
              <p className="text-sm leading-relaxed font-body mb-4" style={{ color: "#94a3b8" }}>
                TrueCred is developed by the Western Cyber Society at Western University — a
                student-led organization passionate about cybersecurity, AI, and blockchain
                innovation. Our team brings together developers, researchers, and designers united
                by a mission to make credential verification secure and trustworthy.
              </p>
              <p className="text-sm leading-relaxed font-body" style={{ color: "#94a3b8" }}>
                As students ourselves, we understand the importance of protecting academic integrity
                and ensuring that hard-earned credentials are recognized worldwide.
              </p>
            </div>
          </AnimatedSection>


          {/* Right: How It Works */}
          <AnimatedSection delay={0.15}>
            <div
              className="p-8"
              style={{
                backgroundColor: "#0a1628",
                border: "1px dashed rgba(37,99,235,0.3)",
                borderRadius: 12,
              }}
            >
              <h3
                className="text-lg font-bold font-display mb-8"
                style={{ color: "#ffffff" }}
              >
                How It Works
              </h3>
              <div className="space-y-7">
                {HOW_IT_WORKS.map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <IconBox icon={icon} />
                    <div>
                      <h4
                        className="text-sm font-semibold font-display mb-1"
                        style={{ color: "#ffffff" }}
                      >
                        {title}
                      </h4>
                      <p className="text-xs leading-relaxed font-body" style={{ color: "#94a3b8" }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
      {/* Divider */}
      <div className="flex items-center justify-center px-6 md:px-12 mx-auto max-w-5xl py-2">
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(37,99,235,0.3))" }} />
        <div style={{ margin: "0 16px", width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(59,130,246,0.5)" }} />
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(37,99,235,0.3))" }} />
      </div>
      {/* ── Technology & Why TrueCred ───────────────────────── */}
      <section
        className="py-24 px-6 md:px-12"
        style={{
          background: "linear-gradient(180deg, #020817 0%, #0a1628 50%, #020817 100%)",
        }}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">

          {/* Tech stack */}
          <AnimatedSection>
            <SectionLabel>Stack</SectionLabel>
            <h2 className="mt-3 text-2xl font-bold font-display mb-6" style={{ color: "#ffffff" }}>
              Our Technology
            </h2>
            <p className="text-sm font-body mb-6" style={{ color: "#94a3b8" }}>
              Built with modern, scalable technology designed to grow with your organization:
            </p>
            <ul className="space-y-4">
              {TECH_STACK.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-body" style={{ color: "#94a3b8" }}>
                  <div
                    className="shrink-0 mt-1.5"
                    style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#3b82f6" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>

          {/* Why TrueCred */}
          <AnimatedSection delay={0.15}>
            <div
              className="p-8 h-full"
              style={{
                backgroundColor: "#0a1628",
                border: "1px solid rgba(30,58,138,0.4)",
                borderRadius: 12,
              }}
            >
              {/* Top-left bracket */}
              <div
                className="pointer-events-none absolute top-0 left-0"
                style={{
                  width: 16, height: 16,
                  borderTop: "1px solid rgba(59,130,246,0.5)",
                  borderLeft: "1px solid rgba(59,130,246,0.5)",
                }}
              />
              <SectionLabel>Why us</SectionLabel>
              <h2 className="mt-3 text-2xl font-bold font-display mb-8" style={{ color: "#ffffff" }}>
                Why Choose TrueCred?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {WHY_TRUECRED.map(({ title, desc }) => (
                  <div key={title}>
                    <h4 className="text-sm font-semibold font-display mb-1" style={{ color: "#60a5fa" }}>
                      {title}
                    </h4>
                    <p className="text-xs font-body" style={{ color: "#94a3b8" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>


      </section>
      {/* Divider */}
      <div className="flex items-center justify-center px-6 md:px-12 mx-auto max-w-5xl py-2">
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(37,99,235,0.3))" }} />
        <div style={{ margin: "0 16px", width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(59,130,246,0.5)" }} />
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(37,99,235,0.3))" }} />
      </div>
      {/* ── Values ─────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>What we stand for</SectionLabel>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold font-display" style={{ color: "#ffffff" }}>
              Our Values
            </h2>
          </AnimatedSection>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            style={{ border: "1px dashed rgba(37,99,235,0.2)", borderRadius: 12, overflow: "hidden" }}
          >
            {VALUES.map(({ icon, title, desc }, i) => (
              <AnimatedSection
                key={title}
                delay={i * 0.1}
                className="p-8"
                style={{
                  backgroundColor: "#0a1628",
                  borderRight: i < 3 ? "1px dashed rgba(37,99,235,0.2)" : undefined,
                }}
              >
                <IconBox icon={icon} />
                <h4
                  className="mt-6 text-base font-semibold font-display mb-2"
                  style={{ color: "#ffffff" }}
                >
                  {title}
                </h4>
                <p className="text-xs leading-relaxed font-body" style={{ color: "#94a3b8" }}>
                  {desc}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      {/* Divider */}
      <div className="flex items-center justify-center px-6 md:px-12 mx-auto max-w-5xl py-2">
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(37,99,235,0.3))" }} />
        <div style={{ margin: "0 16px", width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(59,130,246,0.5)" }} />
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(37,99,235,0.3))" }} />
      </div>
      {/* ── Get in Touch ────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <div
            className="relative p-12 overflow-hidden"
            style={{
              backgroundColor: "#0a1628",
              border: "1px solid rgba(30,58,138,0.4)",
              borderRadius: 12,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2"
              style={{
                width: "40%",
                height: 1,
                background: "linear-gradient(to right, transparent, rgba(59,130,246,0.6), transparent)",
              }}
            />
            {/* Glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
              }}
            />

            <h2 className="text-3xl font-bold font-display mb-4" style={{ color: "#ffffff" }}>
              Get in Touch
            </h2>
            <p className="text-sm leading-relaxed font-body mb-10 max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
              Ready to secure your credentials? Whether you&apos;re a university looking to protect
              your degrees or a corporation seeking to verify applicant credentials, we&apos;re here
              to help.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold font-display text-white transition-all duration-200"
              style={{
                backgroundColor: "#2563eb",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              <Mail className="w-4 h-4" />
              Contact us to learn more
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
