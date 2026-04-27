// Server-only loader for the diagnostics content tree.
//
//   content/projects.json                                      — top-level project index
//   content/projects/<projectId>/groups.json                   — group index + lookalike pairs
//   content/projects/<projectId>/species/<groupId>.json        — species records, one file per group
//
// All reads happen on the server (Node runtime). Pages call these helpers
// from `generateStaticParams` and from each page's default export, so the
// site can be built fully statically.

import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";

const CONTENT_ROOT = path.join(process.cwd(), "content");

const readJson = cache(async (relPath) => {
  const file = path.join(CONTENT_ROOT, relPath);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
});

const fileExists = async (relPath) => {
  try {
    await fs.access(path.join(CONTENT_ROOT, relPath));
    return true;
  } catch {
    return false;
  }
};

// Translate any legacy "assets/images/..." path the team used in the
// prototype into the Next.js public-folder form ("/images/..."). New
// entries should already use root-relative paths; this is a safety net.
function normalizeImage(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return src;
  if (src.startsWith("assets/")) return "/" + src.slice("assets/".length);
  return "/" + src;
}

function normalizeProject(p) {
  return { ...p, image: normalizeImage(p.image) };
}

function normalizeGroup(g) {
  return { ...g, image: normalizeImage(g.image) };
}

function normalizeSpecies(s) {
  return {
    ...s,
    image: normalizeImage(s.image),
    tags: Array.isArray(s.tags) ? s.tags : [],
    quickId: Array.isArray(s.quickId) ? s.quickId : [],
    references: Array.isArray(s.references) ? s.references : [],
  };
}

export const getProjects = cache(async () => {
  const index = await readJson("projects.json");
  const projects = (index.projects || []).map(normalizeProject);

  // sync groupCount for active projects from the on-disk group index so
  // editors don't have to maintain it by hand.
  await Promise.all(
    projects.map(async (p) => {
      if (p.status !== "active") return;
      const exists = await fileExists(`projects/${p.id}/groups.json`);
      if (!exists) return;
      const groupsIndex = await readJson(`projects/${p.id}/groups.json`);
      p.groupCount = (groupsIndex.groups || []).length;
    })
  );

  return projects;
});

export const getProject = cache(async (projectId) => {
  const projects = await getProjects();
  return projects.find((p) => p.id === projectId) || null;
});

export const getProjectBundle = cache(async (projectId) => {
  const project = await getProject(projectId);
  if (!project) return null;

  if (project.status !== "active") {
    return { project, groups: [], speciesByGroup: {}, lookalikes: {} };
  }

  const groupsIndex = await readJson(`projects/${projectId}/groups.json`);
  const groups = (groupsIndex.groups || []).map(normalizeGroup);
  const lookalikes = groupsIndex.lookalikes || {};

  const speciesEntries = await Promise.all(
    groups.map(async (g) => {
      const list = await readJson(`projects/${projectId}/species/${g.id}.json`);
      return [g.id, list.map(normalizeSpecies)];
    })
  );
  const speciesByGroup = Object.fromEntries(speciesEntries);

  // sync speciesCount so the team doesn't have to maintain it.
  for (const g of groups) g.speciesCount = (speciesByGroup[g.id] || []).length;

  return { project, groups, speciesByGroup, lookalikes };
});

export const getGroup = cache(async (projectId, groupId) => {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) return null;
  const group = bundle.groups.find((g) => g.id === groupId) || null;
  return group ? { ...bundle, group, list: bundle.speciesByGroup[groupId] || [] } : null;
});

export const getSpecies = cache(async (projectId, groupId, speciesId) => {
  const bundle = await getGroup(projectId, groupId);
  if (!bundle) return null;
  const species = bundle.list.find((s) => s.id === speciesId) || null;
  return species ? { ...bundle, species } : null;
});

// Compact lookup table used by the AppBar to render breadcrumbs without
// having to load every species record on every navigation.
export const getNavIndex = cache(async () => {
  const projects = await getProjects();
  const out = {};
  await Promise.all(
    projects.map(async (p) => {
      const node = { name: p.name, groups: {} };
      out[p.id] = node;
      if (p.status !== "active") return;
      const bundle = await getProjectBundle(p.id);
      if (!bundle) return;
      for (const g of bundle.groups) {
        const speciesMap = {};
        for (const s of bundle.speciesByGroup[g.id] || []) {
          speciesMap[s.id] = s.common;
        }
        node.groups[g.id] = { name: g.name, species: speciesMap };
      }
    })
  );
  return out;
});
