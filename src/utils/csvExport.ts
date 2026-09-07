/**
 * Utility function to export an array of items to a downloadable CSV file.
 * Automatically handles escaping values containing commas, quotes, or newlines.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>,
  filename: string
): void {
  if (!data || data.length === 0) {
    return;
  }

  const keys = Object.keys(headers);
  const headerRow = keys.map(key => escapeCSVValue(headers[key])).join(',');

  const rows = data.map(item => {
    return keys.map(key => {
      let value = item[key];
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value = value.map(i => `${i.description || i.productName || ''} (x${i.quantity || 1} @ $${i.unitPrice || i.price || 0})`).join('; ');
        } else {
          value = JSON.stringify(value);
        }
      }
      return escapeCSVValue(value);
    }).join(',');
  });

  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  let str = String(val);
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}
