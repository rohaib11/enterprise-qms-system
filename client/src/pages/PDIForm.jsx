import React, { useState } from 'react';

const vehicleData = {
  "BJ40": { exterior: ["Red", "Black", "Green", "White"], interior: ["Black", "Red/Black"] },
  "H6 1.5": { exterior: ["Ayers Grey", "Hamilton White", "Sun Black"], interior: ["Black", "Grey/Black"] },
  "H6 HEV": { exterior: ["Ayers Grey", "Hamilton White", "Sun Black"], interior: ["Black"] },
  "Jolion 1.5": { exterior: ["Blue", "White", "Grey", "Black"], interior: ["Black", "Beige"] },
  "ORA 03": { exterior: ["Cyan", "White", "Green"], interior: ["Green", "Black"] },
  "TANK 500 HEV": { exterior: ["Crystal Black", "Hamilton White", "Dune Gold"], interior: ["Black", "Blue/Beige"] }
};

// --- Icons ---
const LightningIcon = () => <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;

export default function PDIForm() {
  const [formData, setFormData] = useState({ pdiNumber: `SEWL-PDI-${Date.now().toString().slice(-5)}`, date: '', vin: '', model: '', exteriorColor: '', interiorColor: '' });
  const [inspectionItems, setInspectionItems] = useState([]);
  
  // NEW: State for Quick Fill Personnel feature
  const [quickFill, setQuickFill] = useState({ checkedBy: '', repairedBy: '', confirmedBy: '' });

  // Add row - Automatically pre-fills with Quick Fill data
  const addRow = () => {
    setInspectionItems([...inspectionItems, { 
      id: Date.now(), 
      selected: false, 
      item: '', 
      remarks: '', 
      checkedBy: quickFill.checkedBy, 
      repairedBy: quickFill.repairedBy, 
      confirmedBy: quickFill.confirmedBy, 
      category: '', 
      image: '', 
      report: '' 
    }]);
  };
  
  const deleteSelectedRows = () => {
    const remaining = inspectionItems.filter(item => !item.selected);
    setInspectionItems(remaining);
  };
  
  const handleRowChange = (id, field, value) => {
    setInspectionItems(inspectionItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // NEW: Apply Quick Fill data to all existing rows
  const applyQuickFillToAll = () => {
    if (inspectionItems.length === 0) return alert("Please add some rows to the checklist first.");
    
    setInspectionItems(inspectionItems.map(item => ({
      ...item,
      checkedBy: quickFill.checkedBy || item.checkedBy,
      repairedBy: quickFill.repairedBy || item.repairedBy,
      confirmedBy: quickFill.confirmedBy || item.confirmedBy
    })));
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'model') setFormData({ ...formData, model: value, exteriorColor: '', interiorColor: '' });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.vin.length !== 17) return alert("VIN must be exactly 17 characters!");

    const payload = {
      ...formData,
      category: inspectionItems.map(i => i.category).filter(Boolean).join(', ') || 'N/A',
      inspectionDetails: inspectionItems 
    };

    fetch('http://localhost:5000/api/pdi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
      if (data.error) return alert("Error: " + data.error);
      alert("Success! " + data.message);
      
      // Reset form
      setFormData({ pdiNumber: `SEWL-PDI-${Date.now().toString().slice(-5)}`, date: '', vin: '', model: '', exteriorColor: '', interiorColor: '' });
      setInspectionItems([]);
      setQuickFill({ checkedBy: '', repairedBy: '', confirmedBy: '' });
    });
  };

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const tableInputClass = "border border-slate-200 rounded-lg p-2 w-full text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white transition-all";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10">
      <div className="px-8 py-5 border-b border-slate-100 bg-white rounded-t-2xl">
        <h2 className="text-lg font-bold text-slate-800">Create PDI Record</h2>
        <p className="text-sm text-slate-500">Enter vehicle specifications and perform the inspection checklist.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        
        {/* --- Vehicle Specifications --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-100 pb-8">
          <div>
            <label className={labelClass}>PDI Reference No.</label>
            <input type="text" value={formData.pdiNumber} disabled className="w-full border border-slate-200 bg-slate-100 rounded-xl p-2.5 text-sm text-slate-500 font-bold font-mono cursor-not-allowed" />
          </div>
          <div>
            <label className={labelClass}>Inspection Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleFormChange} required className={inputClass} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
               <label className="block text-sm font-semibold text-slate-700">VIN Number</label>
               <span className={`text-xs font-bold font-mono ${formData.vin.length === 17 ? 'text-emerald-500' : 'text-slate-400'}`}>{formData.vin.length}/17</span>
            </div>
            <input type="text" name="vin" maxLength="17" value={formData.vin.toUpperCase()} onChange={handleFormChange} required placeholder="Enter 17 digit VIN" className={`${inputClass} uppercase font-mono tracking-wider`} />
          </div>
          
          <div>
            <label className={labelClass}>Vehicle Model</label>
            <select name="model" value={formData.model} onChange={handleFormChange} required className={inputClass}>
              <option value="">Select Variant</option>
              {Object.keys(vehicleData).map(model => <option key={model} value={model}>{model}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Exterior Color</label>
            <select name="exteriorColor" value={formData.exteriorColor} onChange={handleFormChange} required disabled={!formData.model} className={inputClass}>
              <option value="">Select Exterior</option>
              {formData.model && vehicleData[formData.model].exterior.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Interior Color</label>
            <select name="interiorColor" value={formData.interiorColor} onChange={handleFormChange} required disabled={!formData.model} className={inputClass}>
              <option value="">Select Interior</option>
              {formData.model && vehicleData[formData.model].interior.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* --- Dynamic Table Section --- */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-4">
            
            {/* Quick Fill Tool */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 w-full lg:w-auto shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <LightningIcon />
                <h3 className="text-sm font-bold text-slate-800">Quick Fill Personnel</h3>
                <span className="text-xs text-slate-500 ml-1">(Auto-fills new rows)</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <input type="text" placeholder="Checked By..." value={quickFill.checkedBy} onChange={(e) => setQuickFill({...quickFill, checkedBy: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="flex-1 w-full">
                  <input type="text" placeholder="Repaired By..." value={quickFill.repairedBy} onChange={(e) => setQuickFill({...quickFill, repairedBy: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="flex-1 w-full">
                  <input type="text" placeholder="Confirmed By..." value={quickFill.confirmedBy} onChange={(e) => setQuickFill({...quickFill, confirmedBy: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500" />
                </div>
                <button type="button" onClick={applyQuickFillToAll} className="w-full sm:w-auto whitespace-nowrap bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  Apply to All Rows
                </button>
              </div>
            </div>

            {/* Table Actions */}
            <div className="flex gap-2 w-full lg:w-auto shrink-0">
              <button type="button" onClick={deleteSelectedRows} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                <TrashIcon /> Delete Selected
              </button>
              <button type="button" onClick={addRow} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-emerald-200 transition-colors">
                <PlusIcon /> Add Item
              </button>
            </div>
          </div>

          {/* Expanded Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm text-slate-600 min-w-max">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Sel</th>
                  <th className="py-3 px-2 min-w-[180px]">Inspection Test Item</th>
                  <th className="py-3 px-2 min-w-[200px]">Observation/Remarks</th>
                  <th className="py-3 px-2 min-w-[120px]">Checked By</th>
                  <th className="py-3 px-2 min-w-[120px]">Repaired By</th>
                  <th className="py-3 px-2 min-w-[120px]">Confirmed By</th>
                  <th className="py-3 px-2 min-w-[120px]">Category</th>
                  <th className="py-3 px-2 min-w-[150px]">Image</th>
                  <th className="py-3 px-2 min-w-[160px]">Investigation Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-slate-50/30">
                {inspectionItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center">
                      <p className="text-slate-400 font-medium text-base mb-2">No inspection items added yet.</p>
                      <p className="text-slate-400 text-sm">Click the green "+ Add Item" button to start the checklist.</p>
                    </td>
                  </tr>
                ) : (
                  inspectionItems.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-indigo-50/30 transition-colors">
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={row.selected} onChange={(e) => handleRowChange(row.id, 'selected', e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                      </td>
                      <td className="p-2">
                        <input type="text" placeholder="e.g., Paint scratch" className={tableInputClass} value={row.item} onChange={(e) => handleRowChange(row.id, 'item', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="text" placeholder="Details..." className={tableInputClass} value={row.remarks} onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="text" className={tableInputClass} value={row.checkedBy} onChange={(e) => handleRowChange(row.id, 'checkedBy', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="text" className={tableInputClass} value={row.repairedBy} onChange={(e) => handleRowChange(row.id, 'repairedBy', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="text" className={tableInputClass} value={row.confirmedBy} onChange={(e) => handleRowChange(row.id, 'confirmedBy', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <select 
                          className={`${tableInputClass} cursor-pointer font-bold ${
                            row.category === 'V1' ? 'text-rose-600 bg-rose-50' : 
                            row.category === 'V2' ? 'text-orange-600 bg-orange-50' : 
                            row.category === 'V3' ? 'text-amber-600 bg-amber-50' : 
                            row.category === 'Nill' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600'
                          }`} 
                          value={row.category} 
                          onChange={(e) => handleRowChange(row.id, 'category', e.target.value)}
                        >
                          <option value="">--</option>
                          <option value="V1">V1</option>
                          <option value="V2">V2</option>
                          <option value="V3">V3</option>
                          <option value="Nill">Nill</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input type="file" accept="image/*" className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer w-full bg-white border border-slate-200 rounded-lg" onChange={(e) => handleRowChange(row.id, 'image', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="text" placeholder="Ref link/ID" className={tableInputClass} value={row.report} onChange={(e) => handleRowChange(row.id, 'report', e.target.value)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Footer Actions --- */}
        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button type="submit" disabled={inspectionItems.length === 0} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-3.5 rounded-xl font-bold shadow-sm shadow-indigo-200 transition-colors flex items-center gap-2">
            <CheckIcon /> Submit PDI Record
          </button>
        </div>
      </form>
    </div>
  );
}