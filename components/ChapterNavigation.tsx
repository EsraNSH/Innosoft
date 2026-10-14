"use client";

import styles from "./ChapterNavigation.module.css";

export type Chapter = { id: string; label: string; live: boolean };

/** Home page chapters (03–05 arrive in later phases). */
export const HOME_CHAPTERS: Chapter[] = [
  { id: "01", label: "Digital Solutions", live: true },
  { id: "02", label: "Our Approach", live: true },
  { id: "03", label: "Solutions", live: false },
  { id: "04", label: "Products", live: false },
  { id: "05", label: "Let's Build", live: false },
];

type Props = {
  chapters?: Chapter[];
  onNavigate: (index: number) => void;
  /** Fill the first connector with progress (Home's scrubbed transition). */
  withProgress?: boolean;
};

/** Active state is set from page animations via `data-active` on items (no React state). */
export default function ChapterNavigation({ chapters = HOME_CHAPTERS, onNavigate, withProgress = true }: Props) {
  return (
    <nav className={styles.rail} aria-label="Chapters">
      <ol className={styles.list}>
        {chapters.map((c, i) => (
          <li key={c.id} className={styles.item} data-chapter={c.id} data-active={i === 0 ? "" : undefined}>
            <button
              className={styles.button}
              aria-label={`${c.id} — ${c.label}`}
              aria-disabled={!c.live}
              onClick={() => c.live && onNavigate(i)}
            >
              <span className={styles.label}>{c.id}</span>
              <span className={styles.dot} />
            </button>
            {i < chapters.length - 1 && (
              <span className={styles.connector} aria-hidden="true">
                {i === 0 && withProgress && <span className={styles.fill} data-chapter-fill />}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
