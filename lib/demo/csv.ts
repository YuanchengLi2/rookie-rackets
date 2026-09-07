export function escapeCsv(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function downloadCsv(filename: string, headersOrRows: string[] | Array<Array<unknown>>, maybeRows?: Array<Array<unknown>>): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return;
  const headers: string[] = maybeRows ? headersOrRows as string[] : (headersOrRows as Array<Array<unknown>>)[0].map((value) => String(value));
  const rows: Array<Array<unknown>> = maybeRows ?? (headersOrRows as Array<Array<unknown>>).slice(1);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
