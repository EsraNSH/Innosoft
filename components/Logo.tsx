type Props = { className?: string };

/** Hex "S" mark + wordmark. Placeholder until the official SVG is supplied. */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="innosoft-mark" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4C8DFF" />
          <stop offset="1" stopColor="#1A56F0" />
        </linearGradient>
      </defs>
      <path
        d="M24.5 9.5 16 4.6 7.5 9.5v4.7l17 3.6v4.7L16 27.4l-8.5-4.9"
        stroke="url(#innosoft-mark)"
        strokeWidth="3.4"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export default function Logo({ className }: Props) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <LogoMark />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Innosoft
        <sup style={{ fontSize: 8, marginLeft: 1, verticalAlign: 12, opacity: 0.7 }}>™</sup>
      </span>
    </span>
  );
}
