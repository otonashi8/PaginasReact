import type { ReactNode } from 'react';

export function CheckoutHeader() {
  return (
    <header className="border-b border-[rgba(125,36,56,0.12)] bg-[#ffffff] px-5 py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="font-serif text-2xl font-semibold text-vino-oscuro">Ezzeta</div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-vino">Checkout</span>
      </div>
    </header>
  );
}

export function CheckoutSection({ title, summary, step, children, onEdit, disabled }: { title: string; summary?: string; step: number; children: ReactNode; onEdit?: () => void; disabled?: boolean; }) {
  return (
    <section className={`overflow-hidden rounded-[28px] border border-[rgba(125,36,56,0.15)] bg-[#fffdfd] shadow-[0_18px_60px_rgba(80,26,34,0.06)] ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(125,36,56,0.08)] bg-[rgba(255, 255, 255, 0.72)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vino text-sm font-bold text-crema">{step}</span>
          <div>
            <h2 className="text-lg font-semibold text-vino-oscuro">{title}</h2>
            {summary ? <p className="text-xs text-[#7b5e63]">{summary}</p> : null}
          </div>
        </div>
        {onEdit ? (
          <button type="button" onClick={onEdit} className="text-xs font-bold uppercase tracking-[0.12em] text-vino hover:text-vino-oscuro">Editar</button>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs font-medium text-red-600">{message}</p> : null;
}

export const errorInputClass = (hasError: boolean) =>
  `h-11 w-full rounded-xl border px-3.5 text-sm text-zinc-900 outline-none transition ${hasError ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`;
