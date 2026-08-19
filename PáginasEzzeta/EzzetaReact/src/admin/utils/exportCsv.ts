export type CsvColumn<T> = {
  label: string;
  value: keyof T | ((row: T) => unknown);
};

const escapeCsvValue = (value: string): string => {
  const escaped = value.replace(/"/g, '""');
  const needsQuotes = /[",\r\n]/.test(value);
  return needsQuotes ? `"${escaped}"` : escaped;
};

const normalizeCell = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, (_, item) => (item === undefined ? null : item));
    } catch {
      return String(value);
    }
  }

  return String(value);
};

export const buildCsv = <T>(rows: T[], columns: CsvColumn<T>[]): string => {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const rawValue = typeof column.value === 'function' ? column.value(row) : (row as any)[column.value];
        return escapeCsvValue(normalizeCell(rawValue));
      })
      .join(','),
  );

  return [header, ...lines].join('\r\n');
};

const appendUniqueSuffixToFilename = (filename: string): string => {
  const trimmed = filename.trim();
  const suffix = `_${new Date().getTime()}`;

  if (trimmed.toLowerCase().endsWith('.csv')) {
    const base = trimmed.slice(0, -4);
    return `${base}${suffix}.csv`;
  }

  return `${trimmed}${suffix}.csv`;
};

export const downloadCsv = (filename: string, csvContent: string): void => {
  const resolvedName = appendUniqueSuffixToFilename(filename);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = resolvedName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatFilenameDateRange = (start?: string, end?: string): string => {
  const dateValue = (value?: string) => {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.replace(/[^0-9\-]/g, '').slice(0, 10);
    }
    return date.toISOString().slice(0, 10);
  };

  const startValue = dateValue(start);
  const endValue = dateValue(end);

  if (startValue && endValue) {
    return `${startValue}_${endValue}`;
  }
  if (startValue) {
    return startValue;
  }
  if (endValue) {
    return endValue;
  }

  return '';
};
