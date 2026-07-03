import { useState, useEffect } from 'react';

// --- Icons ---
const EyeIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Spinner = () => <svg className="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function PDIList({ setActiveItem }) {
  const [pdiData, setPdiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  
  // NEW: Toast notification state
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  const fetchData = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/pdi')
      .then(res => res.json())
      .then(data => {
        setPdiData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch:", err);
        showToast('Failed to load records. Check server.', 'error');
        setIsLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      fetch(`http://localhost:5000/api/pdi/${id}`, { method: 'DELETE' })
        .then(() => {
          showToast('Record deleted successfully!');
          fetchData();
        })
        .catch(() => showToast('Failed to delete record.', 'error'));
    }
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    
    // Automatically recalculate the highest severity category based on the edited rows
    const allCategories = editModal.data.inspectionDetails 
      ? editModal.data.inspectionDetails.map(i => i.category).filter(Boolean) 
      : [];
      
    let updatedCategory = 'Nill';
    if (allCategories.includes('V1')) updatedCategory = 'V1';
    else if (allCategories.includes('V2')) updatedCategory = 'V2';
    else if (allCategories.includes('V3')) updatedCategory = 'V3';
    else if (allCategories.length > 0) updatedCategory = allCategories.join(', ');

    const finalDataToSave = { ...editModal.data, category: updatedCategory };

    fetch(`http://localhost:5000/api/pdi/${editModal.data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalDataToSave)
    }).then(() => {
      setEditModal({ isOpen: false, data: null });
      showToast('Record updated successfully!');
      fetchData();
    }).catch(() => showToast('Failed to update record.', 'error'));
  };

  const handleEditTableChange = (itemId, field, value) => {
    const updatedDetails = editModal.data.inspectionDetails.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setEditModal({ ...editModal, data: { ...editModal.data, inspectionDetails: updatedDetails } });
  };

  // --- NEW: Add and Remove Rows inside Edit Modal ---
  const handleAddRow = () => {
    const newRow = { 
      id: Date.now(), 
      item: '', remarks: '', checkedBy: '', repairedBy: '', confirmedBy: '', category: 'Nill', report: '' 
    };
    const updatedDetails = [...(editModal.data.inspectionDetails || []), newRow];
    setEditModal({ ...editModal, data: { ...editModal.data, inspectionDetails: updatedDetails } });
  };

  const handleRemoveRow = (itemId) => {
    const updatedDetails = editModal.data.inspectionDetails.filter(item => item.id !== itemId);
    setEditModal({ ...editModal, data: { ...editModal.data, inspectionDetails: updatedDetails } });
  };

  // --- Search Filter Logic ---
  const filteredData = pdiData.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (row.vin && row.vin.toLowerCase().includes(searchLower)) ||
      (row.pdiNumber && row.pdiNumber.toLowerCase().includes(searchLower)) ||
      (row.model && row.model.toLowerCase().includes(searchLower))
    );
  });

  // --- UI Helpers ---
  const getCategoryColor = (categoryStr) => {
    if (!categoryStr) return "bg-slate-100 text-slate-600 border-slate-200";
    if (categoryStr.includes("V1")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (categoryStr.includes("V2")) return "bg-orange-50 text-orange-700 border-orange-200";
    if (categoryStr.includes("V3")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (categoryStr.includes("Nill") || categoryStr === "N/A") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  };

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";
  const tableInputClass = "w-full border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-1.5 text-sm transition-all outline-none";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-fade-in ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {toast.type === 'error' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Header & Search Bar */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800">PDI Records</h2>
          <p className="text-sm text-slate-500 mt-1">Manage, search, and view all Pre-Delivery Inspections.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search VIN, Model, or PDI #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          
          <button onClick={() => setActiveItem('Create')} className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Create PDI
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="overflow-x-auto flex-1 bg-slate-50/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Spinner />
            <span className="text-slate-500 text-sm font-medium">Loading records...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-6">PDI Number</th>
                <th className="py-4 px-6">Model</th>
                <th className="py-4 px-6">VIN#</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6 font-medium text-slate-800">{row.pdiNumber}</td>
                  <td className="py-4 px-6">{row.model}</td>
                  <td className="py-4 px-6 font-mono text-xs bg-slate-50 rounded px-2 group-hover:bg-white transition-colors">{row.vin}</td>
                  <td className="py-4 px-6">{row.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border truncate max-w-[150px] inline-block ${getCategoryColor(row.category)}`}>
                      {row.category || 'NILL'}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex justify-center gap-5">
                    <div onClick={() => setViewModal({ isOpen: true, data: row })} title="View Details"><EyeIcon /></div>
                    <div onClick={() => setEditModal({ isOpen: true, data: row })} title="Edit Record"><EditIcon /></div>
                    <div onClick={() => handleDelete(row.id)} title="Delete Record"><TrashIcon /></div>
                  </td>
                </tr>
              ))}
              
              {!isLoading && filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-slate-500 font-medium">No records found matching your search.</p>
                      <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-500 hover:text-indigo-600 text-sm font-semibold">Clear Search</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- VIEW MODAL --- */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Inspection Report</h3>
                  <p className="text-sm text-slate-500 font-mono mt-0.5">REF: {viewModal.data.pdiNumber}</p>
                </div>
              </div>
              <button onClick={() => setViewModal({ isOpen: false, data: null })} className="bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-500 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">&times;</button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              
              {/* Vehicle Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Vehicle Information</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div><p className="text-xs text-slate-500 mb-1">Model</p><p className="font-bold text-slate-800">{viewModal.data.model}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">VIN Number</p><p className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">{viewModal.data.vin}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Color (Ext / Int)</p><p className="font-semibold text-slate-800">{viewModal.data.exteriorColor} <span className="text-slate-300 mx-1">/</span> {viewModal.data.interiorColor}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Inspection Date</p><p className="font-semibold text-slate-800">{viewModal.data.date}</p></div>
                </div>
              </div>

              {/* Checklist Table */}
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Defect Checklist</h4>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 min-w-max">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-1/4">Inspection Item</th>
                        <th className="py-3 px-4 w-1/4">Observation / Remarks</th>
                        <th className="py-3 px-4">Personnel (Check/Repair/Confirm)</th>
                        <th className="py-3 px-4 text-center">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewModal.data.inspectionDetails && viewModal.data.inspectionDetails.length > 0 ? (
                        viewModal.data.inspectionDetails.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{item.item || '-'}</td>
                            <td className="p-4 text-slate-600">{item.remarks || <span className="text-slate-300 italic">No remarks</span>}</td>
                            <td className="p-4 text-xs text-slate-500 space-y-1">
                              <div><span className="font-semibold text-slate-700">C:</span> {item.checkedBy || '-'}</div>
                              <div><span className="font-semibold text-slate-700">R:</span> {item.repairedBy || '-'}</div>
                              <div><span className="font-semibold text-slate-700">Q:</span> {item.confirmedBy || '-'}</div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                                {item.category || 'NILL'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="py-12 text-center text-slate-400">No checklist defects recorded for this vehicle.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setViewModal({ isOpen: false, data: null })} className="bg-white border border-slate-200 shadow-sm hover:bg-slate-100 text-slate-700 font-bold px-6 py-2.5 rounded-xl transition-colors">Close View</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            
            <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-20 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Edit PDI Record</h3>
                <p className="text-sm text-indigo-600 font-mono font-semibold mt-0.5">{editModal.data.pdiNumber}</p>
              </div>
              <button onClick={() => setEditModal({ isOpen: false, data: null })} className="bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-500 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <form id="editForm" onSubmit={handleEditSave} className="space-y-8">
                
                {/* Top Details Editor */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Vehicle Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Model</label>
                      <input type="text" value={editModal.data.model} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, model: e.target.value}})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">VIN (17 chars)</label>
                      <input type="text" maxLength="17" value={editModal.data.vin} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, vin: e.target.value}})} className={`${inputClass} font-mono uppercase bg-slate-100`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Exterior Color</label>
                      <input type="text" value={editModal.data.exteriorColor} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, exteriorColor: e.target.value}})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Interior Color</label>
                      <input type="text" value={editModal.data.interiorColor} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, interiorColor: e.target.value}})} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Checklist Editor */}
                <div>
                  <div className="flex justify-between items-end mb-3 ml-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Edit Checklist Items</h4>
                    <button type="button" onClick={handleAddRow} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded border border-emerald-200 transition-colors">
                      + Add New Row
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600 min-w-max">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <tr>
                            <th className="py-3 px-3 min-w-[180px]">Item Name</th>
                            <th className="py-3 px-3 min-w-[200px]">Remarks</th>
                            <th className="py-3 px-3 min-w-[120px]">Checked By</th>
                            <th className="py-3 px-3 min-w-[120px]">Repaired By</th>
                            <th className="py-3 px-3 min-w-[120px]">Confirmed By</th>
                            <th className="py-3 px-3 min-w-[110px]">Category</th>
                            <th className="py-3 px-3 min-w-[150px]">Report Details</th>
                            <th className="py-3 px-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {editModal.data.inspectionDetails && editModal.data.inspectionDetails.length > 0 ? (
                            editModal.data.inspectionDetails.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50 focus-within:bg-indigo-50/30 transition-colors">
                                <td className="p-2"><input type="text" className={tableInputClass} value={item.item} onChange={(e) => handleEditTableChange(item.id, 'item', e.target.value)} /></td>
                                <td className="p-2"><input type="text" className={tableInputClass} value={item.remarks} onChange={(e) => handleEditTableChange(item.id, 'remarks', e.target.value)} /></td>
                                <td className="p-2"><input type="text" className={tableInputClass} value={item.checkedBy} onChange={(e) => handleEditTableChange(item.id, 'checkedBy', e.target.value)} /></td>
                                <td className="p-2"><input type="text" className={tableInputClass} value={item.repairedBy} onChange={(e) => handleEditTableChange(item.id, 'repairedBy', e.target.value)} /></td>
                                <td className="p-2"><input type="text" className={tableInputClass} value={item.confirmedBy} onChange={(e) => handleEditTableChange(item.id, 'confirmedBy', e.target.value)} /></td>
                                <td className="p-2">
                                  <select className={`${tableInputClass} cursor-pointer font-semibold`} value={item.category} onChange={(e) => handleEditTableChange(item.id, 'category', e.target.value)}>
                                    <option value="Nill" className="text-emerald-600">Nill</option>
                                    <option value="V1" className="text-rose-600">V1</option>
                                    <option value="V2" className="text-orange-600">V2</option>
                                    <option value="V3" className="text-amber-600">V3</option>
                                  </select>
                                </td>
                                <td className="p-2"><input type="text" className={tableInputClass} value={item.report} onChange={(e) => handleEditTableChange(item.id, 'report', e.target.value)} /></td>
                                <td className="p-2 text-center">
                                  <button type="button" onClick={() => handleRemoveRow(item.id)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors" title="Delete Row">
                                    <TrashIcon />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="8" className="py-10 text-center text-slate-400">No items available. Click "+ Add New Row" to insert an item.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => setEditModal({ isOpen: false, data: null })} className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition-colors">Cancel</button>
              <button type="submit" form="editForm" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}