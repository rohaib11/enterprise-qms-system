import React, { useState, useEffect } from 'react';

// --- Icons ---
const UploadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DocumentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const EyeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function RCAReports() {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editMode, setEditMode] = useState({ isEditing: false, id: null });
  
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [viewModal, setViewModal] = useState({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });

  const fetchReports = () => {
    fetch('http://localhost:5000/api/rca/reports')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error("Failed to fetch reports:", err));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return setMsg({ type: 'error', text: 'Please provide a document title.' });
    if (!editMode.isEditing && !file) return setMsg({ type: 'error', text: 'Please select a PDF file to upload.' });

    setIsLoading(true);
    setMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('title', title);
    if (file) formData.append('report', file); 

    const url = editMode.isEditing 
      ? `http://localhost:5000/api/rca/reports/${editMode.id}` 
      : 'http://localhost:5000/api/rca/reports';
    
    const method = editMode.isEditing ? 'PUT' : 'POST';

    fetch(url, { method, body: formData })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data.error) return setMsg({ type: 'error', text: data.error });
        
        setMsg({ type: 'success', text: editMode.isEditing ? 'Report updated successfully!' : 'Report uploaded successfully!' });
        handleCancelEdit();
        fetchReports();
      })
      .catch(() => {
        setIsLoading(false);
        setMsg({ type: 'error', text: 'Server connection failed.' });
      });
  };

  const handleEditClick = (doc) => {
    setEditMode({ isEditing: true, id: doc.id });
    setTitle(doc.title);
    setFile(null);
    document.getElementById('file-upload').value = ''; 
    setMsg({ type: 'info', text: 'Editing mode active. You can update the title, or select a new PDF to overwrite the old one.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditMode({ isEditing: false, id: null });
    setTitle('');
    setFile(null);
    document.getElementById('file-upload').value = ''; 
    if (msg.type === 'info') setMsg({ type: '', text: '' });
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this report? This cannot be undone.")) {
      fetch(`http://localhost:5000/api/rca/reports/${id}`, { method: 'DELETE' })
        .then(() => {
          if (editMode.id === id) handleCancelEdit();
          fetchReports();
        });
    }
  };

  // --- STEALTH MODE: 100% IDM Bypass Function ---
  const handleViewPdf = async (filename, docTitle) => {
    setViewModal({ isOpen: true, fileUrl: '', title: docTitle, isLoadingPdf: true });
    
    try {
      const safeFilename = encodeURIComponent(filename);
      // Utilizing the new stealth route we added to the backend!
      const targetUrl = `http://localhost:5000/api/rca/view-pdf/${safeFilename}`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("Server failed to respond");
      
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      
      setViewModal({ isOpen: true, fileUrl: objectUrl, title: docTitle, isLoadingPdf: false });
    } catch (error) {
      console.error("Failed to fetch PDF:", error);
      setMsg({ type: 'error', text: 'Failed to load PDF. Check server connection.' });
      setViewModal({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });
    }
  };

  const handleCloseModal = () => {
    if (viewModal.fileUrl) {
      URL.revokeObjectURL(viewModal.fileUrl); // Clean up memory
    }
    setViewModal({ isOpen: false, fileUrl: '', title: '', isLoadingPdf: false });
  };

  // --- Filter Reports via Search Input ---
  const filteredReports = reports.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.uploadDate.toLowerCase().includes(searchLower)
    );
  });

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  return (
    <div className="space-y-6">
      
      {/* Upload/Edit Section */}
      <div className={`bg-white rounded-2xl shadow-sm border p-8 transition-all ${editMode.isEditing ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <DocumentIcon /> {editMode.isEditing ? 'Modify RCA Report' : 'Upload New RCA Report'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage comprehensive PDF Root Cause Analysis documents.</p>
          </div>
          {editMode.isEditing && (
            <button onClick={handleCancelEdit} className="text-sm font-bold text-rose-500 hover:bg-rose-100 px-4 py-2 bg-rose-50 rounded-lg transition-colors">
              Cancel Edit
            </button>
          )}
        </div>
        
        {msg.text && (
          <div className={`p-3 rounded-xl mb-6 text-sm font-medium text-center ${
            msg.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
            msg.type === 'info' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
            'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Q3 Assembly Defect Analysis" className={inputClass} />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {editMode.isEditing ? 'Replace PDF (Optional)' : 'PDF File'}
            </label>
            <input id="file-upload" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required={!editMode.isEditing} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${editMode.isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              <UploadIcon /> {isLoading ? 'Processing...' : editMode.isEditing ? 'Save Changes' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>

      {/* Library Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Interactive Search Header */}
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">RCA Document Library</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total Reports: <span className="font-bold text-indigo-600">{filteredReports.length}</span></p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search RCA documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <tr>
              <th className="py-4 px-8 w-1/2">Report Title</th>
              <th className="py-4 px-8">Upload Date</th>
              <th className="py-4 px-8 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-8 font-medium text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold border border-rose-100">PDF</div>
                  {doc.title}
                </td>
                <td className="py-4 px-8 text-slate-500">{doc.uploadDate}</td>
                <td className="py-4 px-8 flex justify-center gap-3">
                  <button onClick={() => handleViewPdf(doc.filename, doc.title)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View PDF">
                    <EyeIcon />
                  </button>
                  <button onClick={() => handleEditClick(doc)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Edit Record">
                    <EditIcon />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan="3" className="py-12 text-center text-slate-400 font-medium">
                  {reports.length === 0 ? "No reports uploaded yet." : "No documents found matching your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PDF View Modal */}
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