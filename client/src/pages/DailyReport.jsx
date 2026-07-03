import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Icons ---
const DocumentTextIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TableIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ChartIcon = () => <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const AlertIcon = () => <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckBadgeIcon = () => <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Spinner = () => <svg className="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function DailyReport() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/pdi')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch PDI data:", err);
        setIsLoading(false);
      });
  }, []);

  // --- FILTER LOGIC ---
  const getFilteredData = () => {
    return data.filter(item => {
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
          (item.vin && item.vin.toLowerCase().includes(lowerSearch)) ||
          (item.model && item.model.toLowerCase().includes(lowerSearch)) ||
          (item.pdiNumber && item.pdiNumber.toLowerCase().includes(lowerSearch));
      }

      return dateMatch && searchMatch;
    });
  };

  const filteredData = getFilteredData();

  // Helper to securely parse JSON details
  const parseDetails = (detailsStr) => {
    if (!detailsStr) return [];
    if (typeof detailsStr !== 'string') return detailsStr;
    try { return JSON.parse(detailsStr) || []; } 
    catch (e) { return []; }
  };

  const computeStats = (vehicles) => {
    let totalVehicles = vehicles.length;
    let v1Count = 0, v2Count = 0, v3Count = 0, nillCount = 0;

    vehicles.forEach(vehicle => {
      const details = parseDetails(vehicle.inspectionDetails);
      if (details.length === 0) {
        nillCount++;
      } else {
        details.forEach(item => {
          if (item.category === 'V1') v1Count++;
          else if (item.category === 'V2') v2Count++;
          else if (item.category === 'V3') v3Count++;
          else if (item.category === 'Nill' || !item.category) nillCount++;
        });
      }
    });

    const totalDefectVehicles = v1Count + v2Count + v3Count;
    const ratio = totalVehicles > 0 ? (totalDefectVehicles / totalVehicles) * 100 : 0; 
    return { totalVehicles, v1Count, v2Count, v3Count, nillCount, ratio, totalDefectVehicles };
  };

  const stats = computeStats(filteredData);

  // --- EXPORT TO EXCEL (unchanged) ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) return alert("No data found to export.");

    const excelData = [];
    filteredData.forEach(vehicle => {
      const details = parseDetails(vehicle.inspectionDetails);

      if (details.length === 0) {
        excelData.push({
          "PDI Number": vehicle.pdiNumber, "Date": vehicle.date, "VIN": vehicle.vin, "Model": vehicle.model,
          "EXR Color": vehicle.exteriorColor || '-', "INT Color": vehicle.interiorColor || '-',
          "Inspection Item": "No Defects", "Observation": "", "Checked By": "", "Repaired By": "", "Confirmed By": "", "Category": "Nill"
        });
      } else {
        details.forEach(item => {
          excelData.push({
            "PDI Number": vehicle.pdiNumber, "Date": vehicle.date, "VIN": vehicle.vin, "Model": vehicle.model,
            "EXR Color": vehicle.exteriorColor || '-', "INT Color": vehicle.interiorColor || '-',
            "Inspection Item": item.item || '-', "Observation": item.remarks || '-', "Checked By": item.checkedBy || '-',
            "Repaired By": item.repairedBy || '-', "Confirmed By": item.confirmedBy || '-', "Category": item.category || '-'
          });
        });
      }
    });

    const mainSheet = XLSX.utils.json_to_sheet(excelData);
    mainSheet['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];

    const summaryData = [
      [" QUALITY REPORT", ""],
      ["Generated", new Date().toLocaleString()],
      ["", ""],
      ["Metric", "Value"],
      ["Total Vehicles Inspected", stats.totalVehicles],
      ["Total Defects Logged", stats.totalDefectVehicles],
      ["V1 Defects (Critical)", stats.v1Count],
      ["V2 Defects (Major)", stats.v2Count],
      ["V3 Defects (Minor)", stats.v3Count],
      ["Nill (Clean Vehicles)", stats.nillCount],
      ["Defect Ratio (%)", `${stats.ratio.toFixed(2)}%`]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, mainSheet, "Defect Details");
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Analytics");
    XLSX.writeFile(workbook, `PDI_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- UPGRADED: EXPORT TO PDF (enhanced design, no logo) ---
  const handleExportPDF = () => {
    if (filteredData.length === 0) return alert("No data found to export.");

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;

    // Colors
    const primaryColor = [30, 41, 59];   // slate-800
    const accentColor = [71, 85, 105];   // slate-600
    const lightBg = [248, 250, 252];     // slate-50
    const textDark = [15, 23, 42];       // slate-900
    const textMuted = [100, 116, 139];   // slate-500
    const borderColor = [203, 213, 225]; // slate-300

    // --- Page callback for header/footer on every page ---
    const addHeaderFooter = (data) => {
      const pageCount = doc.internal.getNumberOfPages();

      // Header bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 9, 'F');

      // Title on each page (condensed)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text("QUALITY MANAGEMENT SYSTEM", margin, 6);

      // Footer
      const footerY = pageHeight - 8;
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.2);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text("CONFIDENTIAL", margin, footerY);
      doc.text(`Page ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
    };

    // --- Prepare table data ---
    const tableRows = [];
    filteredData.forEach(vehicle => {
      const details = parseDetails(vehicle.inspectionDetails);
      if (details.length === 0) {
        tableRows.push([vehicle.vin, vehicle.model, vehicle.exteriorColor || '-', vehicle.interiorColor || '-', 'No Defects', '', '', '', '', 'Nill']);
      } else {
        details.forEach((item, index) => {
          const isFirst = index === 0;
          tableRows.push([
            isFirst ? vehicle.vin : '',
            isFirst ? vehicle.model : '',
            isFirst ? vehicle.exteriorColor || '' : '',
            isFirst ? vehicle.interiorColor || '' : '',
            item.item || '-',
            item.remarks || '-',
            item.checkedBy || '-',
            item.repairedBy || '-',
            item.confirmedBy || '-',
            item.category || '-'
          ]);
        });
      }
    });

    // --- Parameters block (only on first page, just before table) ---
    const fDateStr = fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : 'All Time';
    const tDateStr = toDate ? new Date(toDate).toLocaleDateString('en-GB') : 'All Time';
    let paramY = 15;
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.text("Report Parameters", margin, paramY);
    paramY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Range: ${fDateStr} to ${tDateStr}`, margin, paramY);
    if (searchTerm) {
      paramY += 4;
      doc.text(`Search: "${searchTerm}"`, margin, paramY);
    }

    // --- Main table ---
    const tableStartY = paramY + 8;
    autoTable(doc, {
      startY: tableStartY,
      margin: { left: margin, right: margin },
      head: [['VIN', 'Model', 'Exterior', 'Interior', 'Inspection Item', 'Observation / Remarks', 'Check', 'Repair', 'Confirm', 'Cat']],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 7, cellPadding: 1.8, textColor: [51, 65, 85], font: 'helvetica' },
      headStyles: { fillColor: accentColor, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
      alternateRowStyles: { fillColor: lightBg },
      columnStyles: { 0: { cellWidth: 36, fontStyle: 'bold' }, 1: { cellWidth: 17 }, 4: { cellWidth: 44 }, 5: { cellWidth: 42 }, 9: { halign: 'center', fontStyle: 'bold' } },
      didDrawPage: addHeaderFooter
    });

    // --- Summary & Signatures (only on last page) ---
    let finalY = doc.lastAutoTable.finalY + 12;
    if (finalY > pageHeight - 45) {
      doc.addPage();
      finalY = 20;
    }

    // Summary Box
    const boxW = 85;
    const boxX = margin;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.roundedRect(boxX, finalY, boxW, 50, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("ANALYTICS SUMMARY", boxX + 4, finalY + 5);

    const summaryRows = [
      ['Total Vehicles Inspected', stats.totalVehicles.toString()],
      ['Critical (V1)', stats.v1Count.toString()],
      ['Major (V2)', stats.v2Count.toString()],
      ['Minor (V3)', stats.v3Count.toString()],
      ['Clean (Nill)', stats.nillCount.toString()],
      ['Defect Ratio', `${stats.ratio.toFixed(2)}%`]
    ];

    let rowY = finalY + 13;
    summaryRows.forEach(([label, value]) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(label, boxX + 4, rowY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textDark);
      doc.text(value, boxX + boxW - 4, rowY, { align: 'right' });
      rowY += 6.2;
    });

    // Signatures
    const sigStartX = boxX + boxW + 16;
    const sigWidth = 48;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);

    const sigLines = [
      { label: 'Prepared By', y: finalY + 8 },
      { label: 'Checked By', y: finalY + 24 },
      { label: 'Approved By', y: finalY + 40 }
    ];

    sigLines.forEach(sig => {
      doc.text(sig.label, sigStartX, sig.y);
      doc.setDrawColor(160, 174, 192);
      doc.setLineWidth(0.2);
      doc.line(sigStartX + 22, sig.y, sigStartX + sigWidth + 22, sig.y);
    });

    // --- Save ---
    doc.save(`Sazgar_QMS_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  return (
    <div className="space-y-6">
      
      {/* 1. FILTER CONTROLS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Report Builder</h2>
        <p className="text-sm text-slate-500 mb-6">Filter by date or search specific vehicles to generate your custom report.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-4 relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Search Query</label>
            <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><SearchIcon /></div>
            <input type="text" placeholder="VIN, Model, or PDI No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10`} />
          </div>
          <div className="md:col-span-2">
            {(fromDate || toDate || searchTerm) && (
              <button onClick={() => { setFromDate(''); setToDate(''); setSearchTerm(''); }} className="w-full text-sm font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 py-3 rounded-xl transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. LIVE ANALYTICS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><ChartIcon /></div>
          <div><p className="text-sm font-semibold text-slate-500">Total Vehicles</p><p className="text-2xl font-bold text-slate-800">{stats.totalVehicles}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><CheckBadgeIcon /></div>
          <div><p className="text-sm font-semibold text-slate-500">Clean (Nill)</p><p className="text-2xl font-bold text-slate-800">{stats.nillCount}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0"><AlertIcon /></div>
          <div><p className="text-sm font-semibold text-slate-500">Critical (V1)</p><p className="text-2xl font-bold text-slate-800">{stats.v1Count}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div><p className="text-sm font-semibold text-slate-500">Defect Ratio</p><p className="text-2xl font-bold text-slate-800">{stats.ratio.toFixed(1)}%</p></div>
        </div>
      </div>

      {/* 3. DATA PREVIEW & EXPORT ACTIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-md font-bold text-slate-800">Data Preview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Showing records matching your active filters.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleExportExcel} disabled={filteredData.length === 0 || isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
              <TableIcon /> Export Excel
            </button>
            <button onClick={handleExportPDF} disabled={filteredData.length === 0 || isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
              <DocumentTextIcon /> Export PDF
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 bg-white">
              <Spinner />
              <span className="text-slate-500 text-sm font-medium">Fetching database records...</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 relative">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">PDI No.</th>
                  <th className="py-3 px-6">Model</th>
                  <th className="py-3 px-6">VIN</th>
                  <th className="py-3 px-6 text-center">Max Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.slice(0, 50).map(row => {
                  const category = row.category || 'Nill';
                  const catColor = category.includes('V1') ? 'bg-rose-100 text-rose-700' : 
                                   category.includes('V2') ? 'bg-orange-100 text-orange-700' : 
                                   category.includes('V3') ? 'bg-amber-100 text-amber-700' : 
                                   'bg-emerald-100 text-emerald-700';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-3 px-6 whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-6 font-medium text-slate-800">{row.pdiNumber}</td>
                      <td className="py-3 px-6">{row.model}</td>
                      <td className="py-3 px-6 font-mono text-xs">{row.vin}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${catColor}`}>
                          {category}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filteredData.length > 50 && (
                  <tr><td colSpan="5" className="py-4 text-center text-xs font-bold text-slate-400 uppercase bg-slate-50">+ {filteredData.length - 50} more records included in export</td></tr>
                )}
                {filteredData.length === 0 && (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">No records found matching criteria.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
}