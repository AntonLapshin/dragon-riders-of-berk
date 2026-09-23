import type { ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  wide?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Centered dialog card rendered inside the overlay (atom). */
export function Modal({ children, wide, className, style }: ModalProps) {
  return <div className={['modal', wide ? '' : '', className ?? ''].filter(Boolean).join(' ')} style={style}>{children}</div>;
}

export function ModalTitle({ children }: { children: ReactNode }) {
  return <div className="m-title">{children}</div>;
}

export function ModalSub({ children }: { children: ReactNode }) {
  return <div className="m-sub">{children}</div>;
}
