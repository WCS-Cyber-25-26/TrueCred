"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Building2, Plus, XCircle, CheckCircle, Loader2, Globe, ShieldX,
  Link2, Copy, ExternalLink, ChevronRight, X, Cpu, AlertCircle, Zap,
} from 'lucide-react';

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
      setShowInviteDialog(false);
      setInviteForm({ name: '', domain: '', email: '' });
      showToast('Invitation sent successfully');
      loadUniversities();
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
    { label: 'Total', value: universities.length, icon: Building2, color: 'text-[#043682]' },
    { label: 'Active', value: universities.filter(u => !u.revocation).length, icon: CheckCircle, color: 'text-[#22c55e]' },
    { label: 'Revoked', value: universities.filter(u => u.revocation).length, icon: XCircle, color: 'text-red-500' },
    { label: 'On-Chain', value: universities.filter(u => u.chainEnabled).length, icon: Cpu, color: 'text-purple-500' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#043682] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12 pt-8">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-2xl font-bold shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#22c55e]'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#043682]">Admin Dashboard</h1>
            <p className="text-gray-500 font-bold mt-1">Manage universities and platform access</p>
          </div>
          <button
            onClick={() => setShowInviteDialog(true)}
            className="flex items-center gap-2 bg-[#043682] text-white px-6 py-3 rounded-2xl font-black hover:bg-[#032b69] transition-all shadow-md"
          >
            <Plus className="w-5 h-5" /> Invite University
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</p>
                  <p className={`text-4xl font-black mt-1 ${color}`}>{value}</p>
                </div>
                <Icon className={`w-10 h-10 ${color} opacity-20`} />
              </div>
            </div>
          ))}
        </div>

        {/* Universities Table */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">University</th>
                  <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Domain</th>
                  <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Verification</th>
                  <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Chain</th>
                  <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-[#043682] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {universities.length > 0 ? universities.map(uni => (
                  <tr
                    key={uni.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openDetail(uni)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#043682]/10 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-[#043682]" />
                        </div>
                        <span className="font-black text-gray-900">{uni.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Globe className="w-4 h-4" /> {uni.domain}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {uni.domainVerified
                        ? <span className="inline-flex items-center gap-1 text-[#22c55e] font-black text-sm"><CheckCircle className="w-4 h-4" /> Verified</span>
                        : <span className="text-gray-400 font-bold text-sm">Unverified</span>}
                    </td>
                    <td className="px-8 py-5">
                      {uni.chainEnabled
                        ? <span className="inline-flex items-center gap-1 text-purple-600 font-black text-sm"><Cpu className="w-4 h-4" /> Enabled</span>
                        : <span className="text-gray-400 font-bold text-sm">Off-chain</span>}
                    </td>
                    <td className="px-8 py-5">
                      {uni.revocation
                        ? <span className="inline-flex items-center gap-1 text-red-600 font-black text-sm"><XCircle className="w-4 h-4" /> Revoked</span>
                        : <span className="inline-flex items-center gap-1 text-[#22c55e] font-black text-sm"><CheckCircle className="w-4 h-4" /> Active</span>}
                    </td>
                    <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        {!uni.chainEnabled && !uni.revocation && uni.domainVerified && (
                          <button
                            onClick={() => handleEnableChain(uni.id)}
                            disabled={enablingChain === uni.id}
                            className="inline-flex items-center gap-1 text-sm font-black text-purple-500 hover:text-purple-700 transition-colors disabled:opacity-50"
                          >
                            {enablingChain === uni.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <><Zap className="w-4 h-4" /> Enable Chain</>}
                          </button>
                        )}
                        {!uni.revocation && (
                          <button
                            onClick={() => handleRevoke(uni.id)}
                            disabled={revoking === uni.id}
                            className="inline-flex items-center gap-1 text-sm font-black text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {revoking === uni.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <><ShieldX className="w-4 h-4" /> Revoke</>}
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="font-black text-gray-400">No universities yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* University Detail Drawer */}
      {selectedUniversity && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelectedUniversity(null)} />
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-black text-[#043682]">{selectedUniversity.name}</h2>
                <p className="text-gray-500 font-medium text-sm mt-0.5">{selectedUniversity.domain}</p>
              </div>
              <button onClick={() => setSelectedUniversity(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#043682] animate-spin" />
              </div>
            ) : (
              <div className="px-8 py-6 space-y-8 flex-1">
                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedUniversity.revocation
                    ? <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 font-black text-xs px-3 py-1.5 rounded-full"><XCircle className="w-3.5 h-3.5" /> Revoked</span>
                    : <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 font-black text-xs px-3 py-1.5 rounded-full"><CheckCircle className="w-3.5 h-3.5" /> Active</span>}
                  {selectedUniversity.domainVerified
                    ? <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#043682] font-black text-xs px-3 py-1.5 rounded-full"><CheckCircle className="w-3.5 h-3.5" /> Domain Verified</span>
                    : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 font-black text-xs px-3 py-1.5 rounded-full"><AlertCircle className="w-3.5 h-3.5" /> Unverified</span>}
                  {selectedUniversity.chainEnabled
                    ? <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 font-black text-xs px-3 py-1.5 rounded-full"><Cpu className="w-3.5 h-3.5" /> Chain Enabled</span>
                    : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 font-black text-xs px-3 py-1.5 rounded-full"><Cpu className="w-3.5 h-3.5" /> Off-chain</span>}
                </div>

                {/* Blockchain section */}
                <div>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Blockchain</h3>
                  <div className="bg-[#f8fafc] rounded-2xl border border-gray-200 p-5 space-y-5">
                    {selectedUniversity.blockchainId ? (
                      <>
                        {/* Wallet address */}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Wallet Address</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono font-bold text-[#043682] bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                              {selectedUniversity.blockchainId}
                            </code>
                            <button
                              onClick={() => copyAddr(selectedUniversity.blockchainId)}
                              className="p-2 rounded-xl hover:bg-gray-200 transition-colors shrink-0"
                              title="Copy address"
                            >
                              <Copy className="w-4 h-4 text-gray-500" />
                            </button>
                            <a
                              href={etherscanAddr(selectedUniversity.blockchainId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl hover:bg-gray-200 transition-colors shrink-0"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </a>
                          </div>
                          {copiedAddr && <p className="text-xs text-green-600 font-bold mt-1">Copied!</p>}
                        </div>

                        {/* On-chain credential progress */}
                        {selectedUniversity.stats && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Credentials Anchored On-Chain</p>
                              <span className="text-xs font-black text-[#043682]">
                                {selectedUniversity.stats.onChainCredentials} / {selectedUniversity.stats.totalCredentials}
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-2.5 bg-gradient-to-r from-purple-500 to-[#043682] rounded-full transition-all"
                                style={{
                                  width: selectedUniversity.stats.totalCredentials > 0
                                    ? `${(selectedUniversity.stats.onChainCredentials / selectedUniversity.stats.totalCredentials) * 100}%`
                                    : '0%'
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 font-medium mt-1">
                              {selectedUniversity.stats.totalCredentials - selectedUniversity.stats.onChainCredentials} off-chain
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Cpu className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm font-black text-gray-400">No wallet generated yet</p>
                        <p className="text-xs text-gray-400 mt-1">University must log in first</p>
                      </div>
                    )}

                    {/* Enable chain button */}
                    {!selectedUniversity.chainEnabled && !selectedUniversity.revocation && selectedUniversity.blockchainId && !selectedUniversity.domainVerified && (
                      <p className="text-xs text-amber-600 font-bold text-center py-2">
                        Domain must be verified before enabling on-chain issuance
                      </p>
                    )}
                    {!selectedUniversity.chainEnabled && !selectedUniversity.revocation && selectedUniversity.blockchainId && selectedUniversity.domainVerified && (
                      <button
                        onClick={() => handleEnableChain(selectedUniversity.id)}
                        disabled={enablingChain === selectedUniversity.id}
                        className="w-full py-3 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Recent Credentials</h3>
                    <div className="space-y-2">
                      {selectedUniversity.credentials.map(cred => (
                        <div key={cred.id} className="flex items-center justify-between bg-[#f8fafc] border border-gray-200 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-sm font-black text-gray-800">{cred.degreeName}</p>
                            <p className="text-xs text-gray-400 font-medium">{cred.student?.fullName}</p>
                          </div>
                          {cred.txHash ? (
                            <a
                              href={etherscanTx(cred.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-black text-purple-600 hover:text-purple-800 shrink-0 ml-3"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              {cred.txHash.slice(0, 6)}…{cred.txHash.slice(-4)}
                            </a>
                          ) : (
                            <span className="text-xs font-bold text-gray-400 shrink-0 ml-3">Off-chain</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revocation info / revoke button */}
                {selectedUniversity.revocation ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                    <p className="text-sm font-black text-red-600 mb-1">Access Revoked</p>
                    <p className="text-xs text-red-400 font-medium">
                      {new Date(selectedUniversity.revocation.revokedAt).toLocaleDateString()}
                      {selectedUniversity.revocation.reason ? ` — ${selectedUniversity.revocation.reason}` : ''}
                    </p>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleRevoke(selectedUniversity.id)}
                      disabled={revoking === selectedUniversity.id}
                      className="w-full py-3 border-2 border-red-200 text-red-500 rounded-2xl font-black hover:bg-red-50 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-black text-[#043682] mb-6">Invite University</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              {[
                { label: 'University Name', key: 'name', type: 'text', placeholder: 'MIT' },
                { label: 'Domain', key: 'domain', type: 'text', placeholder: 'mit.edu' },
                { label: 'Admin Email', key: 'email', type: 'email', placeholder: 'admin@mit.edu' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest block mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={inviteForm[key]}
                    onChange={e => setInviteForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all font-medium"
                  />
                </div>
              ))}
              {inviteError && <p className="text-red-500 font-bold text-sm">{inviteError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInviteDialog(false); setInviteError(''); }}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-black text-gray-600 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 py-3 bg-[#043682] text-white rounded-2xl font-black hover:bg-[#032b69] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
