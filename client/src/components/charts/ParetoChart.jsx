import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, ResponsiveContainer
} from 'recharts';

const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('sazgar_token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` })
  };
  return fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
};

const ParetoTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
        <p className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="text-slate-600">Frequency:</span>
            <span className="text-slate-900 font-bold">{payload[0]?.value}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Cumulative:</span>
              <span className="text-rose-600 font-bold">{payload[1].value}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function ParetoChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5000/api/pdi');
      const pdiList = await res.json();

      const defectCounts = {};
      pdiList.forEach(vehicle => {
        let details = vehicle.inspectionDetails;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch { details = []; }
        }
        if (Array.isArray(details)) {
          details.forEach(item => {
            const name = item.item?.trim() || 'Unspecified';
            if (name) defectCounts[name] = (defectCounts[name] || 0) + 1;
          });
        }
      });

      let sorted = Object.entries(defectCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const total = sorted.reduce((sum, d) => sum + d.count, 0);
      let cumulative = 0;
      const paretoData = sorted.map((d) => {
        cumulative += d.count;
        return {
          ...d,
          cumulative: parseFloat(((cumulative / total) * 100).toFixed(1))
        };
      });

      setData(paretoData.slice(0, 15)); // Limit to top 15 so X-axis isn't unreadable
    } catch (err) {
      console.error('Pareto fetch error:', err);
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
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Calculating Pareto Distribution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Defect Pareto Analysis</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Top frequency issues mapping 80/20 rule</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} angle={-35} textAnchor="end" height={60} axisLine={false} tickLine={false} dy={10} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} hide />
          <Tooltip content={<ParetoTooltip />} cursor={{fill: '#f8fafc'}} />
          <Bar yAxisId="left" dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={35} name="Frequency" />
          <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Cumulative %" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}