/** Small stroke icons shared across About sections (decorative). */
type P = { size?: number };

export function ArrowRight({ size = 14 }: P) {
  return (
    <svg width={size} height={(size * 12) / 14} viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path d="M0 6h12.5M8 1.2 12.8 6 8 10.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowUpRight({ size = 12 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 10.5 10.5 1.5M3.5 1.5h7v7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowLeft({ size = 16 }: P) {
  return (
    <svg width={size} height={(size * 12) / 14} viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path d="M14 6H1.5M6 1.2 1.2 6 6 10.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Download({ size = 14 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v8.5M3.2 6 7 9.8 10.8 6M1.5 12.5h11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
