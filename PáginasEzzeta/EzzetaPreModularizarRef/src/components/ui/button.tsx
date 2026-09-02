import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'icon-sm';
  children?: ReactNode;
};

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 border text-sm font-medium transition';
  const variantClass = variant === 'outline'
    ? 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-600 hover:text-zinc-950'
    : variant === 'ghost'
      ? 'border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
      : 'border-zinc-900 bg-zinc-900 text-white hover:bg-red-600 hover:border-red-600';
  const sizeClass = size === 'icon-sm' ? 'h-8 w-8 rounded-none p-0' : 'px-4 py-2';

  return (
    <button type={type} className={`${base} ${variantClass} ${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default Button;
