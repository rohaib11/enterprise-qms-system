// client/src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DefectTrendChart from '../components/charts/DefectTrendChart';
import DPUTrendChart from '../components/charts/DPUTrendChart';
import ParetoChart from '../components/charts/ParetoChart';

// ==========================================
// ICONS
// ==========================================
const ChartBarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const DocumentIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const ExclamationIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckCircleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const VideoIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DatabaseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const ShieldCheckIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const SyncIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0121.21 8H18.5M4 12v5h.582m15.356-2A8.001 8.001 0 012.79 16H5.5" /></svg>;

// ==========================================
// STAT CARD COMPONENT
// ==========================================
function StatCard({ icon, bgGradient, iconColor, value, label, sub }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex items-center gap-4 relative overflow-hidden">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center shrink-0 shadow-inner border border-white/20 z-10`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 z-10">
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        <p className="text-sm font-bold text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs font-medium text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${iconColor} transform group-hover:scale-110`}>
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">{icon.props.children}</svg>
      </div>
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState('');
  const [stats, setStats] = useState({
    pdiTotal: 0, defectsV1: 0, defectsV2: 0, defectsV3: 0, defectsNill: 0,
    rcaReports: 0, rcaVideos: 0, complaintsTotal: 0, complaintsOpen: 0,
    complaintsLiability: {}, bigDataDocs: 0, isoDocs: 0, recentPDI: [],
  });

  const apiFetch = useCallback((url, options = {}) => {
    const token = localStorage.getItem('sazgar_token');
    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` })
    };
    return fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pdiRes, rcaReportsRes, rcaVideosRes, complaintsRes, bigDataRes, isoRes] = await Promise.all([
        apiFetch('http://localhost:5000/api/pdi'),
        apiFetch('http://localhost:5000/api/rca/reports'),
        apiFetch('http://localhost:5000/api/rca/videos'),
        apiFetch('http://localhost:5000/api/complaints'),
        apiFetch('http://localhost:5000/api/bigdata'),
        apiFetch('http://localhost:5000/api/iso'),
      ]);

      const pdiData = await pdiRes.json();
      const rcaReports = await rcaReportsRes.json();
      const rcaVideos = await rcaVideosRes.json();
      const complaintsData = await complaintsRes.json();
      const bigData = await bigDataRes.json();
      const isoData = await isoRes.json();

      let v1 = 0, v2 = 0, v3 = 0, nill = 0;
      pdiData.forEach(vehicle => {
        let details = vehicle.inspectionDetails;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch { details = []; }
        }
        if (!Array.isArray(details) || details.length === 0) {
          nill++;
        } else {
          details.forEach(item => {
            if (item.category === 'V1') v1++;
            else if (item.category === 'V2') v2++;
            else if (item.category === 'V3') v3++;
            else nill++;
          });
        }
      });

      let openComplaints = 0;
      const liabilityCounts = {};
      complaintsData.forEach(c => {
        if (!c.rfdDate) openComplaints++;
        const liab = c.liability || 'Pending';
        liabilityCounts[liab] = (liabilityCounts[liab] || 0) + 1;
      });

      const sortedPDI = [...pdiData].sort((a, b) => b.id - a.id).slice(0, 5);

      setStats({
        pdiTotal: pdiData.length, defectsV1: v1, defectsV2: v2, defectsV3: v3, defectsNill: nill,
        rcaReports: rcaReports.length, rcaVideos: rcaVideos.length, complaintsTotal: complaintsData.length,
        complaintsOpen: openComplaints, complaintsLiability: liabilityCounts, bigDataDocs: bigData.length,
        isoDocs: isoData.length, recentPDI: sortedPDI,
      });

      const now = new Date();
      setLastSynced(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived Analytics
  const passRate = stats.pdiTotal > 0 ? ((stats.defectsNill / stats.pdiTotal) * 100).toFixed(1) : 0;
  const totalDefects = stats.defectsV1 + stats.defectsV2 + stats.defectsV3;
  const totalLiability = Object.values(stats.complaintsLiability).reduce((a, b) => a + b, 0);
  const maxDefect = Math.max(stats.defectsV1, stats.defectsV2, stats.defectsV3, stats.defectsNill, 1);

  // Dynamic Date Greeting
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const getCategoryBadge = (cat) => {
    if (!cat) return 'bg-slate-100 text-slate-600 border border-slate-200';
    if (cat.includes('V1')) return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (cat.includes('V2')) return 'bg-orange-50 text-orange-700 border border-orange-200';
    if (cat.includes('V3')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  const liabilityColors = {
    'Manufacturer': 'bg-rose-500', 'Dealership': 'bg-blue-500', 'Transporter': 'bg-amber-500',
    'Customer': 'bg-purple-500', 'Pending': 'bg-slate-400', 'Pending/Unknown': 'bg-slate-400',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div></div>
          </div>
          <p className="text-slate-500 font-bold tracking-wide animate-pulse">Aggregating Global Quality Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* ========== HERO HEADER ========== */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest text-indigo-200 uppercase backdrop-blur-md">
                Live Telemetry
              </span>
              <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Last Synced: {lastSynced}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              {greeting}, Plant Manager.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
              {today}. First Time Through (FTT) pass rate is currently sitting at <span className={`font-bold ${passRate > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{passRate}%</span> based on recent PDI analytics.
            </p>
          </div>
          <button onClick={fetchAll} className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/30">
            <span className="group-hover:rotate-180 transition-transform duration-500"><SyncIcon /></span>
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* ========== TOP ROW: PRODUCTION & DEFECTS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ChartBarIcon />} bgGradient="from-slate-100 to-slate-200" iconColor="text-indigo-600" value={stats.pdiTotal} label="Vehicles Inspected" sub="Total recorded PDI checks" />
        <StatCard icon={<CheckCircleIcon />} bgGradient="from-slate-100 to-slate-200" iconColor="text-emerald-600" value={stats.defectsNill} label="Clean (Nill) Vehicles" sub={`${passRate}% First Time Through`} />
        <StatCard icon={<ExclamationIcon />} bgGradient="from-slate-100 to-slate-200" iconColor="text-rose-600" value={totalDefects} label="Total Logged Defects" sub="Combined V1, V2, and V3" />
        <StatCard icon={<ShieldCheckIcon />} bgGradient="from-slate-100 to-slate-200" iconColor="text-amber-600" value={stats.complaintsOpen} label="Open Complaints" sub="Pending dealership resolution" />
      </div>

      {/* ========== SECOND ROW: COMPLIANCE & DOCUMENTS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DocumentIcon />} bgGradient="from-slate-800 to-slate-900" iconColor="text-white" value={stats.rcaReports} label="RCA Reports" sub="Root cause PDF analyses" />
        <StatCard icon={<VideoIcon />} bgGradient="from-slate-800 to-slate-900" iconColor="text-white" value={stats.rcaVideos} label="RCA Videos" sub="Visual audit evidence" />
        <StatCard icon={<DatabaseIcon />} bgGradient="from-slate-800 to-slate-900" iconColor="text-white" value={stats.bigDataDocs} label="Big Data Files" sub="Exported bulk telemetry" />
        <StatCard icon={<ShieldCheckIcon />} bgGradient="from-slate-800 to-slate-900" iconColor="text-white" value={stats.isoDocs} label="ISO Compliance" sub="Standardization documents" />
      </div>

      {/* ========== PROGRESS BARS: SEVERITY & LIABILITY ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defect Severity Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col hover:shadow-md transition-shadow">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800">Defect Severity Distribution</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Breakdown of all recorded inspection outcomes</p>
          </div>
          <div className="flex-1 space-y-5">
            {[
              { label: 'V1 Critical', value: stats.defectsV1, color: 'bg-rose-500', textColor: 'text-rose-700' },
              { label: 'V2 Major', value: stats.defectsV2, color: 'bg-orange-500', textColor: 'text-orange-700' },
              { label: 'V3 Minor', value: stats.defectsV3, color: 'bg-amber-500', textColor: 'text-amber-700' },
              { label: 'Nill (Clean)', value: stats.defectsNill, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
            ].map(bar => {
              const widthPercent = (bar.value / maxDefect) * 100;
              return (
                <div key={bar.label} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{bar.label}</span>
                    <span className={`text-sm font-black ${bar.textColor}`}>{bar.value}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {maxDefect === 1 && totalDefects === 0 && stats.defectsNill === 0 && (
              <p className="text-slate-400 text-sm font-medium text-center py-8">Awaiting initial inspection data.</p>
            )}
          </div>
        </div>

        {/* Complaints Liability Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col hover:shadow-md transition-shadow">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800">Dealership Complaints Liability</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Origin mapping for post-delivery issues</p>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {totalLiability > 0 ? (
              <>
                <div className="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex mb-8 shadow-inner">
                  {Object.entries(stats.complaintsLiability).map(([liability, count]) => {
                    const percent = (count / totalLiability) * 100;
                    return (
                      <div
                        key={liability}
                        className={`${liabilityColors[liability] || 'bg-slate-400'} h-full transition-all duration-1000 hover:brightness-110 cursor-pointer`}
                        style={{ width: `${percent}%` }}
                        title={`${liability}: ${count} (${percent.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {Object.entries(stats.complaintsLiability).map(([liability, count]) => (
                    <div key={liability} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className={`w-3.5 h-3.5 rounded-full shadow-sm ${liabilityColors[liability] || 'bg-slate-400'}`} />
                      <span className="text-sm font-bold text-slate-700">{liability}</span>
                      <span className="text-sm font-black text-slate-900 ml-auto">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-400 text-sm font-bold">No external complaints logged.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== ADVANCED CHARTS ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DefectTrendChart />
        <DPUTrendChart />
      </div>
      <ParetoChart />

      {/* ========== RECENT PDI TABLE ========== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Recent PDI Inspections</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Last 5 recorded quality gate checks</p>
          </div>
          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
            Live Feed
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {stats.recentPDI.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-4 px-6">PDI Number</th>
                  <th className="py-4 px-6">Vehicle Model</th>
                  <th className="py-4 px-6">VIN / Chassis</th>
                  <th className="py-4 px-6">Inspection Date</th>
                  <th className="py-4 px-6">Primary Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentPDI.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6 font-bold text-slate-800">{row.pdiNumber}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{row.model}</td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600 bg-indigo-50/50 rounded-md px-2 inline-block mt-3">{row.vin}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">{row.date}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${getCategoryBadge(row.category)}`}>
                        {row.category || 'Nill'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center flex flex-col items-center">
              <DocumentIcon className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-semibold">No PDI inspection records found.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}