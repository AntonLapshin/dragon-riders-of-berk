interface AvatarProps {
  src: string;
  alt: string;
  color?: string;
  size?: number;
  className?: string;
}

/** Circular player/dragon portrait (atom). */
export function Avatar({ src, alt, color, size = 40, className = 'pc-avatar' }: AvatarProps) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={color ? ({ ['--pc' as string]: color } as React.CSSProperties) : undefined}
    />
  );
}
