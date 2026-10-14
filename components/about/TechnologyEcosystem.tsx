import Image from "next/image";
import { TECHNOLOGIES, TECHNOLOGY_GROUPS } from "@/data/technologyEcosystem";
import styles from "./Trust.module.css";

/** Logo grid. Logo files live in /public/logos (placeholders until official assets arrive). */
export default function TechnologyEcosystem() {
  return (
    <div className={styles.groups}>
      {TECHNOLOGY_GROUPS.map((group) => (
        <div key={group} data-reveal>
          <p className={styles.groupLabel}>{group}</p>
          <ul className={styles.logos}>
            {TECHNOLOGIES.filter((t) => t.group === group).map((t) => (
              <li key={t.name} className={styles.logo}>
                <Image
                  src={t.logo.src}
                  alt={t.name}
                  width={t.logo.width}
                  height={t.logo.height}
                  loading="lazy"
                  unoptimized={t.logo.src.endsWith(".svg")}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
