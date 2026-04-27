import { Suspense } from "react";
import { notFound } from "next/navigation";
import SpeciesGrid from "@/app/components/SpeciesGrid";
import { getGroup, getProjectBundle, getProjects } from "@/lib/data";

export async function generateStaticParams() {
  const projects = await getProjects();
  const params = [];
  for (const p of projects) {
    if (p.status !== "active") continue;
    const pb = await getProjectBundle(p.id);
    if (!pb) continue;
    for (const g of pb.groups) {
      params.push({ projectId: p.id, groupId: g.id });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { projectId, groupId } = await params;
  const bundle = await getGroup(projectId, groupId);
  if (!bundle) return { title: "Group — Insect Diagnostics" };
  return {
    title: `${bundle.group.name} — ${bundle.project.name}`,
    description: bundle.group.blurb,
  };
}

// GROUP PAGE — species tile grid. The grid client component reads the
// global search query from the URL itself, so this page stays fully static.
export default async function GroupPage({ params }) {
  const { projectId, groupId } = await params;
  const bundle = await getGroup(projectId, groupId);
  if (!bundle) notFound();
  const { group, list } = bundle;

  return (
    <div>
      <section className="hero hero-compact group-hero">
        <div className="hero-inner">
          <div className="hero-row group-hero-row">
            <h1>{group.name}</h1>
            <div className="group-hero-sci">{group.sciName}</div>
            <p className="hero-lede group-hero-blurb">{group.blurb}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <Suspense fallback={null}>
          <SpeciesGrid projectId={projectId} groupId={groupId} species={list} />
        </Suspense>
      </section>
    </div>
  );
}
