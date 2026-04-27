import Link from "next/link";
import IndianaGlyph from "./components/IndianaGlyph";
import Plate from "./components/Plate";
import { getProjects } from "@/lib/data";

// PROJECTS LIBRARY — top-level overview of every diagnostics project.
export default async function ProjectsLibrary() {
  const projects = await getProjects();
  const active = projects.filter((p) => p.status === "active");

  return (
    <div>
      <section className="hero hero-compact">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            PURDUE EXTENSION ENTOMOLOGY · DIAGNOSTICS LIBRARY
          </div>
          <div className="hero-row">
            <h1>
              Insect <em>diagnostics</em>
            </h1>
            <p className="hero-lede">
              A growing collection of visual identification guides curated by
              the Insect Diversity and Diagnostics Lab. Choose a project below
              to browse its groups and species.
            </p>
            <div className="hero-stats-inline">
              <div className="hs">
                <span className="num">{projects.length}</span>
                <span className="lab">Projects</span>
              </div>
              <div className="hs">
                <span className="num">{active.length}</span>
                <span className="lab">Live</span>
              </div>
              <div className="hs">
                <span className="num indiana-num">
                  <IndianaGlyph size={56} color="var(--gold)" />
                </span>
                <span className="lab">Focus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Projects</h2>
          </div>
          <p className="section-sub">
            Each project covers a distinct slice of Indiana&rsquo;s insect
            fauna. Active projects open into a full diagnostic hierarchy;
            planned projects show a placeholder while content is being prepared.
          </p>
        </div>

        <div className="group-grid">
          {projects.map((p) => {
            const isActive = p.status === "active";
            const glyph = (p.name || "").split(" ")[0].slice(0, 4);
            return (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                className={"group-card project-card" + (isActive ? "" : " is-stub")}
              >
                <div className="group-card-art">
                  <Plate
                    src={p.image}
                    label={p.name + " · project"}
                    tone={p.swatch}
                    glyph={glyph}
                  />
                  {!isActive && <div className="project-status">In preparation</div>}
                </div>
                <div className="group-card-body">
                  <div className="group-card-name">{p.name}</div>
                  <div className="group-card-sci">{p.sciName}</div>
                  <div className="group-card-blurb">{p.blurb}</div>
                  <div className="group-card-foot">
                    <span>
                      {isActive ? `${p.groupCount || 0} groups` : "Coming soon"}
                    </span>
                    <span className="group-card-arrow">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
