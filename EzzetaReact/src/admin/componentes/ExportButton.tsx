import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  onExport: () => void;
};

export const ExportButton = ({ onExport, className = '', ...buttonProps }: Props) => {
  return (
    <button
      type="button"
      onClick={onExport}
      className={`rounded-none border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 ${className}`}
      {...buttonProps}
    >
      Exportar
    </button>
  );
};
