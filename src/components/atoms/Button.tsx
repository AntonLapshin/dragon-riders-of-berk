import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'blue' | 'ghost';
  big?: boolean;
  sub?: string;
  children: ReactNode;
}

/** Primary game button (atom). Variants mirror the original stylesheet. */
export function Button({ variant = 'gold', big, sub, children, className, ...rest }: ButtonProps) {
  const cls = ['btn', variant, big ? 'big' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
      {sub ? <small>{sub}</small> : null}
    </button>
  );
}
