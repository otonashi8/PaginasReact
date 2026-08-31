export const normalizeSistemaValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

export const isSistemaRedesAccess = (accessName: string, accessLabel: string, path?: string | null) => {
  const normalizedAccessName = normalizeSistemaValue(accessName);
  const normalizedAccessLabel = normalizeSistemaValue(accessLabel);
  const normalizedPath = normalizeSistemaValue(path ?? '');

  return (
    normalizedAccessName.includes('redes') ||
    normalizedAccessLabel.includes('redes') ||
    normalizedPath.includes('redes')
  );
};

export const isSistemaEnvioAccess = (accessName: string, accessLabel: string, path?: string | null) => {
  const normalizedAccessName = normalizeSistemaValue(accessName);
  const normalizedAccessLabel = normalizeSistemaValue(accessLabel);
  const normalizedPath = normalizeSistemaValue(path ?? '');

  return (
    normalizedAccessName.includes('envio') ||
    normalizedAccessLabel.includes('envio') ||
    normalizedPath.includes('envio')
  );
};
