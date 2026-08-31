import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import React, { isValidElement } from 'react';

type CommonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
};

export default function CommonButton({ asChild = false, children, ...props }: CommonButtonProps) {
  if (asChild && isValidElement(children)) {
    const childProps = (children as ReactElement<{ className?: string }>).props;
    return React.cloneElement(children as ReactElement<{ className?: string }>, {
      ...props,
      className: [childProps?.className, props.className].filter(Boolean).join(' '),
    });
  }

  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}
