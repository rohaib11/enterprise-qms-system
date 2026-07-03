import React, { useState, useCallback } from 'react';

// --- Icons ---
const DocumentAddIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);
const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ComplaintForm() {
  const initialForm = {
    complaintNo: `CMP-${Date.now().toString().slice(-6)}`,
    dealershipName: '',
    date: '',
    issueDate: '',
    vin: '',
    colour: '',
    problem: '',
    foundDuring: '',
    solutionCause: '',
    vehiclePartReturn: '',
    actionTaken: '',
    rfdDate: '',
    liability: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const dealerships = [
    "Sazgar Platinum Motors",
    "Sazgar Central Auto",
    "Sazgar East Dealership",
    "Sazgar North Point",
    "Other"
  ];

  // Central API helper with JWT
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData(prev => ({
      ...initialForm,
      complaintNo: `CMP-${Date.now().toString().slice(-6)}`
    }));
    setFile(null);
    document.getElementById('file-upload').value = '';
    showToast('Form cleared successfully.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.dealershipName || !formData.date || !formData.vin) {
      showToast('Please fill in Dealership, Date, and VIN.', 'error');
      return;
    }
    if (formData.vin.length !== 17) {
      showToast('VIN must be exactly 17 characters!', 'error');
      return;
    }

    setIsLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      payload.append(key, formData[key]);
    });
    if (file) payload.append('complaint_file', file);

    try {
      const res = await apiFetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        body: payload
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showToast('Complaint filed successfully!', 'success');

      // Reset form
      setFormData(prev => ({
        ...initialForm,
        complaintNo: `CMP-${Date.now().toString().slice(-6)}`
      }));
      setFile(null);
      document.getElementById('file-upload').value = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast(err.message || 'Server connection failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full border rounded-xl p-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
      (fieldName === 'dealershipName' && !formData.dealershipName) ||
      (fieldName === 'date' && !formData.date) ||
      (fieldName === 'vin' && formData.vin.length > 0 && formData.vin.length !== 17)
        ? 'border-rose-300 bg-rose-50 focus:bg-white'
        : 'border-slate-200 bg-slate-50 focus:bg-white'
    }`;

  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden relative">
      {/* Toast */}
      {toast.show && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-fade-in ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <DocumentAddIcon /> Complaint Dealership Form
        </h2>
        <p className="text-sm text-slate-500 mt-1">Log a new issue reported by a dealership.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {/* Section 1: Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 border-b border-slate-100 pb-8">
          <div>
            <label className={labelClass}>Complaint No</label>
            <input
              type="text"
              name="complaintNo"
              value={formData.complaintNo}
              onChange={handleFormChange}
              required
              className={`${inputClass('complaintNo')} font-mono font-bold bg-slate-100 cursor-not-allowed`}
              disabled
            />
          </div>
          <div>
            <label className={labelClass}>Dealership Name *</label>
            <select
              name="dealershipName"
              value={formData.dealershipName}
              onChange={handleFormChange}
              required
              className={inputClass('dealershipName')}
            >
              <option value="">Please Select Dealer</option>
              {dealerships.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleFormChange} required className={inputClass('date')} />
          </div>
          <div>
            <label className={labelClass}>Issue Date</label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleFormChange} className={inputClass('issueDate')} />
          </div>
        </div>

        {/* Section 2: Vehicle Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-100 pb-8">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelClass}>VIN# *</label>
              <span className={`text-xs font-mono font-bold ${
                formData.vin.length === 17 ? 'text-emerald-500' : formData.vin.length > 0 ? 'text-rose-500' : 'text-slate-400'
              }`}>
                {formData.vin.length}/17
              </span>
            </div>
            <input
              type="text"
              name="vin"
              maxLength="17"
              value={formData.vin.toUpperCase()}
              onChange={handleFormChange}
              required
              placeholder="Enter 17 digit VIN"
              className={`${inputClass('vin')} uppercase font-mono tracking-wider`}
            />
          </div>
          <div>
            <label className={labelClass}>Colour</label>
            <input type="text" name="colour" value={formData.colour} onChange={handleFormChange} placeholder="e.g., Red" className={inputClass('colour')} />
          </div>
          <div>
            <label className={labelClass}>Found During</label>
            <input type="text" name="foundDuring" value={formData.foundDuring} onChange={handleFormChange} placeholder="e.g., PDI, Delivery" className={inputClass('foundDuring')} />
          </div>
        </div>

        {/* Section 3: Descriptive Details */}
        <div className="space-y-6 mb-8 border-b border-slate-100 pb-8">
          <div>
            <label className={labelClass}>Problem</label>
            <textarea name="problem" value={formData.problem} onChange={handleFormChange} rows="3" placeholder="Describe the reported problem in detail..." className={inputClass('problem')} />
          </div>
          <div>
            <label className={labelClass}>Solution / Cause</label>
            <textarea name="solutionCause" value={formData.solutionCause} onChange={handleFormChange} rows="3" placeholder="What is the root cause or proposed solution?" className={inputClass('solutionCause')} />
          </div>
          <div>
            <label className={labelClass}>Action Taken</label>
            <textarea name="actionTaken" value={formData.actionTaken} onChange={handleFormChange} rows="2" placeholder="What actions were taken?" className={inputClass('actionTaken')} />
          </div>
        </div>

        {/* Section 4: Resolution & Attachments */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className={labelClass}>Vehicle/Part Return</label>
            <select name="vehiclePartReturn" value={formData.vehiclePartReturn} onChange={handleFormChange} className={inputClass('vehiclePartReturn')}>
              <option value="">-- Select --</option>
              <option value="Yes - Vehicle">Yes - Vehicle</option>
              <option value="Yes - Part Only">Yes - Part Only</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Liability</label>
            <select name="liability" value={formData.liability} onChange={handleFormChange} className={inputClass('liability')}>
              <option value="">-- Select --</option>
              <option value="Dealership">Dealership</option>
              <option value="Transporter">Transporter</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Customer">Customer</option>
              <option value="Pending/Unknown">Pending/Unknown</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>RFD Date</label>
            <input type="date" name="rfdDate" value={formData.rfdDate} onChange={handleFormChange} className={inputClass('rfdDate')} />
          </div>
          <div>
            <label className={labelClass}>Images/Video Upload</label>
            <input
              id="file-upload"
              type="file"
              accept="image/*,video/mp4"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer h-[42px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white px-10 py-3.5 rounded-xl font-bold shadow-sm shadow-emerald-200 transition-colors flex items-center gap-2"
          >
            {isLoading ? <Spinner /> : <CheckIcon />}
            {isLoading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}