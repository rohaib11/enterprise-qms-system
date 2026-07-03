import React, { useState, useEffect, useCallback } from 'react';

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const SortArrow = ({ active, direction }) => (
  <span className={`inline-block ml-1 text-xs ${active ? 'text-emerald-500' : 'text-slate-400'}`}>
    {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
  </span>
);

export default function IsoCompliance() {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [editMode, setEditMode] = useState({ isEditing: false, id: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });

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

  const fetchReports = useCallback(() => {
    setIsFetching(true);
    apiFetch('http://localhost:5000/api/iso')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setIsFetching(false);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load documents.', 'error');
        setIsFetching(false);
      });
  }, [apiFetch]);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, entriesLimit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return showToast('Please provide a document title.', 'error');
    if (!editMode.isEditing && !file) return showToast('Please select a PDF file.', 'error');

    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    if (file) formData.append('iso_file', file);

    const url = editMode.isEditing 
      ? `http://localhost:5000/api/iso/${editMode.id}` 
      : 'http://localhost:5000/api/iso';
    const method = editMode.isEditing ? 'PUT' : 'POST';

    apiFetch(url, { method, body: formData })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data.error) return showToast(data.error, 'error');
        
        showToast(editMode.isEditing ? 'Document updated!' : 'Document uploaded!');
        handleCancelEdit();
        fetchReports();
      })
      .catch(() => {
        setIsLoading(false);
        showToast('Server connection failed.', 'error');
      });
  };

  const handleEditClick = (doc) => {
    setEditMode({ isEditing: true, id: doc.id });
    setTitle(doc.title);
    setFile(null);
    const fileInput = document.getElementById('iso-file-upload');
    if (fileInput) fileInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditMode({ isEditing: false, id: null });
    setTitle('');
    setFile(null);
    const fileInput = document.getElementById('iso-file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const res = await apiFetch(`http://localhost:5000/api/iso/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Document deleted.');
      if (editMode.id === id) handleCancelEdit();
      fetchReports();
    } catch (err) {
      showToast('Failed to delete.', 'error');
    }
  };

  const handleViewPdf = async (filename, docTitle) => {
    setViewModal({ isOpen: true, fileUrl: '', title: docTitle, isLoadingPdf: true });
    try {
      const safeFilename = encodeURIComponent(filename);
      const response = await apiFetch(`http://localhost:5000/api/iso/view-pdf/${safeFilename}`);
      if (!response.ok) throw new Error("Server failed");
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      setViewModal({ isOpen: true, fileUrl: objectUrl, title: docTitle, isLoadingPdf: false });
    } catch (error) {
      showToast('Failed to load PDF.', 'error');
      setViewModal({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });
    }
  };

  const handleCloseModal = () => {
    if (viewModal.fileUrl) URL.revokeObjectURL(viewModal.fileUrl);
    setViewModal({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = reports
    .filter(doc => {
      const lower = searchTerm.toLowerCase();
      return doc.title.toLowerCase().includes(lower) || doc.uploadDate.toLowerCase().includes(lower);
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (typeof aVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const totalPages = Math.ceil(filteredAndSortedData.length / entriesLimit) || 1;
  const indexOfLastItem = currentPage * entriesLimit;
  const indexOfFirstItem = indexOfLastItem - entriesLimit;
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

  const recentlyAdded = reports.filter(r => {
    const rDate = new Date(r.uploadDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return rDate >= sevenDaysAgo;
  }).length;

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";

  return (
    <div className="space-y-6 relative">
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl border text-sm font-bold ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <DatabaseIcon className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Documents</p>
            <p className="text-2xl font-bold text-slate-800">{reports.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Added This Week</p>
            <p className="text-2xl font-bold text-teal-600">{recentlyAdded}</p>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border p-8 transition-all ${editMode.isEditing ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <UploadIcon /> {editMode.isEditing ? 'Update ISO Document' : 'Upload ISO Document'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {editMode.isEditing ? `Editing: ${title}` : 'Maintain your ISO 9001, IATF 16949 compliance records and audit logs.'}
            </p>
          </div>
          {editMode.isEditing && (
            <button onClick={handleCancelEdit} className="text-sm font-bold text-rose-500 hover:bg-rose-100 px-4 py-2 bg-rose-50 rounded-lg transition-colors">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., IATF Internal Audit 2025" className={inputClass} />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {editMode.isEditing ? 'Replace PDF (Optional)' : 'PDF File'}
            </label>
            <input id="iso-file-upload" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required={!editMode.isEditing} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${editMode.isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'} disabled:opacity-50 disabled:cursor-not-allowed`}>
              {isLoading ? (
                <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : <UploadIcon />}
              {isLoading ? 'Processing...' : editMode.isEditing ? 'Save Changes' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            Show
            <select value={entriesLimit} onChange={(e) => setEntriesLimit(Number(e.target.value))} className="border border-slate-200 rounded-lg p-1.5 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isFetching ? (
            <div className="flex justify-center py-16"><svg className="animate-spin w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-4 px-6 cursor-pointer select-none hover:text-emerald-600 w-1/2" onClick={() => toggleSort('title')}>
                    Document Title <SortArrow active={sortField === 'title'} direction={sortDirection} />
                  </th>
                  <th className="py-4 px-6 cursor-pointer select-none hover:text-emerald-600" onClick={() => toggleSort('uploadDate')}>
                    Upload Date <SortArrow active={sortField === 'uploadDate'} direction={sortDirection} />
                  </th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.length === 0 && !isFetching ? (
                  <tr><td colSpan="3" className="py-16 text-center text-slate-400">No ISO documents found.</td></tr>
                ) : (
                  currentItems.map((doc) => (
                    <tr key={doc.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold border border-emerald-100">PDF</div>
                        {doc.title}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{doc.uploadDate}</td>
                      <td className="py-4 px-6 flex justify-center gap-2">
                        <button onClick={() => handleViewPdf(doc.filename, doc.title)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="View PDF"><EyeIcon /></button>
                        <button onClick={() => handleEditClick(doc)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit"><EditIcon /></button>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete"><TrashIcon /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {!isFetching && filteredAndSortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
            <div>Showing <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, filteredAndSortedData.length)}</span> of <span className="font-bold text-slate-800">{filteredAndSortedData.length}</span> entries</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors font-semibold">Previous</button>
              <span className="px-3 font-bold text-slate-800">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors font-semibold">Next</button>
            </div>
          </div>
        )}
      </div>

      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><DatabaseIcon className="w-5 h-5 text-emerald-600" /> {viewModal.title}</h3>
              <button onClick={handleCloseModal} className="bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">&times;</button>
            </div>
            <div className="flex-1 bg-slate-200 flex items-center justify-center relative">
              {viewModal.isLoadingPdf ? (
                <div className="flex flex-col items-center gap-3"><svg className="animate-spin w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><p className="text-slate-600 font-semibold">Loading PDF...</p></div>
              ) : (
                <object data={viewModal.fileUrl} type="application/pdf" className="w-full h-full">
                  <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                    <p className="text-slate-600 font-medium">Your browser cannot preview this PDF directly.</p>
                    <a href={viewModal.fileUrl} download={`${viewModal.title}.pdf`} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">Download to View</a>
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