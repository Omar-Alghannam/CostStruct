/**
 * Export Service
 * Handles CSV and PDF export for expenses and reports.
 * Uses SheetJS (xlsx) for CSV and jsPDF for PDF generation.
 */
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name for the downloaded file
 * @param {Array} columns - Column definitions [{ header, key }]
 */
export function exportToCSV(data, filename, columns) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((item) =>
    columns.map((c) => {
      const value = item[c.key];
      return value !== undefined && value !== null ? value : '';
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.csv`);
}

/**
 * Export data to PDF file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name for the downloaded file
 * @param {string} title - PDF document title
 * @param {Array} columns - Column definitions [{ header, key }]
 */
export function exportToPDF(data, filename, title, columns) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(22);
  doc.setTextColor(200, 30, 30);
  doc.text(title, 14, 22);

  // Stats Summary
  const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text(`Total Amount: ${totalAmount.toLocaleString()} EGP`, 14, 32);
  doc.text(`Total Records: ${data.length}`, 14, 38);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);

  // Table
  const headers = columns.map((c) => c.header);
  const rows = data.map((item) =>
    columns.map((c) => {
      const value = item[c.key];
      return value !== undefined && value !== null ? String(value) : '';
    })
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 52,
    theme: 'grid',
    headStyles: {
      fillColor: [200, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [250, 245, 245],
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
    },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Export chart as image
 * @param {HTMLElement} chartElement - The chart container DOM element
 * @param {string} filename - Name for the downloaded file
 */
export async function exportChartAsImage(chartRoot, filename) {
  if (chartRoot) {
    const exporting = chartRoot.plugins.exporting;
    if (exporting) {
      await exporting.export('png');
    }
  }
}
