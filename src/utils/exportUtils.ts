import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface ExportColumn {
  header: string;
  dataKey: string;
  width?: number;
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  orientation?: 'portrait' | 'landscape';
  showDate?: boolean;
}

/**
 * Export data to PDF format
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  const doc = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, 14, 15);

  // Add subtitle if provided
  let yPosition = 22;
  if (options.subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, 14, yPosition);
    yPosition += 7;
  }

  // Add date if requested
  if (options.showDate !== false) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, yPosition);
    yPosition += 10;
  }

  // Prepare table data
  const tableData = data.map(item => 
    columns.map(col => {
      const value = item[col.dataKey];
      if (value === null || value === undefined) return '-';
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
        return `${value.min}-${value.max}`;
      }
      return String(value);
    })
  );

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 10, left: 14, right: 14 },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, any>),
  });

  // Add page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageSize.width - 30,
      pageHeight - 10
    );
  }

  // Save the PDF
  doc.save(`${options.filename}_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.pdf`);
}

/**
 * Export data to Excel format
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  // Prepare worksheet data
  const wsData = [
    // Title row
    [options.title],
    ...(options.subtitle ? [[options.subtitle]] : []),
    ...(options.showDate !== false ? [[`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`]] : []),
    [], // Empty row
    // Header row
    columns.map(col => col.header),
    // Data rows
    ...data.map(item =>
      columns.map(col => {
        const value = item[col.dataKey];
        if (value === null || value === undefined) return '-';
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          return `${value.min}-${value.max}`;
        }
        return value;
      })
    ),
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style the title row
  if (ws['A1']) {
    ws['A1'].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'left' },
    };
  }

  // Set column widths
  const colWidths = columns.map(col => ({
    wch: col.width ? col.width / 5 : 15,
  }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${options.filename}_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`);
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  // Prepare CSV data
  const csvData = [
    // Header row
    columns.map(col => col.header),
    // Data rows
    ...data.map(item =>
      columns.map(col => {
        const value = item[col.dataKey];
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.join('; ');
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          return `${value.min}-${value.max}`;
        }
        const strValue = String(value);
        // Escape quotes and wrap in quotes if contains comma
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
    ),
  ];

  // Convert to CSV string
  const csvContent = csvData.map(row => row.join(',')).join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });

  saveAs(blob, `${options.filename}_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`);
}
