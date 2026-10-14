import { MILESTONES } from "@/data/milestones";
import shared from "./about.module.css";
import styles from "./OurStory.module.css";

export default function OurStory() {
  return (
    <section id="story" className={shared.section} aria-labelledby="story-title" data-chapter-section="0">
      <div className={styles.grid}>
        <div>
          <p className={shared.eyebrow} data-reveal>
            Our Story
          </p>
          <h2 id="story-title" className={shared.h2} data-reveal>
            <span>From Technical Expertise</span>
            <span className={shared.accent}>to Lasting Impact.</span>
          </h2>
          <p className={shared.lead} data-reveal>
            Technology matters most when it solves real problems, connects systems, and helps organizations move
            forward.
          </p>
          <p className={shared.body} data-reveal>
            Innosoft brings software engineering, infrastructure, and technology consulting together to help
            organizations navigate that complexity.
          </p>
        </div>

        {/* Verified milestones only (data/milestones.ts); the line runs on as an open end */}
        <div className={styles.timeline} data-draw>
          <svg className={styles.svg} viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="story-line" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0">
                <stop offset="0" stopColor="#3d82ff" />
                <stop offset="0.55" stopColor="#3d82ff" stopOpacity="0.5" />
                <stop offset="1" stopColor="#3d82ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="12"
              x2="600"
              y2="12"
              stroke="url(#story-line)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              data-draw-line
            />
          </svg>
          <ol className={styles.list}>
            {MILESTONES.map((m) => (
              <li key={m.date + m.title} className={styles.milestone} data-draw-node>
                <span className={styles.marker} aria-hidden="true" />
                <time className={styles.date}>{m.date}</time>
                <p className={styles.title}>{m.title}</p>
                {m.description && <p className={styles.desc}>{m.description}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
