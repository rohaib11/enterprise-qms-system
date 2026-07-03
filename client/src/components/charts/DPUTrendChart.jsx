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

const lines = [
  { key: 'weld', name: 'Weld', color: '#6366f1' },
  { key: 'paint-qg2', name: 'Paint QG2', color: '#8b5cf6' },
  { key: 'trim-line', name: 'Trim Line', color: '#ec4899' },
  { key: 'chassis-line', name: 'Chassis Line', color: '#f43f5e' },
  { key: 'final-line', name: 'Final Line', color: '#06b6d4' },
  { key: 'rework', name: 'Rework', color: '#f97316' },
];

const CustomDPUTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
        <p className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-600">{entry.name}:</span>
              </div>
              <span className="text-slate-900 font-bold">{Number(entry.value).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DPUTrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const linePromises = lines.map(line =>
        apiFetch(`http://localhost:5000/api/dpu/${line.key}`).then(res => res.json())
      );
      const allLineData = await Promise.all(linePromises);

      const dateMap = {};
      lines.forEach((line, index) => {
        const records = allLineData[index] || [];
        records.forEach(rec => {
          if (!dateMap[rec.date]) {
            dateMap[rec.date] = { date: rec.date };
            lines.forEach(l => dateMap[rec.date][l.name] = 0);
          }
          dateMap[rec.date][line.name] = parseFloat(rec.ratio) || 0;
        });
      });

      const combined = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
      setData(combined);
    } catch (err) {
      console.error('DPU trend fetch error:', err);
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
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Compiling Line DPU Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">DPU Ratio Evolution</h3>
        <p className="text-xs font-medium text-slate-500 mt-0.5">Defects Per Unit tracking across all assembly lines</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomDPUTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569', paddingTop: '20px' }} />
          {lines.map(line => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.name}
              stroke={line.color}
              strokeWidth={2.5}
              dot={{ r: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}