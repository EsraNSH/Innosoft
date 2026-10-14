import SiteLink from "@/components/SiteLink";
import { PROJECTS } from "@/data/projects";
import { ROUTES } from "@/lib/site";
import ProjectCarousel from "./ProjectCarousel";
import { ArrowUpRight } from "./Icons";
import shared from "./about.module.css";
import styles from "./SelectedWork.module.css";

export default function SelectedWork() {
  return (
    <section
      id="work"
      className={`${shared.section} ${styles.section}`}
      aria-labelledby="work-title"
      data-chapter-section="2"
    >
      <div className={styles.head}>
        <div>
          <p className={shared.eyebrow} data-reveal>
            Selected Work
          </p>
          <h2 id="work-title" className={shared.h2} data-reveal>
            <span>Complex Challenges.</span>
            <span className={shared.accent}>Practical Solutions.</span>
          </h2>
          <p className={shared.lead} data-reveal>
            A closer look at selected projects and the real-world challenges they address.
          </p>
        </div>
        <SiteLink
          href={ROUTES.projects}
          className={`${shared.textLink} ${styles.viewAll}`}
          pendingLabel="Projects page coming soon"
        >
          View All Projects
          <ArrowUpRight />
        </SiteLink>
      </div>
      <div className={styles.stageWrap} data-reveal>
        <ProjectCarousel projects={PROJECTS} initial={1} label="Selected projects" />
      </div>
    </section>
  );
}
