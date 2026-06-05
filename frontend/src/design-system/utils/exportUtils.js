/**
 * Client-side CSV / print helpers for ERP tables
 */

export function rowsToCsv(columns, rows) {
  const headers = columns.map((c) => c.label || c.key);
  const escape = (v) => {
    const s = v == null ? '' : String(v).replace(/"/g, '""');
    return `"${s}"`;
  };
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) =>
      columns
        .map((col) => {
          const val = col.render ? '' : row[col.key];
          return escape(val ?? '');
        })
        .join(',')
    ),
  ];
  return lines.join('\n');
}

export function downloadCsv(filename, columns, rows) {
  const csv = rowsToCsv(columns, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printElement(elementId) {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>Print</title>
    <style>
      body { font-family: Inter, sans-serif; font-size: 10pt; margin: 12mm; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
      th { background: #f1f3f5; font-size: 9pt; }
    </style></head><body>${el.innerHTML}</body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}
