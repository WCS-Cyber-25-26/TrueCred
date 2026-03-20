'use client'

import { useState } from "react";
import { Upload, Camera, CheckCircle, XCircle, AlertCircle, Download, ExternalLink } from "lucide-react";

const VERDICT_CONFIG = {
  verified: {
    color: "text-[#22c55e]",
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle className="w-16 h-16" />,
    title: "Certificate Verified",
    message: "This certificate is anchored on the blockchain and passes visual authenticity checks.",
  },
  verified_tampered: {
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    icon: <AlertCircle className="w-16 h-16" />,
    title: "Verified but Possibly Tampered",
    message: "The blockchain record matches, but visual AI analysis detected signs of alteration. Manual review recommended.",
  },
  revoked: {
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="w-16 h-16" />,
    title: "Certificate Revoked",
    message: "This credential has been revoked by the issuing institution.",
  },
  not_on_chain: {
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    icon: <AlertCircle className="w-16 h-16" />,
    title: "Not on Blockchain",
    message: "The certificate looks authentic visually, but no blockchain record was found. It may be from an unregistered institution.",
  },
  forged: {
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="w-16 h-16" />,
    title: "Forged Certificate",
    message: "No blockchain record found and visual analysis indicates this certificate is not authentic.",
  },
};

const EMPTY_FIELDS = { university: "", studentName: "", degree: "", degreeAwardedDate: "", hiddenIdentifier: "" };

export default function VerifyPage() {
  const [mode, setMode] = useState("upload"); // upload | fields
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setVerificationStatus("idle");
      setResult(null);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      setVerificationStatus("idle");
      setResult(null);
    }
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
      if (!response.ok) {
        setErrorMessage(data.error || "Verification failed");
        setVerificationStatus("error");
        return;
      }
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

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Verify Credential
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload a diploma or certificate to verify its authenticity using our AI-powered blockchain verification system.
          </p>
        </div>

        {/* Mode toggle */}
        {process.env.NEXT_PUBLIC_SHOW_MANUAL_TEST === 'true' && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => { setMode("upload"); setResult(null); setVerificationStatus("idle"); }}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${mode === "upload" ? "bg-[#043682] text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
              >
                Upload Certificate
              </button>
              <button
                onClick={() => { setMode("fields"); setResult(null); setVerificationStatus("idle"); }}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${mode === "fields" ? "bg-[#043682] text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
              >
                Manual Fields (Test)
              </button>
            </div>
          </div>
        )}

        {/* Manual fields form */}
        {mode === "fields" && (
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#043682] bg-blue-50 px-3 py-1 rounded-full">Testing Mode</span>
              <p className="text-sm text-gray-500">Skips OCR — verifies fields directly against the blockchain</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "university", label: "University", placeholder: "Western University" },
                { key: "studentName", label: "Student Name", placeholder: "Alice Johnson" },
                { key: "degree", label: "Degree", placeholder: "Bachelor of Science" },
                { key: "degreeAwardedDate", label: "Awarded Date", placeholder: "YYYY-MM-DD" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={fields[key]}
                    onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#043682] focus:border-transparent"
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cert ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="TC-XXXX-XXXX"
                  value={fields.hiddenIdentifier}
                  onChange={(e) => setFields((f) => ({ ...f, hiddenIdentifier: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#043682] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 ${mode === "fields" ? "hidden" : ""}`}>
          {/* Top Left: Upload Area */}
          <div className="flex flex-col">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-grow border-4 border-dashed rounded-[2rem] p-12 text-center transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? "border-[#043682] bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <Upload className="w-16 h-16 mb-4 text-[#043682]" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Certificate
              </h3>
              <p className="text-gray-600 mb-8">
                Drop your PDF, JPG, or PNG here
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-[#043682] text-white px-10 py-4 rounded-xl font-bold cursor-pointer transition-all hover:bg-[#032b69] hover:shadow-lg active:scale-95"
              >
                Choose File
              </label>
              {uploadedFile && (
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#043682] rounded-full text-sm font-semibold border border-blue-100">
                  <CheckCircle className="w-4 h-4" />
                  {uploadedFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Top Right: How it works */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How Verification Works
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#043682] text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <p className="font-semibold text-gray-900">OCR Text Extraction</p>
                  <p className="text-sm text-gray-600">We read the certificate fields and hidden Cert ID using Google Cloud Vision.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#043682] text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <p className="font-semibold text-gray-900">Blockchain Verification</p>
                  <p className="text-sm text-gray-600">The canonical hash is checked against the Ethereum smart contract.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#043682] text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <p className="font-semibold text-gray-900">AI Visual Analysis</p>
                  <p className="text-sm text-gray-600">An EfficientNet+DINOv2 model scores visual authenticity of the certificate body.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm font-bold shrink-0">✓</div>
                <div>
                  <p className="font-semibold text-gray-900">Combined Verdict</p>
                  <p className="text-sm text-gray-600">Both signals are combined to produce a final verdict.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left: Take a Picture */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center shrink-0">
              <Camera className="w-10 h-10 text-[#043682]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Take a picture
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                No digital file? Use your device's camera to capture a clear photo of the original certificate.
              </p>
              <button className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold transition-all hover:border-[#043682] hover:text-[#043682] active:scale-95">
                Open Camera
              </button>
            </div>
          </div>

          {/* Bottom Right: Advice Section */}
          <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-[#043682] mb-6 flex items-center gap-3">
              <AlertCircle className="w-7 h-7" />
              Pro Advice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#043682] mt-2 shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">Ensure the document is well-lit and in focus</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#043682] mt-2 shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">Include all four edges of the certificate</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#043682] mt-2 shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">Avoid strong glares or deep shadows</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#043682] mt-2 shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">Use the highest resolution available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Verify Button */}
        <div className="max-w-xl mx-auto mb-16">
          <button
            onClick={handleVerify}
            disabled={!canVerify || verificationStatus === "loading"}
            className="w-full bg-[#22c55e] text-white py-5 rounded-2xl font-bold text-2xl transition-all hover:bg-[#16a34a] hover:shadow-[0_10px_30px_rgba(34,197,94,0.3)] disabled:bg-gray-200 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {verificationStatus === "loading" ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              "Start Verification"
            )}
          </button>
        </div>

        {/* Error display */}
        {verificationStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-600 shrink-0" />
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Results Section */}
        {showResult && (
          <div className={`rounded-2xl p-10 shadow-lg border ${config.bg}`}>
            <div className="flex items-start gap-6 mb-8">
              <div className={config.color}>{config.icon}</div>
              <div className="flex-1">
                <h2 className={`text-3xl font-bold mb-3 ${config.color}`}>
                  {config.title}
                </h2>
                <p className="text-gray-700 text-lg">{config.message}</p>
              </div>
            </div>

            {/* Dual-signal detail cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* AI Score */}
              {result.aiScore !== null ? (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">AI Visual Score</p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {(result.aiScore * 100).toFixed(0)}%
                    </span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${result.aiScore >= 0.7 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {result.aiScore >= 0.7 ? 'Authentic' : 'Suspicious'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${result.aiScore >= 0.7 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${result.aiScore * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-400 italic">AI score skipped in manual test mode</p>
                </div>
              )}

              {/* Blockchain */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Blockchain Record</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {result.issuedAt ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">
                      {result.issuedAt
                        ? `Issued ${new Date(result.issuedAt).toLocaleDateString()}`
                        : 'Not found on chain'}
                    </span>
                  </div>
                  {result.revokedAt && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-700">
                        Revoked {new Date(result.revokedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {result.rsaVerified && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">RSA signature verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Credential details */}
            {result.credential && (
              <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Credential Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Institution</p>
                    <p className="font-semibold text-gray-900">{result.credential.university.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Degree</p>
                    <p className="font-semibold text-gray-900">{result.credential.degreeName}</p>
                  </div>
                  {result.credential.program && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Program</p>
                      <p className="font-semibold text-gray-900">{result.credential.program}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Awarded</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(result.credential.awardedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Canonical hash + etherscan link — only shown when on-chain */}
            {result.issuedAt && (
              <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Cryptographic Proof</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Canonical Hash (SHA-256)</p>
                    <p className="font-mono text-xs text-gray-700 break-all">{result.canonicalHash}</p>
                  </div>
                  {result.etherscanUrl && (
                    <a
                      href={result.etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#043682] text-sm font-semibold hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
            )}

            <button className="flex items-center gap-2 bg-[#043682] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:bg-[#032c68]">
              <Download className="w-5 h-5" />
              Download Verification Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
