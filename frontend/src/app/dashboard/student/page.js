"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { GraduationCap, ExternalLink, CheckCircle, XCircle, Loader2, User, Calendar, Hash } from 'lucide-react';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, credsRes] = await Promise.all([
        apiFetch('/api/students/me'),
        apiFetch('/api/students/me/credentials'),
      ]);
      if (profileRes?.ok) {
        const d = await profileRes.json();
        setStudent(d.student || d);
      }
      if (credsRes?.ok) {
        const d = await credsRes.json();
        setCredentials(d.credentials || d || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#043682] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12 pt-8">
      <div className="max-w-4xl mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#043682]">Student Portal</h1>
          <p className="text-gray-500 font-bold mt-1">Your verified academic credentials</p>
        </div>

        {/* Profile Card */}
        {student && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#043682] rounded-full flex items-center justify-center text-white font-black text-3xl shadow-md shrink-0">
                {student.fullName?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-gray-900">{student.fullName}</h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                    <User className="w-4 h-4 shrink-0" /> {student.pseudonymousId}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                    <Calendar className="w-4 h-4 shrink-0" />
                    Joined {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                    <Hash className="w-4 h-4 shrink-0" /> {student.hiddenIdentifier?.slice(0, 8)}…
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-4xl font-black text-[#043682]">{credentials.length}</p>
                <p className="text-sm font-bold text-gray-500">Credential{credentials.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Credentials */}
        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#043682]" /> Credentials
        </h2>

        {credentials.length > 0 ? (
          <div className="space-y-4">
            {credentials.map(cred => (
              <div key={cred.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#043682]/10 rounded-2xl flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-[#043682]" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{cred.degreeName}</h3>
                      {cred.program && <p className="text-gray-600 font-medium">{cred.program}</p>}
                      <div className="flex flex-wrap gap-4 mt-2">
                        {cred.university?.name && (
                          <span className="text-sm text-gray-500 font-medium">{cred.university.name}</span>
                        )}
                        <span className="text-sm text-gray-500 font-medium">
                          Awarded {cred.awardedDate ? new Date(cred.awardedDate).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {cred.revocation
                      ? <span className="inline-flex items-center gap-1.5 text-red-600 font-black text-sm"><XCircle className="w-4 h-4" /> Revoked</span>
                      : <span className="inline-flex items-center gap-1.5 text-[#22c55e] font-black text-sm"><CheckCircle className="w-4 h-4" /> Verified</span>}
                    {(cred.txHash || cred.etherscanUrl) && (
                      <a
                        href={cred.etherscanUrl || `https://sepolia.etherscan.io/tx/${cred.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#043682] font-black text-sm hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" /> View on Etherscan
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-16 text-center">
            <GraduationCap className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-400">No credentials yet</h3>
            <p className="text-gray-400 font-medium mt-2">Credentials issued by your university will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
