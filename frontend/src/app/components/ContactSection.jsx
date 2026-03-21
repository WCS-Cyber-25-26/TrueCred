"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Icons ─────────────────────────────────────────────── */
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7L12 13L22 7" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.27-.52a2 2 0 012.11.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6V12L16 14" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01L9 11.01" />
    </svg>
  );
}

/* ── Input field ────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-widest" style={{ color: "#475569" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-lg text-sm text-white outline-none transition-colors duration-200";
const inputStyle = {
  backgroundColor: "#0a1628",
  border: "1px solid rgba(30,58,138,0.4)",
};

/* ── Contact detail row ─────────────────────────────────── */
function ContactRow({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0"
        style={{
          backgroundColor: "rgba(23,37,84,0.5)",
          border: "1px solid rgba(30,58,138,0.3)",
          color: "#60a5fa",
        }}
      >
        <Icon />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#475569" }}>{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────── */
export default function ContactSection() {
  const [form, setForm] = useState({ name: "", org: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = "rgba(59,130,246,0.7)";
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = "rgba(30,58,138,0.4)";
  };

  return (
    <section
      id="contact"
      className="py-24"
      style={{ backgroundColor: "#020817" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Section border wrapper */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(30,58,138,0.3)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ── Left — info ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="p-10 lg:p-14"
              style={{
                backgroundColor: "#0a1628",
                borderRight: "1px solid rgba(30,58,138,0.3)",
              }}
            >
              <h2 className="font-display font-bold text-4xl text-white mb-4">
                Get in Touch
              </h2>
              <p className="text-sm leading-relaxed mb-10" style={{ color: "#94a3b8" }}>
                TrueCred serves universities and enterprise HR teams who need reliable, scalable
                credential verification. Tell us about your needs and we'll respond within 24 hours.
              </p>

              <div className="space-y-5">
                <ContactRow Icon={IconMail} label="Email" value="verify@truecred.io" />
                <ContactRow Icon={IconPhone} label="Phone" value="+1 (800) TRU-CRED" />
                <ContactRow Icon={IconClock} label="Support" value="Available 24/7" />
              </div>

              {/* Decorative grid lines */}
              <div className="mt-12 grid grid-cols-3 gap-2 opacity-20">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-px"
                    style={{ backgroundColor: "rgba(59,130,246,0.4)" }}
                  />
                ))}
              </div>
            </motion.div>

            {/* ── Right — form ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-10 lg:p-14"
              style={{ backgroundColor: "#0d1f3c" }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full flex flex-col items-center justify-center text-center py-16"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                      style={{
                        backgroundColor: "rgba(5,150,105,0.15)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        color: "#34d399",
                      }}
                    >
                      <IconCheck />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white mb-3">
                      Message Received
                    </h3>
                    <p className="text-sm" style={{ color: "#94a3b8" }}>
                      We'll be in touch within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", org: "", email: "", message: "" }); }}
                      className="mt-8 text-xs underline underline-offset-2 transition-colors"
                      style={{ color: "#475569" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <Field label="Name">
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        type="text"
                        placeholder="Jane Smith"
                        required
                        className={inputClass}
                        style={{ ...inputStyle, placeholderColor: "#334155" }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>

                    <Field label="Organization">
                      <input
                        name="org"
                        value={form.org}
                        onChange={handleChange}
                        type="text"
                        placeholder="University or Company"
                        className={inputClass}
                        style={inputStyle}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="jane@institution.edu"
                        required
                        className={inputClass}
                        style={inputStyle}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>

                    <Field label="Message">
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about your verification needs..."
                        required
                        className={inputClass}
                        style={{ ...inputStyle, resize: "none" }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors duration-200"
                      style={{ backgroundColor: "#2563eb" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                    >
                      Send Message
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
