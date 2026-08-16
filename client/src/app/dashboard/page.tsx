"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL;
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg> },
  { key: 'reports',   label: 'Reports',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { key: 'map',       label: 'Interactive Map', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> },
  { key: 'profile',   label: 'Officer Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Pending':     'bg-yellow-100 text-yellow-700',
    'In Progress': 'bg-orange-100 text-orange-700',
    'Resolved':    'bg-green-100 text-green-700',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [summary, setSummary]         = useState<any>(null);
  const [reports, setReports]         = useState<any[]>([]);
  const [mapPoints, setMapPoints]     = useState<any[]>([]);
  const [profile, setProfile]         = useState<any>(null);
  const [loading, setLoading]         = useState(true);

  // Report detail modal
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [selectedMapId, setSelectedMapId]   = useState<string | null>(null);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, boolean>>({});
  const [statusMsg, setStatusMsg]           = useState('');

  // ── FETCH ALL DATA ────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [sumRes, repRes, mapRes, profRes] = await Promise.all([
        fetch(`${API}/api/dashboard/summary`),
        fetch(`${API}/api/reports?page=1`),
        fetch(`${API}/api/reports/map`),
        fetch(`${API}/api/officer/profile`),
      ]);
      const [sumData, repData, mapData, profData] = await Promise.all([
        sumRes.json(), repRes.json(), mapRes.json(), profRes.json(),
      ]);
      setSummary(sumData);
      setReports(repData.reports || []);
      const markers = mapData.markers || [];
      setMapPoints(
        markers
          .filter((m: any) => m.latitude && m.longitude)
          .map((m: any) => ({
            id: m.report_number,
            dbId: m.id,
            lat: m.latitude,
            lng: m.longitude,
            issue_type: m.issue_type,
            status: m.status,
            zone_id: m.zone_id || 'Unknown',
            ward_id: m.ward_id || 'Unknown',
          }))
      );
      setProfile(profData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── OPEN REPORT DETAIL MODAL ──────────────────────────────
  const openReport = async (id: number, reportNumber?: string) => {
    setDetailLoading(true);
    setSelectedReport(null);
    if (reportNumber) setSelectedMapId(reportNumber);
    try {
      const res  = await fetch(`${API}/api/reports/${id}`);
      const data = await res.json();
      setSelectedReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── STATUS UPDATE ─────────────────────────────────────────
  const updateStatus = async (reportId: number, newStatus: string) => {
    setUpdatingStatus(p => ({ ...p, [reportId]: true }));
    try {
      const res = await fetch(`${API}/api/reports/${reportId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`✅ ${data.message || 'Status updated'}`);
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
        setMapPoints(prev => prev.map(p => p.dbId === reportId ? { ...p, status: newStatus } : p));
        if (selectedReport?.id === reportId) setSelectedReport((p: any) => ({ ...p, status: newStatus }));
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        setStatusMsg(`❌ ${data.error || 'Failed to update'}`);
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch {
      setStatusMsg('❌ Network error');
      setTimeout(() => setStatusMsg(''), 3000);
    } finally {
      setUpdatingStatus(p => ({ ...p, [reportId]: false }));
    }
  };

  // ── IMAGE URL HELPER ──────────────────────────────────────
  const resolveImageUrl = (img: any): string => {
    if (!img) return '';
    if (img.public_or_signed_url?.startsWith('http')) return img.public_or_signed_url;
    const path = img.storage_path || img.public_or_signed_url || '';
    return path ? `${API}/${path.replace(/^\//, '')}` : '';
  };

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard', reports: 'Reports', map: 'Interactive Map', profile: 'Officer Profile',
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-600 font-medium">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        Loading dashboard...
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100 font-sans">

      {/* ──────────────── LEFT SIDEBAR ──────────────── */}
      <aside className="w-64 bg-[#06101e] text-slate-200 flex flex-col justify-between flex-shrink-0 border-r border-[#102a43]/80 shadow-xl z-20">
        <div>
          <div className="px-5 py-5 border-b border-[#102a43]/60 bg-[#0b1b2b]/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md border border-blue-400/30">🏛️</div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">Nagrik-Seva AI</h1>
              <p className="text-xs text-slate-400 tracking-wider uppercase">Municipal Operations</p>
            </div>
          </div>
          <nav className="mt-6 px-3 space-y-1">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
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
            <span className="text-xs text-slate-300 font-medium">Server Connected</span>
          </div>
          <button onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout Officer
          </button>
        </div>
      </aside>

      {/* ──────────────── MAIN CONTENT ──────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{pageTitles[activeTab]}</h2>
          <div className="flex items-center gap-3">
            {statusMsg && <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 border border-slate-200">{statusMsg}</span>}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">{profile?.name || 'Officer'}</div>
              <div className="text-xs text-slate-500">{profile?.officer_id || ''}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-500">
              {(profile?.name || 'O').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══════════════ DASHBOARD TAB ══════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                  { label: 'TOTAL REPORTS', value: summary?.total_reports ?? '--', color: 'text-slate-900', bg: 'bg-blue-50', icon: '📊' },
                  { label: 'PENDING',        value: summary?.pending ?? '--',        color: 'text-yellow-700', bg: 'bg-yellow-50', icon: '⏳' },
                  { label: 'IN PROGRESS',    value: summary?.in_progress ?? '--',    color: 'text-orange-700', bg: 'bg-orange-50', icon: '🔄' },
                  { label: 'RESOLVED',       value: summary?.resolved ?? '--',       color: 'text-green-700',  bg: 'bg-green-50',  icon: '✅' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                        <h3 className={`text-3xl font-extrabold mt-2 ${card.color}`}>{card.value}</h3>
                      </div>
                      <div className={`p-3 ${card.bg} rounded-lg text-xl`}>{card.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map + Recent side by side */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '380px' }}>
                  <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800 text-sm flex items-center gap-2">
                    🗺 Live Jurisdiction Map
                    <span className="text-xs text-slate-400 font-normal">— click a marker to view report</span>
                  </div>
                  <div className="flex-1">
                    <Map points={mapPoints} selectedId={selectedMapId} onMarkerClick={(id) => {
                      const pt = mapPoints.find(p => p.id === id);
                      if (pt) openReport(pt.dbId, pt.id);
                    }} />
                  </div>
                </div>
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800 text-sm">Recent Reports</div>
                  <div className="overflow-y-auto flex-1 text-sm">
                    {reports.slice(0, 10).map(r => (
                      <div key={r.id} onClick={() => openReport(r.id, r.report_number)}
                        className="px-5 py-3 border-b border-slate-50 hover:bg-blue-50 transition flex justify-between items-center cursor-pointer"
                      >
                        <div>
                          <div className="font-mono text-blue-600 text-xs">{r.report_number}</div>
                          <div className="text-slate-600 text-xs mt-0.5">{r.issue_type} · {r.zone_id}</div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ REPORTS TAB ══════════════ */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">All Reports</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Report ID</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Zone / Ward</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Change Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Image</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-mono text-blue-600 cursor-pointer hover:underline" onClick={() => openReport(r.id, r.report_number)}>
                          {r.report_number}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.issue_type}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          <span className="font-medium text-blue-700">{r.zone_id || '—'}</span>
                          <br />{r.ward_id || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{r.severity || '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {STATUSES.map(s => (
                              <button key={s}
                                disabled={r.status === s || updatingStatus[r.id]}
                                onClick={() => updateStatus(r.id, s)}
                                className={`px-2 py-0.5 rounded text-xs font-semibold border transition-all ${
                                  r.status === s
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                                    : s === 'Pending'      ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                                    : s === 'In Progress'  ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                                    : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                                }`}
                              >
                                {updatingStatus[r.id] && r.status !== s ? '...' : s}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{r.created_at?.slice(0, 10)}</td>
                        <td className="px-4 py-3">
                          {r.image_path ? (
                            <button onClick={() => openReport(r.id, r.report_number)}
                              className="w-10 h-10 rounded overflow-hidden border border-slate-200 hover:border-blue-400 transition"
                            >
                              <img
                                src={r.image_path.startsWith('http') ? r.image_path : `${API}/${r.image_path.replace(/^\//, '')}`}
                                alt="thumb"
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </button>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">No reports found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════ MAP TAB ══════════════ */}
          {activeTab === 'map' && (
            <div>
              {/* Legend */}
              <div className="flex gap-4 mb-3 flex-wrap">
                {[['Pending', 'bg-yellow-400'], ['In Progress', 'bg-orange-400'], ['Resolved', 'bg-green-500']].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    {label}
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '70vh' }}>
                <Map points={mapPoints} selectedId={selectedMapId} onMarkerClick={(id) => {
                  const pt = mapPoints.find(p => p.id === id);
                  if (pt) openReport(pt.dbId, pt.id);
                }} />
              </div>
            </div>
          )}

          {/* ══════════════ PROFILE TAB ══════════════ */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-500">
                  {(profile?.name || 'O').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{profile?.name || '—'}</h2>
                  <p className="text-sm text-slate-500">{profile?.designation || '—'}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {([['Officer ID', profile?.officer_id], ['Department', profile?.department], ['Zone', profile?.zone_id], ['Ward', profile?.ward_id], ['Email', profile?.email], ['Status', profile?.status]] as [string, string][]).map(([label, val]) => (
                  <div key={label} className="flex gap-3 border-b border-slate-50 pb-2">
                    <span className="text-slate-500 w-32 flex-shrink-0 font-medium">{label}</span>
                    <span className="text-slate-800">{val || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════ REPORT DETAIL MODAL ══════════════ */}
      {(selectedReport || detailLoading) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedReport(null); setSelectedMapId(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedReport && (
              <>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedReport.report_number}</h3>
                    <p className="text-sm text-slate-500">{selectedReport.issue_type} · {selectedReport.zone_id} · {selectedReport.ward_id}</p>
                  </div>
                  <button onClick={() => { setSelectedReport(null); setSelectedMapId(null); }}
                    className="text-slate-400 hover:text-slate-600 transition text-2xl leading-none">×</button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Images */}
                  {selectedReport.images && selectedReport.images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">📷 Uploaded Images</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedReport.images.map((img: any, i: number) => {
                          const url = resolveImageUrl(img);
                          return url ? (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={`Report image ${i + 1}`}
                                className="w-full rounded-lg border border-slate-200 object-cover hover:opacity-90 transition"
                                style={{ maxHeight: '220px' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {([
                      ['Status', <StatusBadge key="s" status={selectedReport.status} />],
                      ['Severity', selectedReport.severity || '—'],
                      ['Address', selectedReport.address || '—'],
                      ['Landmark', selectedReport.landmark || '—'],
                      ['Zone', selectedReport.zone_id || '—'],
                      ['Ward', selectedReport.ward_id || '—'],
                      ['Lat/Lng', selectedReport.latitude ? `${Number(selectedReport.latitude).toFixed(4)}, ${Number(selectedReport.longitude).toFixed(4)}` : '—'],
                      ['Created', selectedReport.created_at?.slice(0, 19).replace('T', ' ') || '—'],
                      ['Assigned Officer', selectedReport.assigned_officer_name || '—'],
                      ['Department', selectedReport.department || '—'],
                    ] as [string, any][]).map(([label, val]) => (
                      <div key={label} className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
                        <div className="text-slate-800 text-sm font-semibold">{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Status Change in Modal */}
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">🔄 Update Status</h4>
                    <div className="flex gap-2">
                      {STATUSES.map(s => (
                        <button key={s}
                          disabled={selectedReport.status === s || updatingStatus[selectedReport.id]}
                          onClick={() => updateStatus(selectedReport.id, s)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                            selectedReport.status === s
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                              : s === 'Pending'      ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                              : s === 'In Progress'  ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                              : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                          }`}
                        >
                          {updatingStatus[selectedReport.id] && selectedReport.status !== s ? '...' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
