import type { ReactNode } from 'react';

export const Dialog = ({ open, children }: { open: boolean; children: ReactNode; onOpenChange?: (open: boolean) => void }) =>
  open ? <>{children}</> : null;

export const DialogContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const DialogHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const DialogTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2 className={className}>{children}</h2>
);

export const DialogDescription = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <p className={className}>{children}</p>
);

export default Dialog;
