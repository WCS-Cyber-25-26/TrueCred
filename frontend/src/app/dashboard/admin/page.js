"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import dynamic from 'next/dynamic';
import {
  Building2, Plus, XCircle, CheckCircle, Loader2, Globe, ShieldX,
  Link2, Copy, ExternalLink, ChevronRight, X, Cpu, AlertCircle, Zap,
} from 'lucide-react';

const BlockchainGraph = dynamic(
  () => import('@/app/components/ui/BlockchainGraph'),
  { ssr: false }
);

function etherscanAddr(addr) {
  return `https://sepolia.etherscan.io/address/${addr}`;
}
function etherscanTx(tx) {
  return `https://sepolia.etherscan.io/tx/${tx}`;
}

export default function AdminDashboard() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', domain: '', email: '' });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [revoking, setRevoking] = useState(null);
  const [enablingChain, setEnablingChain] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => { loadUniversities(); }, []);

  async function loadUniversities() {
    setLoading(true);
    const res = await apiFetch('/api/admin/universities');
    if (res?.ok) {
      const d = await res.json();
      setUniversities(d || []);
    }
    setLoading(false);
  }

  async function openDetail(uni) {
    setSelectedUniversity({ ...uni });
    setDetailLoading(true);
    const res = await apiFetch(`/api/admin/universities/${uni.id}`);
    if (res?.ok) {
      const d = await res.json();
      setSelectedUniversity(d);
    }
    setDetailLoading(false);
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    setInviteError('');

    const res = await apiFetch('/api/admin/universities/invite', {
      method: 'POST',
      body: JSON.stringify(inviteForm),
    });

    if (res?.ok) {
      const data = await res.json();
      setShowInviteDialog(false);
      setInviteForm({ name: '', domain: '', email: '' });
      loadUniversities();

      if (data.token) {
        const link = `http://localhost:3000/universities/activate?token=${data.token}`;
        await navigator.clipboard.writeText(link);
        showToast('Invite sent — activation link copied to clipboard');
      } else {
        showToast('Invitation sent successfully');
      }
    } else {
      const err = await res?.json().catch(() => ({}));
      setInviteError(err?.error || 'Failed to send invitation');
    }

    setInviting(false);
  }

  async function handleRevoke(universityId) {
    if (!confirm("Revoke this university's access? They will no longer be able to issue credentials.")) return;
    setRevoking(universityId);
    const res = await apiFetch(`/api/admin/universities/${universityId}/revoke`, { method: 'POST' });
    if (res?.ok) {
      showToast('University revoked');
      loadUniversities();
      if (selectedUniversity?.id === universityId) {
        setSelectedUniversity(prev => ({ ...prev, revocation: { revokedAt: new Date().toISOString() } }));
      }
    } else {
      showToast('Failed to revoke university', 'error');
    }
    setRevoking(null);
  }

  async function handleEnableChain(universityId) {
    setEnablingChain(universityId);
    const res = await apiFetch(`/api/admin/universities/${universityId}/enable-chain`, { method: 'POST' });
    if (res?.ok) {
      const d = await res.json();
      showToast('Blockchain enabled');
      loadUniversities();
      if (selectedUniversity?.id === universityId) {
        setSelectedUniversity(prev => ({ ...prev, chainEnabled: true, blockchainId: d.blockchainId }));
      }
    } else {
      const err = await res?.json().catch(() => ({}));
      showToast(err?.error || 'Failed to enable blockchain', 'error');
    }
    setEnablingChain(null);
  }

  function copyAddr(addr) {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  }

  const stats = [
    { label: 'Total', value: universities.length, icon: Building2 },
    { label: 'Active', value: universities.filter(u => !u.revocation).length, icon: CheckCircle },
    { label: 'Revoked', value: universities.filter(u => u.revocation).length, icon: XCircle },
    { label: 'On-Chain', value: universities.filter(u => u.chainEnabled).length, icon: Cpu },
  ];

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
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold border`}
          style={toast.type === 'error'
            ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
            : { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-8">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              Manage universities and platform access
            </p>
          </div>
          <button
            onClick={() => setShowInviteDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#2563eb' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >
            <Plus className="w-4 h-4" /> Invite University
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              className="rounded-xl p-5"
              style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.2)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: 'easeOut' }}
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
            </motion.div>
          ))}
        </div>

        {/* Blockchain Network Visualization */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Network Graph
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                Live blockchain structure
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#1e40af', border: '1px solid rgba(59,130,246,0.6)' }} />
                On-chain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                Off-chain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#3f0f0f', border: '1px solid rgba(239,68,68,0.5)' }} />
                Revoked
              </span>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(37,99,235,0.2)' }}>
            {universities.length === 0 ? (
              <div className="flex items-center justify-center py-20" style={{ background: '#020817' }}>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No universities to display</p>
              </div>
            ) : (
              <BlockchainGraph universities={universities} />
            )}
          </div>
        </motion.div>

        {/* Universities Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }}
          className="rounded-xl overflow-hidden"
          style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.2)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(37,99,235,0.2)', background: '#0d1f3c' }}>
                  {['University', 'Domain', 'Verification', 'Chain', 'Status', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#60a5fa' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {universities.length > 0 ? universities.map(uni => (
                  <tr
                    key={uni.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => openDetail(uni)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)' }}
                        >
                          <Building2 className="w-4 h-4" style={{ color: '#60a5fa' }} />
                        </div>
                        <span className="text-sm font-semibold text-white">{uni.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: '#94a3b8' }}>
                        <Globe className="w-3.5 h-3.5" /> {uni.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {uni.domainVerified
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#22c55e' }}><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                        : <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Unverified</span>}
                    </td>
                    <td className="px-6 py-4">
                      {uni.chainEnabled
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#60a5fa' }}><Cpu className="w-3.5 h-3.5" /> On-chain</span>
                        : <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Off-chain</span>}
                    </td>
                    <td className="px-6 py-4">
                      {uni.revocation
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#ef4444' }}><XCircle className="w-3.5 h-3.5" /> Revoked</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#22c55e' }}><CheckCircle className="w-3.5 h-3.5" /> Active</span>}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-4">
                        {!uni.chainEnabled && !uni.revocation && uni.domainVerified && (
                          <button
                            onClick={() => handleEnableChain(uni.id)}
                            disabled={enablingChain === uni.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold transition-colors disabled:opacity-40"
                            style={{ color: '#60a5fa' }}
                          >
                            {enablingChain === uni.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <><Zap className="w-3.5 h-3.5" /> Enable Chain</>}
                          </button>
                        )}
                        {!uni.revocation && (
                          <button
                            onClick={() => handleRevoke(uni.id)}
                            disabled={revoking === uni.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold transition-colors disabled:opacity-40"
                            style={{ color: '#ef4444' }}
                          >
                            {revoking === uni.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <><ShieldX className="w-3.5 h-3.5" /> Revoke</>}
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(37,99,235,0.2)' }} />
                      <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>No universities yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* University Detail Drawer */}
      {selectedUniversity && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelectedUniversity(null)} />
          <div
            className="w-full max-w-lg h-full overflow-y-auto flex flex-col"
            style={{ background: '#0a1628', borderLeft: '1px solid rgba(37,99,235,0.2)' }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
              style={{ background: '#0a1628', borderBottom: '1px solid rgba(37,99,235,0.15)' }}
            >
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {selectedUniversity.name}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{selectedUniversity.domain}</p>
              </div>
              <button
                onClick={() => setSelectedUniversity(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#60a5fa' }} />
              </div>
            ) : (
              <div className="px-6 py-6 space-y-6 flex-1">

                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedUniversity.revocation
                    ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}><XCircle className="w-3 h-3" /> Revoked</span>
                    : <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}><CheckCircle className="w-3 h-3" /> Active</span>}
                  {selectedUniversity.domainVerified
                    ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: '#60a5fa' }}><CheckCircle className="w-3 h-3" /> Domain Verified</span>
                    : <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}><AlertCircle className="w-3 h-3" /> Unverified</span>}
                  {selectedUniversity.chainEnabled
                    ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: '#60a5fa' }}><Cpu className="w-3 h-3" /> On-chain</span>
                    : <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}><Cpu className="w-3 h-3" /> Off-chain</span>}
                </div>

                {/* Blockchain section */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Blockchain</p>
                  <div className="rounded-xl p-4 space-y-4" style={{ background: '#0d1f3c', border: '1px solid rgba(37,99,235,0.2)' }}>
                    {selectedUniversity.blockchainId ? (
                      <>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Wallet Address</p>
                          <div className="flex items-center gap-2">
                            <code
                              className="text-xs font-mono flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 rounded-lg"
                              style={{ background: '#020817', border: '1px solid rgba(37,99,235,0.2)', color: '#60a5fa' }}
                            >
                              {selectedUniversity.blockchainId}
                            </code>
                            <button
                              onClick={() => copyAddr(selectedUniversity.blockchainId)}
                              className="p-2 rounded-lg transition-colors shrink-0"
                              style={{ color: '#94a3b8' }}
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={etherscanAddr(selectedUniversity.blockchainId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg transition-colors shrink-0"
                              style={{ color: '#94a3b8' }}
                              title="Etherscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          {copiedAddr && <p className="text-xs mt-1" style={{ color: '#4ade80' }}>Copied</p>}
                        </div>

                        {selectedUniversity.stats && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Credentials On-Chain</p>
                              <span className="text-xs font-semibold" style={{ color: '#60a5fa' }}>
                                {selectedUniversity.stats.onChainCredentials} / {selectedUniversity.stats.totalCredentials}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(37,99,235,0.15)' }}>
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: selectedUniversity.stats.totalCredentials > 0
                                    ? `${(selectedUniversity.stats.onChainCredentials / selectedUniversity.stats.totalCredentials) * 100}%`
                                    : '0%',
                                  background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
                                }}
                              />
                            </div>
                            <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              {selectedUniversity.stats.totalCredentials - selectedUniversity.stats.onChainCredentials} off-chain
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <Cpu className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(37,99,235,0.2)' }} />
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>No wallet generated yet</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>University must log in first</p>
                      </div>
                    )}

                    {!selectedUniversity.chainEnabled && !selectedUniversity.revocation && selectedUniversity.blockchainId && !selectedUniversity.domainVerified && (
                      <p className="text-xs text-center py-2" style={{ color: '#fbbf24' }}>
                        Domain must be verified before enabling on-chain issuance
                      </p>
                    )}
                    {!selectedUniversity.chainEnabled && !selectedUniversity.revocation && selectedUniversity.blockchainId && selectedUniversity.domainVerified && (
                      <button
                        onClick={() => handleEnableChain(selectedUniversity.id)}
                        disabled={enablingChain === selectedUniversity.id}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: '#2563eb' }}
                        onMouseEnter={e => !enablingChain && (e.currentTarget.style.background = '#1d4ed8')}
                        onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                      >
                        {enablingChain === selectedUniversity.id
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enabling…</>
                          : <><Zap className="w-4 h-4" /> Enable On-Chain Issuance</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Recent credentials */}
                {selectedUniversity.credentials?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Recent Credentials</p>
                    <div className="space-y-2">
                      {selectedUniversity.credentials.map(cred => (
                        <div
                          key={cred.id}
                          className="flex items-center justify-between px-4 py-3 rounded-xl"
                          style={{ background: '#0d1f3c', border: '1px solid rgba(37,99,235,0.15)' }}
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">{cred.degreeName}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{cred.student?.fullName}</p>
                          </div>
                          {cred.txHash ? (
                            <a
                              href={etherscanTx(cred.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold shrink-0 ml-3"
                              style={{ color: '#60a5fa' }}
                            >
                              <Link2 className="w-3 h-3" />
                              {cred.txHash.slice(0, 6)}…{cred.txHash.slice(-4)}
                            </a>
                          ) : (
                            <span className="text-xs shrink-0 ml-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Off-chain</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revocation */}
                {selectedUniversity.revocation ? (
                  <div className="rounded-xl px-4 py-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="text-sm font-semibold" style={{ color: '#f87171' }}>Access Revoked</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(248,113,113,0.6)' }}>
                      {new Date(selectedUniversity.revocation.revokedAt).toLocaleDateString()}
                      {selectedUniversity.revocation.reason ? ` — ${selectedUniversity.revocation.reason}` : ''}
                    </p>
                  </div>
                ) : (
                  <div className="pt-4" style={{ borderTop: '1px solid rgba(37,99,235,0.15)' }}>
                    <button
                      onClick={() => handleRevoke(selectedUniversity.id)}
                      disabled={revoking === selectedUniversity.id}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {revoking === selectedUniversity.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Revoking…</>
                        : <><ShieldX className="w-4 h-4" /> Revoke University Access</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0a1628', border: '1px solid rgba(37,99,235,0.25)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Invite University
              </h2>
              <button
                onClick={() => { setShowInviteDialog(false); setInviteError(''); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              {[
                { label: 'University Name', key: 'name', type: 'text', placeholder: 'Westerrn University' },
                { label: 'Domain', key: 'domain', type: 'text', placeholder: 'uwo.ca' },
                { label: 'Admin Email', key: 'email', type: 'email', placeholder: 'admin@uwo.ca' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#60a5fa' }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={inviteForm[key]}
                    onChange={e => setInviteForm(prev => ({ ...prev, [key]: e.target.value }))}
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

              {inviteError && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>{inviteError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInviteDialog(false); setInviteError(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#2563eb' }}
                  onMouseEnter={e => !inviting && (e.currentTarget.style.background = '#1d4ed8')}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                >
                  {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
