import Link from "next/link";
import { notFound } from "next/navigation";
import IndianaMap from "@/app/components/IndianaMap";
import Plate from "@/app/components/Plate";
import SpeciesNav from "@/app/components/SpeciesNav";
import { getProjectBundle, getProjects, getSpecies } from "@/lib/data";

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
    description: bundle.species.damageNotes,
  };
}

// SPECIES PAGE — full diagnostic record with sticky in-page nav.
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

  const refs =
    species.references && species.references.length > 0
      ? species.references.map((r) => ({
          source: r.source || "Reference",
          title: r.label || r.title || r.url,
          url: r.url || "#",
          n: r.n || "",
        }))
      : [
          {
            source: "Purdue Extension",
            url: "#",
            title: `${species.common} (${species.scientific}): identification and management`,
            n: "E-227-W",
          },
          {
            source: "Purdue PPDL",
            url: "#",
            title: `Indoor pest fact sheet: ${species.family}`,
            n: "PPDL-FS",
          },
        ];

  const heroVariant = "default";
  const glyph = (species.common || "").split(" ")[0].slice(0, 3);

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
                <div className="k">Where Encountered</div>
                <div className="v">{species.damage}</div>
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
        prev={{ href: `/p/${projectId}/g/${groupId}/s/${prev.id}`, label: prev.common }}
        next={{ href: `/p/${projectId}/g/${groupId}/s/${next.id}`, label: next.common }}
      />

      {/* identification */}
      <section className="species-section" id="identification">
        <div className="species-section-inner">
          <div className="species-section-eyebrow">01 · Identification</div>
          <h2>Quick-ID checklist</h2>
          <div className="qid-grid">
            {species.quickId.map((q, i) => (
              <div className="qid-cell" key={i}>
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <div className="text">{q}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* damage */}
      <section className="species-section" id="damage" style={{ background: "white" }}>
        <div className="species-section-inner">
          <div className="species-section-eyebrow">02 · Where Encountered</div>
          <h2>Habitat &amp; signs</h2>
          <div className="two-col">
            <div className="prose">
              <p>{species.damageNotes}</p>
              <p>
                Visual cues alone are rarely conclusive. Combine the quick-ID
                points above with location, season, and substrate to narrow
                your call. When in doubt, collect a specimen and contact the
                Purdue Plant &amp; Pest Diagnostic Laboratory.
              </p>
            </div>
            <div className="callout">
              <span className="k">Field tip</span>
              {species.habitat ? (
                <>
                  Look in{" "}
                  <strong>{species.habitat.toLowerCase()}</strong> first. The
                  damage signature shows up there before the insect itself
                  becomes visible.
                </>
              ) : (
                <>
                  Inspect harborage zones before treating. Visible damage
                  usually trails the population by weeks.
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* range */}
      <section className="species-section" id="range">
        <div className="species-section-inner">
          <div className="species-section-eyebrow">03 · Geographic Range</div>
          <h2>Indiana distribution</h2>
          <div className="map-wrap">
            <div className="map-svg">
              <IndianaMap range={species.range} />
            </div>
            <div className="map-key">
              <div className="row">
                <div className="sw" style={{ background: "var(--gold-rush)" }} />
                Reported range
              </div>
              <div className="row">
                <div className="sw" style={{ background: "white" }} />
                Limited or absent
              </div>
              <div className="disclaimer">
                Range maps are compiled from publicly available occurrence
                data, which often mismatches actual range and abundance. Treat
                these as a coarse guide, not a definitive distribution. Submit
                unusual finds to the PPDL.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* management */}
      <section
        className="species-section"
        id="management"
        style={{ background: "white" }}
      >
        <div className="species-section-inner">
          <div className="species-section-eyebrow">04 · Management</div>
          <h2>Short notes, not a treatment plan</h2>
          <div className="two-col">
            <div className="prose">
              <p>{species.management}</p>
            </div>
            <div className="callout">
              <span className="k">Before treating</span>
              Match the species to a Purdue Extension publication (see
              references) and confirm pesticide labels permit the site of use.
              Treatment decisions belong with a licensed applicator.
            </div>
          </div>
        </div>
      </section>

      {/* lookalikes */}
      <section className="species-section" id="lookalikes">
        <div className="species-section-inner">
          <div className="species-section-eyebrow">05 · Lookalikes</div>
          <h2>Don&rsquo;t confuse with</h2>
          {lookalikes.length === 0 ? (
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 17,
                color: "var(--steel)",
              }}
            >
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
                    <Plate
                      src={l.image}
                      credit={l.imageCredit}
                      label={l.common}
                      tone={l.color}
                    />
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
          )}
        </div>
      </section>

      {/* references */}
      <section
        className="species-section"
        id="references"
        style={{ background: "white" }}
      >
        <div className="species-section-inner">
          <div className="species-section-eyebrow">06 · References</div>
          <h2>Continue with the full publication</h2>
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
                <a key={i} href={r.url} target="_blank" rel="noopener">
                  {inner}
                </a>
              ) : (
                <a key={i} aria-disabled="true">
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
