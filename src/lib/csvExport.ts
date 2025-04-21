
export function exportToCSV(data: any[], filename: string) {
  if (!Array.isArray(data) || data.length === 0) return;

  const replacer = (key: string, value: any) => (value === null ? '' : value);

  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row =>
      header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','),
    ),
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
