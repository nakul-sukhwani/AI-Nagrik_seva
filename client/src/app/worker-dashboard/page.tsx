"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg> },
  { key: 'tasks', label: 'Assigned Tasks', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> },
  { key: 'completed', label: 'Completed Work', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { key: 'profile', label: 'Worker Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'ASSIGNED': 'bg-blue-100 text-blue-700 border-blue-200',
    'IN_PROGRESS': 'bg-amber-100 text-amber-700 border-amber-200',
    'PENDING_VERIFICATION': 'bg-purple-100 text-purple-700 border-purple-200',
    'RESOLVED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [worker, setWorker] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Submit repair report modal state
  const [activeReportTask, setActiveReportTask] = useState<any>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [problemsFaced, setProblemsFaced] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [workerRemarks, setWorkerRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchWorkerData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/worker/dashboard-data`);
      const data = await res.json();
      if (res.ok) {
        setWorker(data.worker);
        setStats(data.stats);
        setTasks(data.tasks || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  const resolveImageUrl = (img: string): string => {
    if (!img) return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';
    if (img.startsWith('http')) return img;
    if (img.startsWith('supabase/')) return `${API}/${img}`;
    return `${API}/${img.replace(/^\//, '')}`;
  };

  const handleStartTask = async (taskId: number) => {
    try {
      const res = await fetch(`${API}/api/worker/start-task/${taskId}`, { method: 'POST' });
      if (res.ok) {
        setMsg('✅ Task status updated to IN_PROGRESS!');
        fetchWorkerData();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch {
      setMsg('❌ Failed to start task');
    }
  };

  const handleSubmitRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReportTask) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('worker_id', worker?.id || '2');
      if (afterImageFile) formData.append('after_image', afterImageFile);
      formData.append('problems_faced', problemsFaced);
      formData.append('tools_used', toolsUsed);
      formData.append('worker_remarks', workerRemarks);

      const res = await fetch(`${API}/api/worker/submit-repair/${activeReportTask.id}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMsg('🎉 Repair report submitted successfully!');
        setActiveReportTask(null);
        setAfterImageFile(null);
        setImagePreview(null);
        setProblemsFaced('');
        setToolsUsed('');
        setWorkerRemarks('');
        fetchWorkerData();
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg('❌ Failed to submit repair report.');
      }
    } catch {
      setMsg('❌ Network error submitting repair.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'assigned') return t.status === 'ASSIGNED';
    if (statusFilter === 'in_progress') return t.status === 'IN_PROGRESS';
    if (statusFilter === 'completed') return ['PENDING_VERIFICATION', 'RESOLVED', 'COMPLETED'].includes(t.status);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06101e] flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-lg">Loading Worker Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100 font-sans">
      {/* ──────────────── LEFT SIDEBAR ──────────────── */}
      <aside className="w-64 bg-[#06101e] text-slate-200 flex flex-col justify-between flex-shrink-0 border-r border-[#102a43]/80 shadow-xl z-20">
        <div>
          <div className="px-5 py-5 border-b border-[#102a43]/60 bg-[#0b1b2b]/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xl shadow-md border border-amber-400/40">
              🔧
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">Field Worker</h1>
              <p className="text-xs text-amber-400 tracking-wider font-mono">Nagrik-Seva Operations</p>
            </div>
          </div>

          <nav className="mt-6 px-3 space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.key ? 'text-white bg-blue-600/90 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-[#102a43]/50'
                }`}
              >
                <span className={activeTab === item.key ? 'text-slate-200' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[#102a43]/60">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Supabase Connected</span>
          </div>
          <button
            onClick={() => router.push('/login?role=worker')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout Worker
          </button>
        </div>
      </aside>

      {/* ──────────────── MAIN CONTENT ──────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Worker Field Dashboard'}
              {activeTab === 'tasks' && 'Assigned Tasks'}
              {activeTab === 'completed' && 'Completed Work History'}
              {activeTab === 'profile' && 'Worker Profile & Ward Information'}
            </h2>
            {msg && <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{msg}</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">{worker?.name || 'Rahul Sharma'}</div>
              <div className="text-xs text-amber-600 font-mono font-bold">{worker?.worker_id || 'WRK-1024'} • {worker?.designation || 'Field Repair Lead'}</div>
            </div>
            <img
              src={resolveImageUrl(worker?.profile_image)}
              alt="Worker Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 shadow-sm"
            />
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══════════════ DASHBOARD TAB ══════════════ */}
          {(activeTab === 'dashboard' || activeTab === 'tasks') && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white p-6 rounded-2xl shadow-lg border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={resolveImageUrl(worker?.profile_image)}
                    alt={worker?.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-amber-400 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-extrabold">{worker?.name}</h1>
                      <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">{worker?.worker_id}</span>
                      <span className="bg-blue-600/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">{worker?.designation}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1 flex items-center gap-4 flex-wrap">
                      <span>🏢 {worker?.department}</span>
                      <span>📍 {worker?.ward}</span>
                      <span>📞 {worker?.contact}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL ASSIGNED</p>
                      <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total_assigned}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-2xl">📋</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ACTIVE / IN PROGRESS</p>
                      <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{stats.active_count}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl text-2xl">⚡</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SUBMITTED</p>
                      <h3 className="text-3xl font-extrabold text-purple-600 mt-1">{stats.completed_count}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-2xl">⏳</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NEW ASSIGNED</p>
                      <h3 className="text-3xl font-extrabold text-blue-600 mt-1">{stats.pending_count}</h3>
                    </div>
                    <div className="p-3 bg-sky-50 text-sky-600 rounded-xl text-2xl">🚨</div>
                  </div>
                </div>
              )}

              {/* Task Controls & Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🛠️</span> Assigned Field Repair Tasks
                </h3>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
                  {['all', 'assigned', 'in_progress', 'completed'].map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                        statusFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <p className="text-slate-400 font-medium">No tasks found matching filter.</p>
                  </div>
                ) : (
                  filteredTasks.map(t => (
                    <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                      <div>
                        <div className="relative h-48 bg-slate-900">
                          <img
                            src={resolveImageUrl(t.image_path || t.public_or_signed_url)}
                            alt="Issue"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <StatusBadge status={t.status} />
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold truncate">
                            📍 {t.address || t.landmark || 'Location Unavailable'}
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">#{t.report_number || `REP-${t.id}`}</span>
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {t.damage_label || t.issue_type}
                            </span>
                          </div>

                          <p className="text-sm text-slate-700 line-clamp-2">{t.description || 'Civic infrastructure repair report.'}</p>

                          <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                            <div>🏛 Ward: <span className="font-medium text-slate-800">{t.ward_id || 'Ward 12'}</span></div>
                            <div>📅 Created: <span className="font-medium text-slate-800">{new Date(t.created_at || Date.now()).toLocaleDateString()}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                        {t.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleStartTask(t.id)}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
                          >
                            🚀 Start Task
                          </button>
                        )}
                        {(t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED') && (
                          <button
                            onClick={() => setActiveReportTask(t)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                          >
                            📸 Submit Repair Report
                          </button>
                        )}
                        {['PENDING_VERIFICATION', 'RESOLVED', 'COMPLETED'].includes(t.status) && (
                          <span className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 text-center block">
                            ✅ Repair Submitted
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══════════════ COMPLETED WORK TAB ══════════════ */}
          {activeTab === 'completed' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Completed Repair Submissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.filter(t => ['PENDING_VERIFICATION', 'RESOLVED', 'COMPLETED'].includes(t.status)).map(t => (
                  <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 font-mono">#{t.report_number || `REP-${t.id}`}</span>
                        <h4 className="font-bold text-slate-900 text-base">{t.issue_type}</h4>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Before (Reported)</p>
                        <img src={resolveImageUrl(t.image_path)} alt="Before" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">After (Repaired)</p>
                        <img src={resolveImageUrl(t.after_image_path)} alt="After" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                      </div>
                    </div>

                    {t.worker_remarks && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Remarks:</span> {t.worker_remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ PROFILE TAB ══════════════ */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <img src={resolveImageUrl(worker?.profile_image)} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-amber-500 shadow-md" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{worker?.name}</h2>
                  <p className="text-amber-600 font-mono font-bold text-sm">{worker?.worker_id} • {worker?.designation}</p>
                  <p className="text-slate-500 text-xs mt-1">Municipal Department of {worker?.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Contact</p>
                  <p className="font-bold text-slate-900 mt-1">{worker?.contact || '+91 98765 43210'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Assigned Ward</p>
                  <p className="font-bold text-slate-900 mt-1">{worker?.ward || 'Ward 12 - North Zone'}</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── SUBMIT REPAIR REPORT MODAL ── */}
      {activeReportTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Submit Repair Report</h3>
              <button onClick={() => setActiveReportTask(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitRepair} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">After Repair Photo (Required)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAfterImageFile(e.target.files[0]);
                      setImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 h-36 w-full object-cover rounded-xl border border-slate-200" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tools Used</label>
                <input
                  type="text"
                  placeholder="e.g. Cold Asphalt Patching Mix, Compactor"
                  value={toolsUsed}
                  onChange={(e) => setToolsUsed(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Worker Remarks / Resolution Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe repair actions taken..."
                  value={workerRemarks}
                  onChange={(e) => setWorkerRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReportTask(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-md"
                >
                  {submitting ? 'Uploading to Supabase...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
