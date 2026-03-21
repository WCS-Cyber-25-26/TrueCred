'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, CheckCircle, XCircle, AlertCircle, Download, ExternalLink, FileText } from "lucide-react";
import CameraCapture from "./CameraCapture";

const VERDICT_CONFIG = {
  verified: {
    color: "#22c55e",
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Certificate Verified",
    message: "This certificate is anchored on the blockchain and passes visual authenticity checks.",
  },
  verified_tampered: {
    color: "#fbbf24",
    icon: <AlertCircle className="w-6 h-6" />,
    title: "Verified but Possibly Tampered",
    message: "The blockchain record matches, but visual AI analysis detected signs of alteration. Manual review recommended.",
  },
  revoked: {
    color: "#ef4444",
    icon: <XCircle className="w-6 h-6" />,
    title: "Certificate Revoked",
    message: "This credential has been revoked by the issuing institution.",
  },
  not_on_chain: {
    color: "#fbbf24",
    icon: <AlertCircle className="w-6 h-6" />,
    title: "Not on Blockchain",
    message: "The certificate looks authentic visually, but no blockchain record was found. It may be from an unregistered institution.",
  },
  forged: {
    color: "#ef4444",
    icon: <XCircle className="w-6 h-6" />,
    title: "Forged Certificate",
    message: "No blockchain record found and visual analysis indicates this certificate is not authentic.",
  },
};

const EMPTY_FIELDS = { university: "", studentName: "", degree: "", degreeAwardedDate: "", hiddenIdentifier: "" };

export default function VerifyPage() {
  const [mode, setMode] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraCapture = (blob) => {
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setUploadedFile(file);
    setVerificationStatus("idle");
    setResult(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) { setUploadedFile(files[0]); setVerificationStatus("idle"); setResult(null); }
  };
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) { setUploadedFile(files[0]); setVerificationStatus("idle"); setResult(null); }
  };

  const handleVerify = async () => {
    setVerificationStatus("loading");
    setErrorMessage(null);
    try {
      let response;
      if (mode === "fields") {
        response = await fetch("/api/verify/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
      } else {
        const formData = new FormData();
        formData.append("certificate", uploadedFile);
        response = await fetch("/api/verify", { method: "POST", body: formData });
      }
      const data = await response.json();
      if (!response.ok) { setErrorMessage(data.error || "Verification failed"); setVerificationStatus("error"); return; }
      setResult(data);
      setVerificationStatus(data.verdict);
    } catch (err) {
      setErrorMessage("Network error — could not reach verification service");
      setVerificationStatus("error");
    }
  };

  const canVerify = mode === "fields"
    ? fields.hiddenIdentifier.trim().length > 0
    : !!uploadedFile;

  const config = VERDICT_CONFIG[verificationStatus];
  const showResult = result && config;
  const isLoading = verificationStatus === "loading";
  const btnActive = canVerify && !isLoading;

  return (
    <div
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ background: "#020817", fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-[780px] mx-auto">

        {/* ── Page header ─────────────────────────────────────── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
          >
            Verify a Credential
          </h1>
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
          <p className="text-base mx-auto max-w-lg" style={{ color: "#64748b", lineHeight: 1.6 }}>
            Upload a diploma or certificate and we'll cross-check it against the blockchain,
            then run an AI visual scan — usually takes under 10 seconds.
          </p>
        </motion.div>

        {/* ── Testing mode toggle ──────────────────────────────── */}
        {process.env.NEXT_PUBLIC_SHOW_MANUAL_TEST === 'true' && (
          <div className="flex mb-8">
            <div
              className="inline-flex p-1 rounded-lg gap-1"
              style={{ background: "#0a1628", border: "1px solid rgba(37,99,235,0.2)" }}
            >
              {[
                { id: "upload", label: "Upload Certificate" },
                { id: "fields", label: "Manual Fields (Test)" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setResult(null); setVerificationStatus("idle"); }}
                  className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
                  style={mode === id
                    ? { background: "#2563eb", color: "white" }
                    : { color: "#64748b" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Manual fields (testing mode) ────────────────────── */}
        {mode === "fields" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl p-7 mb-8"
            style={{ background: "#0a1628", border: "1px solid rgba(37,99,235,0.2)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md"
                style={{ border: "1px solid rgba(37,99,235,0.3)", color: "#60a5fa", background: "rgba(37,99,235,0.08)" }}
              >
                Testing Mode
              </span>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Verifies fields directly against the blockchain — skips OCR
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "university", label: "University", placeholder: "Western University" },
                { key: "studentName", label: "Student Name", placeholder: "Alice Johnson" },
                { key: "degree", label: "Degree", placeholder: "Bachelor of Science" },
                { key: "degreeAwardedDate", label: "Awarded Date", placeholder: "YYYY-MM-DD" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: "#94a3b8" }}
                  >
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={fields[key]}
                    onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition-colors"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(37,99,235,0.25)", color: "white" }}
                    onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(37,99,235,0.25)"}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label
                  className="block text-xs font-semibold mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Cert ID <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="TC-XXXX-XXXX"
                  value={fields.hiddenIdentifier}
                  onChange={(e) => setFields((f) => ({ ...f, hiddenIdentifier: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-mono text-white outline-none transition-colors"
                  style={{ background: "#0d1f3c", border: "1px solid rgba(37,99,235,0.25)", color: "white" }}
                  onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(37,99,235,0.25)"}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Main layout (upload mode) ────────────────────────── */}
        <div className={mode === "fields" ? "hidden" : ""}>

          {/* Upload zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-5"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="file-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="block cursor-pointer"
              style={{
                borderRadius: 12,
                border: isDragging
                  ? "1.5px dashed rgba(59,130,246,0.6)"
                  : uploadedFile
                    ? "1.5px dashed rgba(34,197,94,0.5)"
                    : "1.5px dashed rgba(37,99,235,0.25)",
                background: isDragging
                  ? "rgba(37,99,235,0.05)"
                  : uploadedFile
                    ? "rgba(34,197,94,0.03)"
                    : "#0a1628",
                transition: "all 0.2s ease",
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2.5rem 2rem",
              }}
            >
              {uploadedFile ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
                  >
                    <CheckCircle className="w-6 h-6" style={{ color: "#22c55e" }} />
                  </div>
                  <div>
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm mb-1.5"
                      style={{ background: "#0d1f3c", color: "#4ade80" }}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      {uploadedFile.name}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                      Click to replace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <Upload className="w-8 h-8" style={{ color: isDragging ? "#60a5fa" : "#334155" }} />
                  <div>
                    <p className="text-base font-medium text-white mb-1">
                      Drop your certificate here
                    </p>
                    <p className="text-sm" style={{ color: "#475569" }}>
                      or click to browse &nbsp;·&nbsp;{" "}
                      <span style={{ color: "#334155" }}>PDF, JPG, PNG</span>
                    </p>
                  </div>
                </div>
              )}
            </label>
          </motion.div>

          {/* Below upload: How it works + Camera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-xl p-6"
              style={{ background: "#0a1628", border: "1px solid rgba(37,99,235,0.15)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#475569" }}>
                What happens when you verify
              </p>
              <div className="space-y-5">
                {[
                  { step: "1", title: "OCR reads the certificate", desc: "Google Cloud Vision extracts the fields and the hidden Cert ID embedded in the document." },
                  { step: "2", title: "Blockchain lookup", desc: "The canonical hash is checked against our Ethereum smart contract." },
                  { step: "3", title: "AI visual scan", desc: "An EfficientNet+DINOv2 model checks for signs of tampering or forgery." },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <span
                      className="text-xs font-mono mt-0.5 shrink-0 w-5 text-right"
                      style={{ color: "rgba(37,99,235,0.4)" }}
                    >
                      {step}.
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Camera — prominent */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="rounded-xl p-6 flex flex-col"
              style={{ background: "#0a1628", border: "1px solid rgba(37,99,235,0.15)" }}
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
                >
                  <Camera className="w-8 h-8" style={{ color: "#60a5fa" }} />
                </div>
                <h3
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Have the physical document?
                </h3>
                <p className="text-sm mb-6 max-w-[240px]" style={{ color: "#64748b", lineHeight: 1.6 }}>
                  No scan or digital copy needed — use your camera to capture it directly.
                </p>
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: "#2563eb" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                  onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                >
                  <Camera className="w-4 h-4" />
                  Open Camera
                </button>
              </div>
              <div
                className="mt-4 pt-4"
                style={{ borderTop: "1px solid rgba(37,99,235,0.1)" }}
              >
                <p className="text-[11px] mb-2.5" style={{ color: "#334155" }}>Tips for a good capture</p>
                <div className="space-y-1.5">
                  {[
                    "Good lighting, no glare",
                    "All four edges in frame",
                    "Hold steady — highest resolution possible",
                  ].map(tip => (
                    <p key={tip} className="text-[11px] flex gap-2" style={{ color: "#475569" }}>
                      <span style={{ color: "#1d4ed8" }}>—</span>
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── Verify button ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="mb-8"
        >
          <button
            onClick={handleVerify}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "0.01em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: btnActive ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              background: btnActive ? "#22c55e" : "rgba(255,255,255,0.04)",
              color: btnActive ? "white" : "rgba(255,255,255,0.15)",
              border: btnActive ? "none" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: "none",
            }}
            onMouseEnter={e => { if (btnActive) e.currentTarget.style.boxShadow = "0 0 28px rgba(34,197,94,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Verifying…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {canVerify ? "Run Verification" : "Upload a certificate to begin"}
              </>
            )}
          </button>
        </motion.div>

        {/* ── Error state ──────────────────────────────────────── */}
        <AnimatePresence>
          {verificationStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-8 text-sm"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
            >
              <XCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result panel ─────────────────────────────────────── */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="rounded-xl overflow-hidden"
              style={{
                background: "#0a1628",
                border: "1px solid rgba(37,99,235,0.2)",
                borderLeft: `4px solid ${config.color}`,
              }}
            >
              {/* Verdict header */}
              <div className="px-7 py-6" style={{ borderBottom: "1px solid rgba(37,99,235,0.1)" }}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${config.color}18`, border: `1px solid ${config.color}35` }}
                  >
                    <span style={{ color: config.color }}>{config.icon}</span>
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold mb-1"
                      style={{ fontFamily: "'Syne', sans-serif", color: config.color }}
                    >
                      {config.title}
                    </h2>
                    <p className="text-sm" style={{ color: "#94a3b8" }}>{config.message}</p>
                  </div>
                </div>
              </div>

              <div className="px-7 py-6 space-y-5">

                {/* Signal cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* AI Score */}
                  {result.aiScore !== null ? (
                    <div
                      className="p-5 rounded-xl"
                      style={{ background: "#0d1f3c", border: "1px solid rgba(37,99,235,0.12)" }}
                    >
                      <p className="text-xs font-semibold mb-4" style={{ color: "#475569" }}>
                        AI Visual Score
                      </p>
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {(result.aiScore * 100).toFixed(0)}%
                        </span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={result.aiScore >= 0.7
                            ? { background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
                            : { background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          {result.aiScore >= 0.7 ? "Authentic" : "Suspicious"}
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: `${result.aiScore * 100}%`,
                            background: result.aiScore >= 0.7
                              ? "linear-gradient(90deg, #16a34a, #22c55e)"
                              : "linear-gradient(90deg, #dc2626, #ef4444)",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-5 rounded-xl flex items-center justify-center"
                      style={{ background: "#0d1f3c", border: "1px solid rgba(37,99,235,0.12)" }}
                    >
                      <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.2)" }}>
                        AI score skipped in manual test mode
                      </p>
                    </div>
                  )}

                  {/* Blockchain record */}
                  <div
                    className="p-5 rounded-xl"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(37,99,235,0.12)" }}
                  >
                    <p className="text-xs font-semibold mb-4" style={{ color: "#475569" }}>
                      Blockchain Record
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        {result.issuedAt
                          ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#22c55e" }} />
                          : <XCircle className="w-4 h-4 shrink-0" style={{ color: "#ef4444" }} />}
                        <span className="text-sm" style={{ color: "#94a3b8" }}>
                          {result.issuedAt
                            ? `Issued ${new Date(result.issuedAt).toLocaleDateString()}`
                            : "Not found on chain"}
                        </span>
                      </div>
                      {result.revokedAt && (
                        <div className="flex items-center gap-2.5">
                          <XCircle className="w-4 h-4 shrink-0" style={{ color: "#ef4444" }} />
                          <span className="text-sm" style={{ color: "#94a3b8" }}>
                            Revoked {new Date(result.revokedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {result.rsaVerified && (
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#22c55e" }} />
                          <span className="text-sm" style={{ color: "#94a3b8" }}>RSA signature verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Credential details */}
                {result.credential && (
                  <div
                    className="p-5 rounded-xl"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(37,99,235,0.12)" }}
                  >
                    <p className="text-xs font-semibold mb-4" style={{ color: "#475569" }}>
                      Credential Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Institution", value: result.credential.university.name },
                        { label: "Degree", value: result.credential.degreeName },
                        ...(result.credential.program ? [{ label: "Program", value: result.credential.program }] : []),
                        { label: "Awarded", value: new Date(result.credential.awardedDate).toLocaleDateString() },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs mb-1" style={{ color: "#334155" }}>{label}</p>
                          <p className="text-sm font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cryptographic proof */}
                {result.issuedAt && (
                  <div
                    className="p-5 rounded-xl"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(37,99,235,0.12)" }}
                  >
                    <p className="text-xs font-semibold mb-4" style={{ color: "#475569" }}>
                      Cryptographic Proof
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs mb-2" style={{ color: "#334155" }}>
                          Canonical Hash (SHA-256)
                        </p>
                        <div
                          className="font-mono text-xs px-4 py-3 rounded-lg break-all"
                          style={{ background: "#020817", border: "1px solid rgba(37,99,235,0.15)", color: "#60a5fa" }}
                        >
                          {result.canonicalHash}
                        </div>
                      </div>
                      {result.etherscanUrl && (
                        <a
                          href={result.etherscanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                          style={{ color: "#60a5fa" }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Etherscan
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      border: "1px solid rgba(37,99,235,0.25)",
                      color: "#60a5fa",
                      background: "transparent",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showCamera && (
        <CameraCapture
          open={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />
      )}
    </div>
  );
}
