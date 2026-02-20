'use client'

import { useState } from "react";
import { Upload, Camera, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";

export default function VerifyPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [institutionName, setInstitutionName] = useState("");
  const [graduateName, setGraduateName] = useState("");
  const [dateIssued, setDateIssued] = useState("");

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
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleVerify = () => {
    if (!uploadedFile) return;
    
    setVerificationStatus("loading");
    
    // Simulate verification process
    setTimeout(() => {
      const results = ["verified", "notVerified", "suspicious"];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      setVerificationStatus(randomResult);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-[#22c55e]";
      case "notVerified":
        return "text-red-600";
      case "suspicious":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-16 h-16" />;
      case "notVerified":
        return <XCircle className="w-16 h-16" />;
      case "suspicious":
        return <AlertCircle className="w-16 h-16" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "verified":
        return "Certificate Verified";
      case "notVerified":
        return "Certificate Not Found";
      case "suspicious":
        return "Certificate Suspicious";
      default:
        return "";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "verified":
        return "This certificate has been verified against our blockchain database. All details match university records.";
      case "notVerified":
        return "This certificate was not found in the university database. It may be fraudulent or from an unregistered institution.";
      case "suspicious":
        return "This certificate shows signs of tampering or forgery. AI analysis detected inconsistencies. Manual review recommended.";
      default:
        return "";
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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

          {/* Top Right: Credential Information */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Credential Information
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Western University"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">
                  Graduate Name
                </label>
                <input
                  type="text"
                  value={graduateName}
                  onChange={(e) => setGraduateName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">
                  Date Issued
                </label>
                <input
                  type="date"
                  value={dateIssued}
                  onChange={(e) => setDateIssued(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all"
                />
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
            disabled={!uploadedFile || verificationStatus === "loading"}
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

        {/* Results Section */}
        {verificationStatus !== "idle" && verificationStatus !== "loading" && (
          <div className="bg-white rounded-2xl p-10 shadow-lg">
            <div className="flex items-start gap-6">
              <div className={getStatusColor(verificationStatus)}>
                {getStatusIcon(verificationStatus)}
              </div>
              <div className="flex-1">
                <h2 className={`text-3xl font-bold mb-3 ${getStatusColor(verificationStatus)}`}>
                  {getStatusText(verificationStatus)}
                </h2>
                <p className="text-gray-700 text-lg mb-6">
                  {getStatusMessage(verificationStatus)}
                </p>

                {verificationStatus === "verified" && (
                  <div className="space-y-4 bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Institution</p>
                        <p className="font-semibold text-gray-900">
                          {institutionName || "Stanford University"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Graduate</p>
                        <p className="font-semibold text-gray-900">
                          {graduateName || "Jane Smith"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Verification Timestamp</p>
                        <p className="font-semibold text-gray-900">
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Blockchain Hash</p>
                        <p className="font-mono text-sm text-gray-900 truncate">
                          0x7d4f3a9b2e1c...8f6d2a
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button className="flex items-center gap-2 bg-[#043682] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:bg-[#032c68]">
                  <Download className="w-5 h-5" />
                  Download Verification Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}