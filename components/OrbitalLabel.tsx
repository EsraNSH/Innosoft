import styles from "./OrbitalLabel.module.css";

export type LabelKind = "discover" | "design" | "build";

const ICONS: Record<LabelKind, React.ReactNode> = {
  discover: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
      <path d="m12 12 4.5 4.5" />
      <path d="M8 5.2v5.6M5.2 8h5.6" strokeOpacity="0.6" />
    </svg>
  ),
  design: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M9 1.5 15.5 5v8L9 16.5 2.5 13V5z" />
      <path d="M9 1.5v7.5m0 0 6.5-4M9 9 2.5 5M9 9v7.5" strokeOpacity="0.6" />
    </svg>
  ),
  build: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" />
      <path d="M6 9h6M9 6v6" strokeOpacity="0.6" />
      <path d="M2.5 6.5H.8M2.5 11.5H.8M17.2 6.5h-1.7M17.2 11.5h-1.7" />
    </svg>
  ),
};

type Props = {
  kind: LabelKind;
  title: string;
  description: string;
  anchorRef?: (el: HTMLDivElement | null) => void;
};

export default function OrbitalLabel({ kind, title, description, anchorRef }: Props) {
  return (
    <div className={styles.anchor} ref={anchorRef}>
      <div className={styles.label} data-label tabIndex={0}>
        <span className={styles.icon}>{ICONS[kind]}</span>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          <span className={styles.desc}>{description}</span>
        </span>
      </div>
    </div>
  );
}
