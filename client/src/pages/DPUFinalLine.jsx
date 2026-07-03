// client/src/pages/DPUFinalLine.jsx
import React, { useState, useEffect, useCallback } from 'react';

// --- Icons ---
const EditIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Spinner = () => <svg className="animate-spin w-5 h-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const DocumentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const ChartIcon = () => <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const EyeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const ArrowLeftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const UploadCloudIcon = () => <svg className="w-8 h-8 text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;

const SortArrow = ({ active, direction }) => (
  <span className={`inline-block ml-1 text-xs ${active ? 'text-indigo-500' : 'text-slate-300'}`}>
    {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
  </span>
);

export default function DPUFinalLine() {
  const [currentView, setCurrentView] = useState('list');
  
  // Data States
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  
  // Filters & Pagination
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesLimit, setEntriesLimit] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Form State
  const [formData, setFormData] = useState({ id: null, finalLineNo: '', date: '', totalVehicles: '', cumulative: '', ratio: '' });
  const [file, setFile] = useState(null);

  // PDF Viewer Modal
  const [viewModal, setViewModal] = useState({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });

  // --- Auth Helper ---
  const apiFetch = useCallback((url, options = {}) => {
    const token = localStorage.getItem('sazgar_token');
    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` })
    };
    return fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  // --- Fetch Data ---
  const fetchData = useCallback(() => {
    apiFetch('http://localhost:5000/api/dpu/final-line')
      .then(res => res.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(err => console.error('Fetch error:', err));
  }, [apiFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, fromDate, toDate, entriesLimit]);

  // --- Auto-Calculate Ratio (Safe from NaN/Infinity) ---
  useEffect(() => {
    const tv = Number(formData.totalVehicles);
    const cum = Number(formData.cumulative);
    
    if (tv > 0 && cum >= 0) {
      const calculatedRatio = (cum / tv).toFixed(4);
      setFormData(prev => ({ ...prev, ratio: calculatedRatio }));
    } else {
      setFormData(prev => ({ ...prev, ratio: '0.0000' }));
    }
  }, [formData.totalVehicles, formData.cumulative]);

  // --- Handlers ---
  const handleOpenForm = (record = null) => {
    if (record) {
      setFormData({ 
        id: record.id, finalLineNo: record.finalLineNo, date: record.date, 
        totalVehicles: record.totalVehicles, cumulative: record.cumulative, ratio: record.ratio 
      });
    } else {
      setFormData({ 
        id: null, finalLineNo: `SEWL-Final-${Date.now().toString().slice(-4)}`, 
        date: '', totalVehicles: '', cumulative: '', ratio: '0.0000' 
      });
    }
    setFile(null);
    setCurrentView('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new FormData();
    payload.append('finalLineNo', formData.finalLineNo);
    payload.append('date', formData.date);
    payload.append('totalVehicles', formData.totalVehicles);
    payload.append('cumulative', formData.cumulative);
    payload.append('ratio', formData.ratio);
    if (file) payload.append('dpu_file', file);

    const url = formData.id ? `http://localhost:5000/api/dpu/final-line/${formData.id}` : 'http://localhost:5000/api/dpu/final-line';
    const method = formData.id ? 'PUT' : 'POST';

    apiFetch(url, { method, body: payload })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data.error) return showToast(data.error, 'error');
        showToast(formData.id ? 'Record updated successfully!' : 'Record created successfully!');
        setCurrentView('list');
        fetchData();
      })
      .catch(() => {
        setIsLoading(false);
        showToast('Server connection failed.', 'error');
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      apiFetch(`http://localhost:5000/api/dpu/final-line/${id}`, { method: 'DELETE' })
        .then(() => { showToast('Record deleted.'); fetchData(); });
    }
  };

  // --- EXACT WORKING VIEW LOGIC FROM RCA FILE ---
  const handleViewPdf = async (filename, docTitle) => {
    setViewModal({ isOpen: true, fileUrl: '', title: docTitle, isLoadingPdf: true });
    
    try {
      const safeFilename = encodeURIComponent(filename);
      const targetUrl = `http://localhost:5000/api/dpu/final-line/view-pdf/${safeFilename}`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("Server failed to respond");
      
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      
      setViewModal({ isOpen: true, fileUrl: objectUrl, title: docTitle, isLoadingPdf: false });
    } catch (error) {
      console.error("Failed to fetch PDF:", error);
      showToast('Failed to load PDF. Check server connection.', 'error');
      setViewModal({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });
    }
  };

  const handleCloseModal = () => {
    if (viewModal.fileUrl) {
      URL.revokeObjectURL(viewModal.fileUrl); // Clean up memory
    }
    setViewModal({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });
  };

  // --- Filtering & Sorting ---
  const toggleSort = (field) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const filteredAndSortedData = records
    .filter(item => {
      let dateMatch = true;
      const itemDate = new Date(item.date);
      if (fromDate) { const fDate = new Date(fromDate); fDate.setHours(0,0,0,0); if (itemDate < fDate) dateMatch = false; }
      if (toDate) { const tDate = new Date(toDate); tDate.setHours(23,59,59,999); if (itemDate > tDate) dateMatch = false; }
      
      let searchMatch = true;
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        searchMatch = (item.finalLineNo && item.finalLineNo.toLowerCase().includes(lowerSearch));
      }
      return dateMatch && searchMatch;
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (typeof aVal === 'string' && sortField !== 'totalVehicles' && sortField !== 'cumulative' && sortField !== 'ratio') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });

  // --- Pagination ---
  const totalPages = Math.ceil(filteredAndSortedData.length / entriesLimit) || 1;
  const indexOfLastItem = currentPage * entriesLimit;
  const indexOfFirstItem = indexOfLastItem - entriesLimit;
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

  // --- KPI Analytics ---
  const totalVehicles = records.reduce((sum, r) => sum + (Number(r.totalVehicles) || 0), 0);
  const avgRatio = records.length > 0 ? (records.reduce((sum, r) => sum + (Number(r.ratio) || 0), 0) / records.length).toFixed(4) : '0.0000';

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-2 animate-fade-in ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      {currentView === 'list' ? (
        <div className="animate-fade-in">
          {/* Dashboard KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><ChartIcon /></div>
              <div><p className="text-sm font-semibold text-slate-500">Total Records</p><p className="text-2xl font-bold text-slate-800">{records.length}</p></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div><p className="text-sm font-semibold text-slate-500">Total Vehicles Checked</p><p className="text-2xl font-bold text-emerald-600">{totalVehicles}</p></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div><p className="text-sm font-semibold text-slate-500">Average DPU Ratio</p><p className="text-2xl font-bold text-slate-800">{avgRatio}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Final Line DPU Records</h2>
                <p className="text-sm text-slate-500">Track and analyze Defects Per Unit across the Final Line process.</p>
              </div>
              <button onClick={() => handleOpenForm()} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Create Record
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-end gap-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Date</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To Date</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 w-full sm:w-auto">
                  Show 
                  <select value={entriesLimit} onChange={(e) => setEntriesLimit(Number(e.target.value))} className="border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select> 
                  entries
                </div>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                  <input type="text" placeholder="Search Final Line No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm text-slate-600 min-w-max">
                <thead className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-white sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('finalLineNo')}>Final Line# <SortArrow active={sortField==='finalLineNo'} direction={sortDirection} /></th>
                    <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 text-center transition-colors" onClick={() => toggleSort('totalVehicles')}>Total Vehicles <SortArrow active={sortField==='totalVehicles'} direction={sortDirection} /></th>
                    <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 text-center transition-colors" onClick={() => toggleSort('cumulative')}>Cumulative <SortArrow active={sortField==='cumulative'} direction={sortDirection} /></th>
                    <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 text-center transition-colors" onClick={() => toggleSort('ratio')}>Ratio <SortArrow active={sortField==='ratio'} direction={sortDirection} /></th>
                    <th className="py-4 px-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('date')}>Date <SortArrow active={sortField==='date'} direction={sortDirection} /></th>
                    <th className="py-4 px-6 text-center">Attachment</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-800">{row.finalLineNo}</td>
                      <td className="py-4 px-6 text-center font-medium">{row.totalVehicles}</td>
                      <td className="py-4 px-6 text-center font-medium">{row.cumulative}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1.5 rounded-md font-bold text-xs border ${Number(row.ratio) > 0.05 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {row.ratio}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium">{row.date}</td>
                      <td className="py-4 px-6 text-center">
                        {row.attachmentFilename ? (
                          <button onClick={() => handleViewPdf(row.attachmentFilename, row.finalLineNo)} className="text-indigo-500 hover:text-white hover:bg-indigo-500 p-2 rounded-lg transition-all shadow-sm border border-indigo-100 hover:border-indigo-500" title="View Document">
                            <EyeIcon />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 flex justify-center gap-2">
                        <button onClick={() => handleOpenForm(row)} className="p-2 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100" title="Edit Record"><EditIcon /></button>
                        <button onClick={() => handleDelete(row.id)} className="p-2 rounded-lg hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100" title="Delete Record"><TrashIcon /></button>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-slate-500 font-medium">No records found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredAndSortedData.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
                <div>
                  Showing <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, filteredAndSortedData.length)}</span> of <span className="font-bold text-slate-800">{filteredAndSortedData.length}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors font-semibold shadow-sm">Previous</button>
                  <span className="px-4 font-bold text-slate-800">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors font-semibold shadow-sm">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>

      ) : (
        
        // ==========================================
        // FORM VIEW 
        // ==========================================
        <div className="max-w-4xl mx-auto animate-fade-in">
          <button onClick={() => setCurrentView('list')} className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeftIcon /> Back to Records
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{formData.id ? 'Edit Final Line DPU Record' : 'New Final Line DPU Record'}</h2>
                <p className="text-sm text-slate-500 mt-1">Enter daily metrics to automatically calculate the DPU ratio.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Line No (Auto-Generated)</label>
                  <input type="text" value={formData.finalLineNo} readOnly className="w-full border border-slate-200 bg-slate-100 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-500 outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Report Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required className="w-full border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white rounded-xl p-3.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Vehicles</label>
                  <input type="number" min="0" value={formData.totalVehicles} onChange={(e) => setFormData({...formData, totalVehicles: e.target.value})} required className="w-full border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white rounded-xl p-3.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g., 50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cumulative Defects</label>
                  <input type="number" min="0" value={formData.cumulative} onChange={(e) => setFormData({...formData, cumulative: e.target.value})} required className="w-full border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white rounded-xl p-3.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g., 5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ratio (Auto-Calculated)</label>
                  <input type="text" value={formData.ratio} readOnly className="w-full border border-indigo-100 bg-indigo-50/50 rounded-xl p-3.5 text-sm font-bold text-indigo-700 outline-none cursor-not-allowed shadow-inner" placeholder="0.0000" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Supporting Document (PDF)</label>
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all">
                  <UploadCloudIcon />
                  <p className="text-sm font-bold text-slate-700 mb-1">Drag and drop your PDF here</p>
                  <p className="text-xs text-slate-500 mb-6">or click to browse from your computer</p>
                  <label className="bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-700 text-indigo-600 px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-all">
                    {file ? 'Change Selected File' : 'Select PDF File'}
                    <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                  </label>
                  {file && (
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      {file.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setCurrentView('list')} className="px-8 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                  {isLoading ? <Spinner /> : null} {formData.id ? 'Save Changes' : 'Submit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF View Modal using strict RCA implementation */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><DocumentIcon /> {viewModal.title}</h3>
              <button onClick={handleCloseModal} className="bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">&times;</button>
            </div>
            
            <div className="flex-1 bg-slate-200 flex items-center justify-center relative">
              {viewModal.isLoadingPdf ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-semibold animate-pulse">Bypassing Download Manager & Loading Document...</p>
                </div>
              ) : (
                <object 
                  data={viewModal.fileUrl} 
                  type="application/pdf" 
                  className="w-full h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <p className="text-slate-600 font-medium">Your browser does not support embedded PDFs.</p>
                    <a href={viewModal.fileUrl} download={`${viewModal.title}.pdf`} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                      Download to View
                    </a>
                  </div>
                </object>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}