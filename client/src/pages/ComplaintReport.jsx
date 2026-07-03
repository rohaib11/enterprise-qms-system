import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Icons ---
const DocumentTextIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TableIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ShieldAlertIcon = () => <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const Spinner = () => <svg className="animate-spin w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function ComplaintReport() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/complaints')
      .then(res => res.json())
      .then(fetchedData => {
        setComplaints(fetchedData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch complaints data:", err);
        setIsLoading(false);
      });
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = complaints.filter(item => {
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

    let searchMatch = true;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      searchMatch = 
        (item.complaintNo && item.complaintNo.toLowerCase().includes(lowerSearch)) ||
        (item.dealershipName && item.dealershipName.toLowerCase().includes(lowerSearch)) ||
        (item.vin && item.vin.toLowerCase().includes(lowerSearch)) ||
        (item.problem && item.problem.toLowerCase().includes(lowerSearch));
    }

    return dateMatch && searchMatch;
  });

  // --- COMPUTE ANALYTICS ---
  const computeStats = (items) => {
    const total = items.length;
    let manufacturerLiability = 0;
    let pendingRFD = 0;
    let partReturns = 0;

    items.forEach(c => {
      if (c.liability === 'Manufacturer') manufacturerLiability++;
      if (!c.rfdDate) pendingRFD++;
      if (c.vehiclePartReturn && c.vehiclePartReturn.includes('Yes')) partReturns++;
    });

    return { total, manufacturerLiability, pendingRFD, partReturns };
  };

  const stats = computeStats(filteredData);

  // --- EXPORT TO EXCEL ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) return alert("No data found to export.");

    const excelRows = filteredData.map(c => ({
      "Complaint No": c.complaintNo,
      "Dealership Name": c.dealershipName,
      "Log Date": c.date,
      "Issue Date": c.issueDate || '-',
      "VIN": c.vin,
      "Colour": c.colour || '-',
      "Problem Description": c.problem || '-',
      "Found During": c.foundDuring || '-',
      "Solution / Cause": c.solutionCause || '-',
      "Action Taken": c.actionTaken || '-',
      "Part Return Status": c.vehiclePartReturn || '-',
      "RFD Date": c.rfdDate || 'Pending',
      "Liability Assignment": c.liability || '-'
    }));

    const mainSheet = XLSX.utils.json_to_sheet(excelRows);
    mainSheet['!cols'] = [
      { wch: 16 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, 
      { wch: 12 }, { wch: 35 }, { wch: 16 }, { wch: 35 }, { wch: 30 }, 
      { wch: 18 }, { wch: 12 }, { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, mainSheet, "Complaints Log");
    XLSX.writeFile(workbook, `Dealership_Complaints_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- EXPORT TO PDF (Premium Striped Corporate Layout) ---
  const handleExportPDF = () => {
    if (filteredData.length === 0) return alert("No data found to export.");

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Solid Edge-To-Edge Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 26, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text("QUALITY ASSURANCE NETWORK", margin, 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Dealership Complaints Analysis & Liability Tracking Report", margin, 19);

    // Metadata Right-Align Alignment
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 12, { align: 'right' });
    doc.setTextColor(148, 163, 184);
    doc.text(`DOC REF: SEWL-DCR-2026-V1`, pageWidth - margin, 19, { align: 'right' });

    // Table Row Map Engineering
    const tableRows = filteredData.map(c => [
      c.complaintNo,
      c.dealershipName,
      c.date,
      c.vin,
      c.problem || '-',
      c.solutionCause || '-',
      c.actionTaken || '-',
      c.liability || 'Pending',
      c.rfdDate || 'Open'
    ]);

    autoTable(doc, {
      startY: 32,
      margin: { left: margin, right: margin },
      head: [[ 'Complaint#', 'Dealership Name', 'Log Date', 'VIN', 'Problem', 'Solution / Cause', 'Action Taken', 'Liability', 'RFD Date' ]],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 7.2, cellPadding: 2, textColor: [51, 65, 85], font: 'helvetica' },
      headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: 'bold' }, // Emerald-700
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold' },
        1: { cellWidth: 32 },
        2: { cellWidth: 18 },
        3: { cellWidth: 32, fontStyle: 'bold' },
        4: { cellWidth: 45 },
        5: { cellWidth: 45 },
        6: { cellWidth: 40 }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 12;
    if (finalY > 160) { doc.addPage(); finalY = 20; }

    // Bottom Analytical Panel
    const boxW = 85;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, finalY, boxW, 34, 2, 2, 'S');
    
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, finalY, boxW, 8, 2, 2, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text("COMPLAINT DATA ANALYSIS", margin + 4, finalY + 5.5);

    const summaryData = [
      ['Total Complaints Evaluated', stats.total.toString()],
      ['Manufacturer Liability Cases', stats.manufacturerLiability.toString()],
      ['Component / Part Returns', stats.partReturns.toString()],
      ['Unresolved (Open RFD) Issues', stats.pendingRFD.toString()]
    ];

    let rowY = finalY + 13;
    summaryData.forEach(([label, value]) => {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
      doc.text(label, margin + 4, rowY);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(value, margin + boxW - 4, rowY, { align: 'right' });
      rowY += 6;
    });

    // Signature Framework Mappings
    const sigX = margin + boxW + 25;
    const sigW = 45;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
    doc.text("Logged By (QA Engineer):", sigX, finalY + 10); doc.setDrawColor(148, 163, 184); doc.line(sigX + 35, finalY + 10, sigX + sigW + 35, finalY + 10);
    doc.text("Authorized By (Plant Manager):", sigX, finalY + 26); doc.line(sigX + 35, finalY + 26, sigX + sigW + 35, finalY + 26);

    doc.save(`Sazgar_Complaints_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all";

  return (
    <div className="space-y-6">
      
      {/* 1. Filter Block */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Complaint Report View</h2>
        <p className="text-sm text-slate-500 mb-6">Filter logged dealership queries and analyze metrics or generate spreadsheets.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Search Filters</label>
            <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><SearchIcon /></div>
            <input type="text" placeholder="VIN, Complaint No, Dealership..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10`} />
          </div>
          <div className="md:col-span-2">
            {(fromDate || toDate || searchTerm) && (
              <button onClick={() => { setFromDate(''); setToDate(''); setSearchTerm(''); }} className="w-full text-sm font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 py-2.5 rounded-xl transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Analytical Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <div><p className="text-sm font-semibold text-slate-500">Total Logs</p><p className="text-2xl font-bold text-slate-800">{stats.total}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0"><ShieldAlertIcon /></div>
          <div><p className="text-sm font-semibold text-slate-500">Mfg Liabilities</p><p className="text-2xl font-bold text-rose-600">{stats.manufacturerLiability}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" /></svg>
          </div>
          <div><p className="text-sm font-semibold text-slate-500">Part Returns</p><p className="text-2xl font-bold text-slate-800">{stats.partReturns}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div><p className="text-sm font-semibold text-slate-500">Open RFD</p><p className="text-2xl font-bold text-slate-800">{stats.pendingRFD}</p></div>
        </div>
      </div>

      {/* 3. Data Table Preview Wrapper */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-md font-bold text-slate-800">Filtered Evaluation Records</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify your compiled results prior to downloading files.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleExportExcel} disabled={filteredData.length === 0 || isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
              <TableIcon /> Export Excel
            </button>
            <button onClick={handleExportPDF} disabled={filteredData.length === 0 || isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
              <DocumentTextIcon /> Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[350px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 bg-white">
              <Spinner />
              <span className="text-slate-400 text-xs font-semibold">Aggregating Quality Mappings...</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 relative">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase text-slate-500 font-bold sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="py-3 px-6">Complaint No</th>
                  <th className="py-3 px-6">Dealership Name</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">VIN</th>
                  <th className="py-3 px-6 text-center">Liability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredData.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-800">{row.complaintNo}</td>
                    <td className="py-3 px-6 text-slate-700">{row.dealershipName}</td>
                    <td className="py-3 px-6 whitespace-nowrap">{row.date}</td>
                    <td className="py-3 px-6 font-mono text-xs">{row.vin}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                        row.liability === 'Manufacturer' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        row.liability === 'Dealership' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {row.liability || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-medium">No complaints matched the criteria.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}