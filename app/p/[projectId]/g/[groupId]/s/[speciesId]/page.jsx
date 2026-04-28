import Link from "next/link";
import { notFound } from "next/navigation";
import Plate from "@/app/components/Plate";
import SpeciesNav from "@/app/components/SpeciesNav";
import { getProjectBundle, getProjects, getSpecies } from "@/lib/data";

const PPDL_URL = "https://ag.purdue.edu/department/btny/ppdl/";

export async function generateStaticParams() {
  const projects = await getProjects();
  const params = [];
  for (const p of projects) {
    if (p.status !== "active") continue;
    const pb = await getProjectBundle(p.id);
    if (!pb) continue;
    for (const g of pb.groups) {
      for (const s of pb.speciesByGroup[g.id] || []) {
        params.push({ projectId: p.id, groupId: g.id, speciesId: s.id });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { projectId, groupId, speciesId } = await params;
  const bundle = await getSpecies(projectId, groupId, speciesId);
  if (!bundle) return { title: "Species — Insect Diagnostics" };
  return {
    title: `${bundle.species.common} — ${bundle.project.name}`,
    description: bundle.species.habitatNotes,
  };
}

// SPECIES PAGE — full diagnostic record with sticky in-page nav.
//
// The body is built from a dynamic `sections` array so optional sections
// (Management, References, Additional notes) can be omitted cleanly when
// the JSON record doesn't include them — and the eyebrow numbers (01, 02,
// …) reflow without leaving gaps.
export default async function SpeciesPage({ params }) {
  const { projectId, groupId, speciesId } = await params;
  const bundle = await getSpecies(projectId, groupId, speciesId);
  if (!bundle) notFound();

  const { group, list, lookalikes: lookalikeMap, species, speciesByGroup } = bundle;
  const idx = list.findIndex((s) => s.id === speciesId);
  const next = list[(idx + 1) % list.length];
  const prev = list[(idx - 1 + list.length) % list.length];

  // Resolve lookalike IDs to species records by walking every group's list.
  const lookalikes = (lookalikeMap[species.id] || [])
    .map((id) => {
      for (const gid of Object.keys(speciesByGroup)) {
        const m = speciesByGroup[gid].find((x) => x.id === id);
        if (m) return { ...m, _gid: gid };
      }
      return null;
    })
    .filter(Boolean);

  const refs = (species.references && species.references.length > 0)
    ? species.references.map((r) => ({
        source: r.source || "Reference",
        title: r.label || r.title || r.url,
        url: r.url || "#",
        n: r.n || "",
      }))
    : [];

  const heroVariant = "default";
  const glyph = (species.common || "").split(" ")[0].slice(0, 3);

  // Build the section list. Each entry carries everything the renderer and
  // the sticky in-page nav need. Order here is the rendering order.
  const sections = [
    {
      id: "identification",
      label: "Quick ID",
      title: "Quick-ID checklist",
      content: (
        <div className="qid-grid">
          {species.quickId.map((q, i) => (
            <div className="qid-cell" key={i}>
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <div className="text">{q}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "habitat",
      label: "Habitat & signs",
      title: "Habitat & signs",
      content: (
        <div className="two-col">
          <div className="prose">
            <p>{species.habitatNotes}</p>
          </div>
          <div className="callout" style={{ alignSelf: "center" }}>
            <span className="k">Need help identifying this?</span>
            The Purdue{" "}
            <a href={PPDL_URL} target="_blank" rel="noopener noreferrer">
              Plant &amp; Pest Diagnostic Laboratory (PPDL)
            </a>{" "}
            accepts physical and digital specimens for confirmed
            identification and provides tailored control recommendations.
          </div>
        </div>
      ),
    },
  ];

  if (species.management) {
    sections.push({
      id: "management",
      label: "Management",
      title: "Summary of Treatment Options",
      content: (
        <div className="two-col">
          <div className="prose">
            <p>{species.management}</p>
          </div>
          <div className="callout">
            <span className="k">Before treating</span>
            Read and follow all label instructions. This includes directions
            for use, precautionary statements (hazards to humans, domestic
            animals, and endangered species), environmental hazards, rates of
            application, number of applications, reentry intervals, harvest
            restrictions, storage and disposal, and any specific warnings
            and/or precautions for safe handling of the pesticide.
          </div>
        </div>
      ),
    });
  }

  sections.push({
    id: "lookalikes",
    label: "Lookalikes",
    title: "Don’t confuse with",
    content:
      lookalikes.length === 0 ? (
        <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--steel)" }}>
          No commonly confused species recorded for this profile.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {lookalikes.map((l) => (
            <Link
              key={l.id}
              href={`/p/${projectId}/g/${l._gid}/s/${l.id}`}
              className="tile"
              style={{ display: "flex" }}
            >
              <div className="tile-art" style={{ aspectRatio: "16 / 10" }}>
                <Plate src={l.image} credit={l.imageCredit} label={l.common} tone={l.color} />
              </div>
              <div className="tile-body">
                <div className="tile-common">{l.common}</div>
                <div className="tile-sci">{l.scientific}</div>
                <div className="tile-meta">
                  <span>{l.family}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ),
  });

  if (refs.length > 0) {
    sections.push({
      id: "references",
      label: "References",
      title: "Continue with the full publication",
      content: (
        <div className="refs">
          {refs.map((r, i) => {
            const isExternal = r.url && r.url !== "#";
            const inner = (
              <>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <div className="title">{r.title}</div>
                  {r.n && <div className="pub">Pub. {r.n}</div>}
                </span>
                <span className="source">{r.source} ↗</span>
              </>
            );
            return isExternal ? (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            ) : (
              <a key={i} aria-disabled="true">
                {inner}
              </a>
            );
          })}
        </div>
      ),
    });
  }

  if (species.additionalNotes) {
    sections.push({
      id: "additional-notes",
      label: "Additional notes",
      title: "Additional notes",
      content: (
        <div className="prose" style={{ maxWidth: "70ch" }}>
          {species.additionalNotes
            .split(/\n{2,}/)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      ),
    });
  }

  return (
    <div>
      <section className={"species-hero variant-" + heroVariant}>
        <div className="species-hero-inner">
          <div className="species-hero-art">
            <Plate
              src={species.image}
              credit={species.imageCredit}
              label={species.common + " · adult plate"}
              tone={species.color}
              glyph={glyph}
              sizes="(max-width: 800px) 100vw, 720px"
            />
          </div>
          <div className="species-hero-meta">
            <div className="species-hero-eyebrow">
              {group.name} · {species.family}
            </div>
            <h1 className="species-hero-name">{species.common}</h1>
            <div className="species-hero-sci">{species.scientific}</div>
            <div className="species-hero-grid">
              <div className="cell">
                <div className="k">Order</div>
                <div className="v">{species.order}</div>
              </div>
              <div className="cell">
                <div className="k">Size</div>
                <div className="v">{species.size}</div>
              </div>
              <div className="cell">
                <div className="k">Habitat</div>
                <div className="v">{species.habitat}</div>
              </div>
              <div className="cell">
                <div className="k">Range</div>
                <div className="v">{species.range}</div>
              </div>
            </div>
            {species.tags.length > 0 && (
              <div className="species-tags">
                {species.tags.map((t) => (
                  <span key={t} className="species-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <SpeciesNav
        sections={sections.map((s) => ({ id: s.id, label: s.label }))}
        prev={{ href: `/p/${projectId}/g/${groupId}/s/${prev.id}`, label: prev.common }}
        next={{ href: `/p/${projectId}/g/${groupId}/s/${next.id}`, label: next.common }}
      />

      {sections.map((s, i) => (
        <section
          key={s.id}
          className="species-section"
          id={s.id}
          style={i % 2 === 1 ? { background: "white" } : undefined}
        >
          <div className="species-section-inner">
            <div className="species-section-eyebrow">
              {String(i + 1).padStart(2, "0")} · {s.label}
            </div>
            <h2>{s.title}</h2>
            {s.content}
          </div>
        </section>
      ))}
    </div>
  );
}
