import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('sazgar_token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` })
  };
  return fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
};

// Custom sleek tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
        <p className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm font-medium mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-slate-600">{entry.name}:</span>
            <span className="text-slate-900 font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DefectTrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5000/api/pdi');
      const pdiList = await res.json();

      const trendMap = {};
      pdiList.forEach(vehicle => {
        const date = vehicle.date;
        if (!trendMap[date]) trendMap[date] = { date, V1: 0, V2: 0, V3: 0, Nill: 0 };

        let details = vehicle.inspectionDetails;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch { details = []; }
        }
        if (!Array.isArray(details) || details.length === 0) {
          trendMap[date].Nill += 1;
        } else {
          details.forEach(item => {
            const cat = item.category;
            if (cat === 'V1') trendMap[date].V1 += 1;
            else if (cat === 'V2') trendMap[date].V2 += 1;
            else if (cat === 'V3') trendMap[date].V3 += 1;
            else trendMap[date].Nill += 1;
          });
        }
      });

      const trendArray = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
      setData(trendArray);
    } catch (err) {
      console.error('Defect trend fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-center items-center h-[380px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Aggregating PDI Trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">PDI Defect Trend</h3>
        <p className="text-xs font-medium text-slate-500 mt-0.5">Chronological breakdown of vehicle conditions</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569', paddingTop: '20px' }} />
          <Line type="monotone" dataKey="V1" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="V1 Critical" />
          <Line type="monotone" dataKey="V2" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="V2 Major" />
          <Line type="monotone" dataKey="V3" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="V3 Minor" />
          <Line type="monotone" dataKey="Nill" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="Nill (Clean)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}