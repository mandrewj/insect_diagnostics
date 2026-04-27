import Link from "next/link";
import { notFound } from "next/navigation";
import IndianaGlyph from "@/app/components/IndianaGlyph";
import Plate from "@/app/components/Plate";
import { getProjectBundle, getProjects } from "@/lib/data";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ projectId: p.id }));
}

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const bundle = await getProjectBundle(projectId);
  if (!bundle) return { title: "Project — Insect Diagnostics" };
  return {
    title: `${bundle.project.name} — Insect Diagnostics`,
    description: bundle.project.blurb,
  };
}

// PROJECT HOME — single project's overview with a tile per group.
export default async function ProjectHome({ params }) {
  const { projectId } = await params;
  const bundle = await getProjectBundle(projectId);
  if (!bundle) notFound();

  const { project, groups, speciesByGroup } = bundle;
  const isStub = project.status !== "active" || groups.length === 0;
  const totalSpecies = Object.values(speciesByGroup).reduce(
    (n, arr) => n + arr.length,
    0
  );

  return (
    <div>
      <section className="hero hero-compact">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            PURDUE EXTENSION ENTOMOLOGY · {project.name.toUpperCase()}
          </div>
          <div className="hero-row">
            <h1>{project.name}</h1>
            <p className="hero-lede">{project.blurb}</p>
            <div className="hero-stats-inline">
              {isStub ? (
                <div className="hs">
                  <span className="num" style={{ fontSize: 22, lineHeight: 1.3 }}>
                    Coming
                    <br />
                    soon
                  </span>
                  <span className="lab">Status</span>
                </div>
              ) : (
                <>
                  <div className="hs">
                    <span className="num">{groups.length}</span>
                    <span className="lab">Groups</span>
                  </div>
                  <div className="hs">
                    <span className="num">{totalSpecies}</span>
                    <span className="lab">Species</span>
                  </div>
                  <div className="hs">
                    <span className="num indiana-num">
                      <IndianaGlyph size={56} color="var(--gold)" />
                    </span>
                    <span className="lab">Focus</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {isStub ? <StubBody projectName={project.name} /> : <Groups projectId={project.id} groups={groups} />}
    </div>
  );
}

function Groups({ projectId, groups }) {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2 className="section-title">Browse by group</h2>
        </div>
        <p className="section-sub">
          Each group includes the species most likely to be encountered.
        </p>
      </div>

      <div className="group-grid">
        {groups.map((g) => {
          const glyph = (g.name || "").split(" ")[0].slice(0, 4);
          return (
            <Link
              key={g.id}
              href={`/p/${projectId}/g/${g.id}`}
              className="group-card"
            >
              <div className="group-card-art">
                <Plate
                  src={g.image}
                  label={g.name + " · plate"}
                  tone={g.swatch}
                  glyph={glyph}
                />
              </div>
              <div className="group-card-body">
                <div className="group-card-name">{g.name}</div>
                <div className="group-card-sci">{g.sciName}</div>
                <div className="group-card-blurb">{g.blurb}</div>
                <div className="group-card-foot">
                  <span>{g.speciesCount} species</span>
                  <span className="group-card-arrow">→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function StubBody({ projectName }) {
  return (
    <section className="section">
      <div
        style={{
          border: "1px solid var(--line-soft)",
          background: "white",
          padding: "32px",
          borderLeft: "4px solid var(--gold-rush)",
          maxWidth: 720,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--gold-aged)",
            marginBottom: 12,
          }}
        >
          In preparation
        </div>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Content for <strong>{projectName}</strong> is being curated by the
          Insect Diversity and Diagnostics Lab. The structure will mirror other
          projects in this collection — groups, species tiles, and full
          diagnostic profiles. Check back, or contact the lab for specific
          identification needs in the meantime.
        </p>
        <div style={{ marginTop: 24 }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold-aged)",
            }}
          >
            ← Back to all projects
          </Link>
        </div>
      </div>
    </section>
  );
}
