"use client";

import { useState, useEffect, useMemo, Fragment } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Search, Users, ChevronDown, ChevronUp, FileText,
  CheckCircle, XCircle, ExternalLink, Plus, Loader2, X,
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#020817' }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#60a5fa' }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-12 pt-8" style={{ background: '#020817', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold"
          style={toast.type === 'error'
            ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
            : { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {university?.name || 'University Dashboard'}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              {university?.domain || 'Manage students and credentials'}
            </p>
          </div>
          <button
            onClick={() => setShowIssueDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#2563eb' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >
            <Plus className="w-4 h-4" /> Issue Credential
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Students', value: students.length, icon: Users },
            { label: 'Total Credentials', value: credentials.length, icon: FileText },
            { label: 'Revoked', value: credentials.filter(c => c.revocation || c.status === 'revoked').length, icon: XCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl p-5"
              style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.2)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#60a5fa' }}>
                    {label}
                  </p>
                  <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {value}
                  </p>
                </div>
                <Icon className="w-5 h-5 mt-1" style={{ color: 'rgba(96,165,250,0.4)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#0d1f3c', border: '1px solid rgba(37,99,235,0.2)' }}>
            {[
              { id: 'students', label: 'Students', count: students.length },
              { id: 'credentials', label: 'Credentials', count: credentials.length },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === id ? 'text-white' : 'text-[#64748b] hover:text-white'
                }`}
                style={activeTab === id ? { background: '#2563eb' } : {}}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Search — students tab only */}
          {activeTab === 'students' && (
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.2)', color: 'white' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.2)'}
              />
            </div>
          )}
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.2)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(37,99,235,0.2)', background: '#0d1f3c' }}>
                    {['Student', 'Pseudonymous ID', 'Joined', ''].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#60a5fa' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? filteredStudents.map(student => (
                    <Fragment key={student.id}>
                      <tr
                        onClick={() => handleExpandStudent(student.id)}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', color: '#60a5fa' }}
                            >
                              {student.fullName?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm font-semibold text-white">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono" style={{ color: '#94a3b8' }}>{student.pseudonymousId}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#94a3b8' }}>
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {expandedStudentId === student.id
                            ? <ChevronUp className="w-4 h-4 ml-auto" style={{ color: '#60a5fa' }} />
                            : <ChevronDown className="w-4 h-4 ml-auto" style={{ color: 'rgba(255,255,255,0.2)' }} />}
                        </td>
                      </tr>
                      {expandedStudentId === student.id && (
                        <tr key={`${student.id}-exp`}>
                          <td colSpan={4} className="px-6 py-5" style={{ background: 'rgba(37,99,235,0.04)', borderTop: '1px solid rgba(37,99,235,0.1)' }}>
                            {loadingCreds[student.id] ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#60a5fa' }} />
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
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(37,99,235,0.2)' }} />
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>No students found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3" style={{ background: '#0d1f3c', borderTop: '1px solid rgba(37,99,235,0.15)' }}>
              <p className="text-xs font-medium" style={{ color: '#475569' }}>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.2)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(37,99,235,0.2)', background: '#0d1f3c' }}>
                    {['Degree', 'Student', 'Awarded', 'Status', ''].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#60a5fa' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {credentials.length > 0 ? credentials.map(cred => (
                    <tr
                      key={cred.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">{cred.degreeName}</p>
                        {cred.program && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{cred.program}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#94a3b8' }}>{cred.student?.fullName || '—'}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#94a3b8' }}>
                        {cred.awardedDate ? new Date(cred.awardedDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {cred.revocation
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#ef4444' }}><XCircle className="w-3.5 h-3.5" /> Revoked</span>
                          : <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#22c55e' }}><CheckCircle className="w-3.5 h-3.5" /> Active</span>}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-4">
                          {cred.txHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${cred.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold"
                              style={{ color: '#60a5fa' }}
                              title="View on Etherscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {!cred.revocation && (
                            <button
                              onClick={() => handleRevoke(cred.id)}
                              disabled={revoking === cred.id}
                              className="inline-flex items-center gap-1 text-xs font-semibold transition-colors disabled:opacity-40"
                              style={{ color: '#ef4444' }}
                            >
                              {revoking === cred.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Revoke'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(37,99,235,0.2)' }} />
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>No credentials issued yet</p>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.25)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Issue Credential
              </h2>
              <button
                onClick={() => { setShowIssueDialog(false); setIssueError(''); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssue} className="space-y-4">
              {[
                { label: 'Student Email', key: 'schoolEmail', type: 'email', placeholder: `student@${university?.domain || 'university.edu'}` },
                { label: 'Student Full Name', key: 'studentFullName', type: 'text', placeholder: 'Jane Doe' },
                { label: 'Degree Name', key: 'degreeName', type: 'text', placeholder: 'Bachelor of Science' },
                { label: 'Program', key: 'program', type: 'text', placeholder: 'Computer Science' },
                { label: 'Awarded Date', key: 'awardedDate', type: 'date', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#60a5fa' }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={issueForm[key]}
                    onChange={e => setIssueForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                    style={{
                      background: '#0d1f3c',
                      border: '1px solid rgba(37,99,235,0.25)',
                      fontFamily: "'DM Sans', sans-serif",
                      color: 'white',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.25)'}
                  />
                </div>
              ))}

              {issueError && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>{issueError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowIssueDialog(false); setIssueError(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#2563eb' }}
                  onMouseEnter={e => !issuing && (e.currentTarget.style.background = '#1d4ed8')}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
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
    <p className="text-sm text-center py-4 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>No credentials issued</p>
  );
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: '#60a5fa' }}>
        <FileText className="w-3.5 h-3.5" /> Credentials ({credentials.length})
      </h3>
      {credentials.map(cred => (
        <div
          key={cred.id}
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: '#0d1f3c', border: '1px solid rgba(37,99,235,0.15)' }}
        >
          <div>
            <p className="text-sm font-semibold text-white">{cred.degreeName}</p>
            {cred.program && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{cred.program}</p>}
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {cred.awardedDate ? new Date(cred.awardedDate).toLocaleDateString() : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {cred.revocation ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#ef4444' }}>
                <XCircle className="w-3.5 h-3.5" /> Revoked
              </span>
            ) : (
              <>
                {cred.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${cred.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#60a5fa' }}
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => onRevoke(cred.id)}
                  disabled={revoking === cred.id}
                  className="text-xs font-semibold transition-colors disabled:opacity-40"
                  style={{ color: '#ef4444' }}
                >
                  {revoking === cred.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Revoke'}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
