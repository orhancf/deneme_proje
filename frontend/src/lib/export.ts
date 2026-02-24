import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from './api';

export function exportToCsv(filename: string, data: any[], columns?: { key: string; label: string }[]) {
    if (!data || data.length === 0) return;

    const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
    const headerRow = cols.map(c => c.label).join(',');

    const rows = data.map(row =>
        cols.map(c => {
            const val = row[c.key];
            // Escape quotes and wrap in quotes if there's a comma
            if (typeof val === 'string') {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val !== null && val !== undefined ? val : '';
        }).join(',')
    );

    const csvContent = [headerRow, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('url');
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Audit log (fire and forget)
    api.logAudit({
        action: 'EXPORT',
        resource: `${filename}.csv`,
        details: { rowCount: data.length, columns: cols.map(c => c.key) }
    }).catch(console.error);
}

export function exportToPdf(title: string, filename: string, data: any[], columns?: { key: string; label: string }[]) {
    if (!data || data.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));

    const tableData = data.map(row =>
        cols.map(c => row[c.key] !== null && row[c.key] !== undefined ? String(row[c.key]) : '')
    );

    autoTable(doc, {
        head: [cols.map(c => c.label)],
        body: tableData,
        startY: 28,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
    });

    doc.save(`${filename}.pdf`);

    // Audit log (fire and forget)
    api.logAudit({
        action: 'EXPORT',
        resource: `${filename}.pdf`,
        details: { rowCount: data.length, columns: cols.map(c => c.key) }
    }).catch(console.error);
}
