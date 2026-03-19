"use client";

import { useState, useEffect, useMemo, Fragment } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Search, Users, ChevronDown, ChevronUp, FileText,
  CheckCircle, XCircle, ExternalLink, Plus, Loader2
} from 'lucide-react';

export default function UniversityDashboard() {
  const [university, setUniversity] = useState(null);
  const [students, setStudents] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentCredentials, setStudentCredentials] = useState({});
  const [loadingCreds, setLoadingCreds] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [issueForm, setIssueForm] = useState({ schoolEmail: '', studentFullName: '', degreeName: '', program: '', awardedDate: '' });
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');
  const [revoking, setRevoking] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [uniRes, studentsRes, credsRes] = await Promise.all([
        apiFetch('/api/universities/me'),
        apiFetch('/api/universities/me/students'),
        apiFetch('/api/universities/me/credentials'),
      ]);
      if (uniRes?.ok) {
        const d = await uniRes.json();
        setUniversity(d.university || d);
      }
      if (studentsRes?.ok) {
        const d = await studentsRes.json();
        setStudents(Array.isArray(d) ? d : d.students || []);
      }
      if (credsRes?.ok) {
        const d = await credsRes.json();
        setCredentials(Array.isArray(d) ? d : d.credentials || []);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
    setLoading(false);
  }

  async function handleExpandStudent(studentId) {
    if (expandedStudentId === studentId) { setExpandedStudentId(null); return; }
    setExpandedStudentId(studentId);
    if (!studentCredentials[studentId]) {
      setLoadingCreds(prev => ({ ...prev, [studentId]: true }));
      const res = await apiFetch(`/api/universities/students/${studentId}/credentials`);
      if (res?.ok) {
        const d = await res.json();
        setStudentCredentials(prev => ({ ...prev, [studentId]: d.credentials || d || [] }));
      }
      setLoadingCreds(prev => ({ ...prev, [studentId]: false }));
    }
  }

  async function handleRevoke(credentialId) {
    if (!confirm('Revoke this credential? This cannot be undone.')) return;
    setRevoking(credentialId);
    const res = await apiFetch(`/api/universities/credentials/${credentialId}/revoke`, { method: 'POST' });
    if (res?.ok) {
      const patch = { revocation: { revokedAt: new Date().toISOString() }, status: 'revoked' };
      setStudentCredentials(prev => {
        const next = {};
        for (const sid in prev) {
          next[sid] = prev[sid].map(c => c.id === credentialId ? { ...c, ...patch } : c);
        }
        return next;
      });
      setCredentials(prev => prev.map(c => c.id === credentialId ? { ...c, ...patch } : c));
      showToast('Credential revoked');
    } else {
      showToast('Failed to revoke credential', 'error');
    }
    setRevoking(null);
  }

  async function handleIssue(e) {
    e.preventDefault();
    setIssuing(true);
    setIssueError('');
    const res = await apiFetch('/api/universities/credentials', {
      method: 'POST',
      body: JSON.stringify(issueForm),
    });
    if (res?.ok) {
      setShowIssueDialog(false);
      setIssueForm({ schoolEmail: '', studentFullName: '', degreeName: '', program: '', awardedDate: '' });
      showToast('Credential issued successfully');
      const r = await apiFetch('/api/universities/me/credentials');
      if (r?.ok) { const d = await r.json(); setCredentials(d.credentials || d || []); }
    } else {
      const err = await res?.json().catch(() => ({}));
      setIssueError(err?.error || 'Failed to issue credential');
    }
    setIssuing(false);
  }

  const filteredStudents = useMemo(() =>
    students.filter(s =>
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pseudonymousId?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm]);

  if (loading) return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#043682] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12 pt-8">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-2xl font-bold shadow-lg text-white transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#22c55e]'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#043682]">{university?.name || 'University Dashboard'}</h1>
            <p className="text-gray-500 font-bold mt-1">{university?.domain}</p>
          </div>
          <button
            onClick={() => setShowIssueDialog(true)}
            className="flex items-center gap-2 bg-[#043682] text-white px-6 py-3 rounded-2xl font-black hover:bg-[#032b69] transition-all shadow-md"
          >
            <Plus className="w-5 h-5" /> Issue Credential
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 w-fit shadow-sm border border-gray-200">
          {[
            { id: 'students', label: 'Students', count: students.length },
            { id: 'credentials', label: 'Credentials', count: credentials.length },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === id ? 'bg-[#043682] text-white shadow-sm' : 'text-gray-600 hover:text-[#043682]'}`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-200 mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                      <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Student</th>
                      <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Email</th>
                      <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Joined</th>
                      <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest text-right">Credentials</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.length > 0 ? filteredStudents.map(student => (
                      <Fragment key={student.id}>
                        <tr
                          onClick={() => handleExpandStudent(student.id)}
                          className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#043682] rounded-full flex items-center justify-center text-white font-black shrink-0">
                                {student.fullName?.charAt(0) || '?'}
                              </div>
                              <span className="font-black text-gray-900">{student.fullName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-gray-600 font-medium">{student.pseudonymousId}</td>
                          <td className="px-8 py-5 text-gray-600 font-medium">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-8 py-5 text-right">
                            {expandedStudentId === student.id
                              ? <ChevronUp className="w-5 h-5 text-[#043682] ml-auto" />
                              : <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />}
                          </td>
                        </tr>
                        {expandedStudentId === student.id && (
                          <tr key={`${student.id}-exp`}>
                            <td colSpan={4} className="px-8 py-6 bg-blue-50/30">
                              {loadingCreds[student.id] ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-[#043682]" />
                                </div>
                              ) : (
                                <CredentialList
                                  credentials={studentCredentials[student.id] || []}
                                  onRevoke={handleRevoke}
                                  revoking={revoking}
                                />
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center">
                          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                          <p className="font-black text-gray-400">No students found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm font-bold text-gray-500">
                  Total: {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Degree</th>
                    <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Student</th>
                    <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Awarded</th>
                    <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {credentials.length > 0 ? credentials.map(cred => (
                    <tr key={cred.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-900">{cred.degreeName}</p>
                        {cred.program && <p className="text-sm text-gray-500 font-medium">{cred.program}</p>}
                      </td>
                      <td className="px-8 py-5 font-medium text-gray-700">{cred.student?.fullName || '—'}</td>
                      <td className="px-8 py-5 text-gray-600 font-medium">
                        {cred.awardedDate ? new Date(cred.awardedDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-8 py-5">
                        {cred.revocation
                          ? <span className="inline-flex items-center gap-1.5 text-red-600 font-black text-sm"><XCircle className="w-4 h-4" /> Revoked</span>
                          : <span className="inline-flex items-center gap-1.5 text-[#22c55e] font-black text-sm"><CheckCircle className="w-4 h-4" /> Active</span>}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {cred.txHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${cred.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#043682] hover:text-[#032b69]"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {!cred.revocation && (
                            <button
                              onClick={() => handleRevoke(cred.id)}
                              disabled={revoking === cred.id}
                              className="text-sm font-black text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              {revoking === cred.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center">
                        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="font-black text-gray-400">No credentials issued yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Issue Credential Dialog */}
      {showIssueDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8">
            <h2 className="text-2xl font-black text-[#043682] mb-6">Issue Credential</h2>
            <form onSubmit={handleIssue} className="space-y-4">
              {[
                { label: 'Student Email', key: 'schoolEmail', type: 'email', placeholder: `student@${university?.domain || 'university.edu'}` },
                { label: 'Student Full Name', key: 'studentFullName', type: 'text', placeholder: 'Jane Doe' },
                { label: 'Degree Name', key: 'degreeName', type: 'text', placeholder: 'Bachelor of Science' },
                { label: 'Program', key: 'program', type: 'text', placeholder: 'Computer Science' },
                { label: 'Awarded Date', key: 'awardedDate', type: 'date', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest block mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={issueForm[key]}
                    onChange={e => setIssueForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all font-medium"
                  />
                </div>
              ))}
              {issueError && <p className="text-red-500 font-bold text-sm">{issueError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowIssueDialog(false); setIssueError(''); }}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-black text-gray-600 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="flex-1 py-3 bg-[#043682] text-white rounded-2xl font-black hover:bg-[#032b69] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {issuing ? <><Loader2 className="w-4 h-4 animate-spin" /> Issuing…</> : 'Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CredentialList({ credentials, onRevoke, revoking }) {
  if (credentials.length === 0) return (
    <p className="text-gray-400 font-bold text-center py-4">No credentials issued</p>
  );
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black text-[#043682] uppercase tracking-widest flex items-center gap-2">
        <FileText className="w-4 h-4" /> Credentials ({credentials.length})
      </h3>
      {credentials.map(cred => (
        <div key={cred.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <div>
            <p className="font-black text-gray-900">{cred.degreeName}</p>
            {cred.program && <p className="text-sm text-gray-500 font-medium">{cred.program}</p>}
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Awarded: {cred.awardedDate ? new Date(cred.awardedDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {cred.txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${cred.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#043682] hover:text-[#032b69]"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {(cred.revocation || cred.status === 'revoked') ? (
              <span className="text-sm font-black text-red-500 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Revoked
              </span>
            ) : (
              <>
                <span className="text-sm font-black text-[#22c55e] flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Active
                </span>
                <button
                  onClick={() => onRevoke(cred.id)}
                  disabled={revoking === cred.id}
                  className="text-xs font-black text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {revoking === cred.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Revoke'}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
