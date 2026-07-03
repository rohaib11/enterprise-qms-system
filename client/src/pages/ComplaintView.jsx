import React, { useState, useEffect, useCallback } from 'react';

// --- Icons ---
const EyeIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Spinner = () => <svg className="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const PaperclipIcon = () => <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const SortArrow = ({ active, direction }) => (
  <span className={`inline-block ml-1 text-xs ${active ? 'text-indigo-500' : 'text-slate-400'}`}>
    {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
  </span>
);

export default function ComplaintView({ setActiveItem }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Filters & Pagination
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null, mediaUrl: '', isMediaLoading: false });
  const [editModal, setEditModal] = useState({ isOpen: false, data: null, isSaving: false });

  // Toast
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

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

  // --- Fetch Complaints ---
  const fetchData = useCallback(() => {
    setIsLoading(true);
    apiFetch('http://localhost:5000/api/complaints')
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        showToast('Failed to load complaints. Check server.', 'error');
        setIsLoading(false);
      });
  }, [apiFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, fromDate, toDate, entriesLimit]);

  // --- Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint record?')) return;
    setDeleteLoadingId(id);
    try {
      const res = await apiFetch(`http://localhost:5000/api/complaints/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Complaint deleted successfully!');
      fetchData();
    } catch (err) {
      showToast('Failed to delete complaint.', 'error');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // --- Edit Update ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditModal(prev => ({ ...prev, isSaving: true }));
    
    // We must use FormData because the backend expects upload.single('complaint_file')
    const payload = new FormData();
    Object.keys(editModal.data).forEach(key => {
      payload.append(key, editModal.data[key] || '');
    });

    try {
      const res = await apiFetch(`http://localhost:5000/api/complaints/${editModal.data.id}`, {
        method: 'PUT',
        body: payload
      });
      if (!res.ok) throw new Error('Update failed');
      showToast('Complaint updated successfully!');
      setEditModal({ isOpen: false, data: null, isSaving: false });
      fetchData();
    } catch (error) {
      console.error(error);
      showToast('Failed to update complaint.', 'error');
      setEditModal(prev => ({ ...prev, isSaving: false }));
    }
  };

  // --- View Modal (Media) ---
  const handleOpenView = async (record) => {
    setViewModal({ isOpen: true, data: record, mediaUrl: '', isMediaLoading: !!record.attachmentFilename });
    if (record.attachmentFilename) {
      try {
        const safeFilename = encodeURIComponent(record.attachmentFilename);
        const res = await apiFetch(`http://localhost:5000/api/complaints/view-media/${safeFilename}`);
        if (!res.ok) throw new Error('Media not found');
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setViewModal(prev => ({ ...prev, mediaUrl: objectUrl, isMediaLoading: false }));
      } catch (error) {
        console.error(error);
        showToast('Could not load media file.', 'error');
        setViewModal(prev => ({ ...prev, isMediaLoading: false }));
      }
    }
  };

  const handleCloseModal = () => {
    if (viewModal.mediaUrl) URL.revokeObjectURL(viewModal.mediaUrl);
    setViewModal({ isOpen: false, data: null, mediaUrl: '', isMediaLoading: false });
  };

  const isVideo = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);
  };

  // --- Sorting ---
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // --- Filtering & Sorting Data ---
  const filteredAndSortedData = complaints
    .filter(item => {
      let dateMatch = true;
      const itemDate = new Date(item.date);
      if (fromDate) {
        const fDate = new Date(fromDate); fDate.setHours(0,0,0,0);
        if (itemDate < fDate) dateMatch = false;
      }
      if (toDate) {
        const tDate = new Date(toDate); tDate.setHours(23,59,59,999);
        if (itemDate > tDate) dateMatch = false;
      }
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          dateMatch && (
            (item.complaintNo && item.complaintNo.toLowerCase().includes(lowerSearch)) ||
            (item.dealershipName && item.dealershipName.toLowerCase().includes(lowerSearch)) ||
            (item.vin && item.vin.toLowerCase().includes(lowerSearch)) ||
            (item.problem && item.problem.toLowerCase().includes(lowerSearch))
          )
        );
      }
      return dateMatch;
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const aNum = new Date(aVal).getTime() || 0;
      const bNum = new Date(bVal).getTime() || 0;
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredAndSortedData.length / entriesLimit) || 1;
  const indexOfLastItem = currentPage * entriesLimit;
  const indexOfFirstItem = indexOfLastItem - entriesLimit;
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

  const getLiabilityBadge = (liability) => {
    if (!liability || liability === 'Pending/Unknown') return 'bg-slate-100 text-slate-600 border-slate-200';
    if (liability === 'Manufacturer') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (liability === 'Dealership') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (liability === 'Transporter') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const inputClass = "border border-slate-200 bg-slate-50 focus:bg-white rounded-lg p-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-fade-in ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Complaint List View</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track all dealership quality tickets.</p>
        </div>
        <button 
          onClick={() => setActiveItem('Create Complaint')} 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Create
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="p-6 border-b border-slate-100 bg-white flex flex-col lg:flex-row justify-between items-end gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            Show 
            <select value={entriesLimit} onChange={(e) => setEntriesLimit(Number(e.target.value))} className={inputClass}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select> 
            entries
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Spinner />
            <span className="text-slate-500 text-sm font-medium">Loading complaints...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 min-w-max">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                {[
                  { key: 'complaintNo', label: 'Ticket#' },
                  { key: 'dealershipName', label: 'Dealership' },
                  { key: 'date', label: 'Log Date' },
                  { key: 'vin', label: 'VIN#' },
                  { key: 'liability', label: 'Liability' },
                  { key: 'problem', label: 'Problem Summary' },
                ].map(col => (
                  <th
                    key={col.key}
                    className="py-4 px-4 cursor-pointer select-none hover:text-emerald-600 transition-colors"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    <SortArrow active={sortField === col.key} direction={sortDirection} />
                  </th>
                ))}
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                    {row.complaintNo}
                    {row.attachmentFilename && <span title="Media Attached"><PaperclipIcon /></span>}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{row.dealershipName}</td>
                  <td className="py-3 px-4">{row.date}</td>
                  <td className="py-3 px-4 font-mono text-xs text-emerald-700 bg-emerald-50 px-2 rounded inline-block mt-2 border border-emerald-100">{row.vin}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border inline-block ${getLiabilityBadge(row.liability)}`}>
                      {row.liability || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-[250px] truncate" title={row.problem}>{row.problem || '-'}</td>
                  <td className="py-3 px-4 flex justify-center gap-4">
                    <button onClick={() => handleOpenView(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all" title="View Details">
                      <EyeIcon />
                    </button>
                    <button onClick={() => setEditModal({ isOpen: true, data: row, isSaving: false })} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all" title="Quick Edit">
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={deleteLoadingId === row.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Ticket"
                    >
                      {deleteLoadingId === row.id ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      ) : (
                        <TrashIcon />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              
              {!isLoading && currentItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-slate-500 font-medium">No complaints found matching your filters.</p>
                      <button onClick={() => setSearchTerm('')} className="mt-2 text-emerald-500 hover:text-emerald-600 text-sm font-semibold">Clear Search</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && filteredAndSortedData.length > 0 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, filteredAndSortedData.length)}</span> of <span className="font-bold text-slate-800">{filteredAndSortedData.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors font-semibold"
            >
              Previous
            </button>
            <span className="px-3 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- QUICK EDIT MODAL --- */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><EditIcon /> Quick Edit: {editModal.data.complaintNo}</h3>
              <button onClick={() => setEditModal({ isOpen: false, data: null, isSaving: false })} className="bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-500 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto max-h-[70vh] bg-white space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Liability</label>
                  <select 
                    value={editModal.data.liability || ''} 
                    onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, liability: e.target.value } }))} 
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Pending/Unknown</option>
                    <option value="Dealership">Dealership</option>
                    <option value="Transporter">Transporter</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">RFD Date</label>
                  <input 
                    type="date" 
                    value={editModal.data.rfdDate || ''} 
                    onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, rfdDate: e.target.value } }))} 
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Action Taken</label>
                <textarea 
                  rows="3"
                  value={editModal.data.actionTaken || ''} 
                  onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, actionTaken: e.target.value } }))} 
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="Update resolution steps..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Solution / Cause</label>
                <textarea 
                  rows="3"
                  value={editModal.data.solutionCause || ''} 
                  onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, solutionCause: e.target.value } }))} 
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="Update root cause findings..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditModal({ isOpen: false, data: null, isSaving: false })} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={editModal.isSaving} className="px-8 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors flex items-center gap-2">
                  {editModal.isSaving ? <Spinner /> : null} Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL (Unchanged from premium design but included) --- */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Complaint Details: <span className="text-emerald-600">{viewModal.data.complaintNo}</span></h3>
              <button onClick={handleCloseModal} className="bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-500 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
              
              {/* Primary Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div><p className="text-xs text-slate-500 font-bold mb-1">Dealership</p><p className="text-sm font-semibold text-slate-800">{viewModal.data.dealershipName}</p></div>
                <div><p className="text-xs text-slate-500 font-bold mb-1">VIN Number</p><p className="text-sm font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">{viewModal.data.vin}</p></div>
                <div><p className="text-xs text-slate-500 font-bold mb-1">Color</p><p className="text-sm font-semibold text-slate-800">{viewModal.data.colour || 'N/A'}</p></div>
                <div><p className="text-xs text-slate-500 font-bold mb-1">Reported Date</p><p className="text-sm font-semibold text-slate-800">{viewModal.data.date}</p></div>
              </div>

              {/* Text Fields */}
              <div className="space-y-5 border-t border-slate-100 pt-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reported Problem</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{viewModal.data.problem || 'No description provided.'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Found During</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{viewModal.data.foundDuring || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Solution / Cause</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{viewModal.data.solutionCause || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Action Taken</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{viewModal.data.actionTaken || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Additional Info</h4>
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <p><span className="font-semibold">Part Return:</span> {viewModal.data.vehiclePartReturn || '-'}</p>
                      <p><span className="font-semibold">Liability:</span> <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getLiabilityBadge(viewModal.data.liability)}`}>{viewModal.data.liability || 'Pending'}</span></p>
                      <p><span className="font-semibold">RFD Date:</span> {viewModal.data.rfdDate || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attached Media */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Evidence</h4>
                  {viewModal.data.attachmentFilename && viewModal.mediaUrl && (
                    <a
                      href={viewModal.mediaUrl}
                      download={viewModal.data.attachmentFilename}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      <DownloadIcon /> Download File
                    </a>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 min-h-[200px] flex items-center justify-center">
                  {!viewModal.data.attachmentFilename ? (
                    <p className="text-sm text-slate-400 font-medium">No media attached to this complaint.</p>
                  ) : viewModal.isMediaLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Spinner />
                      <p className="text-xs text-slate-500 font-semibold">Decrypting Media...</p>
                    </div>
                  ) : viewModal.mediaUrl ? (
                    isVideo(viewModal.data.attachmentFilename) ? (
                      <video controls src={viewModal.mediaUrl} className="max-w-full max-h-[400px] rounded-lg shadow-sm" />
                    ) : (
                      <img src={viewModal.mediaUrl} alt="Complaint Evidence" className="max-w-full max-h-[400px] rounded-lg shadow-sm object-contain" />
                    )
                  ) : (
                    <p className="text-sm text-rose-400 font-medium">Failed to load media file.</p>
                  )}
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={handleCloseModal} className="bg-white border border-slate-200 shadow-sm hover:bg-slate-100 text-slate-700 font-bold px-8 py-2.5 rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}