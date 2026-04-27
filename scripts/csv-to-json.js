#!/usr/bin/env node
//
// csv-to-json.js — convert the spreadsheet templates into the site's
// JSON content tree.
//
// Reads:
//   templates/projects.csv       one row per project
//   templates/groups.csv         one row per group  (project_id column)
//   templates/species.csv        one row per species (project_id, group_id)
//   templates/lookalikes.csv     one row per lookalike pair (project_id, species_id, lookalike_id)
//   templates/references.csv     one row per reference (project_id, species_id, source, label, url, n)
//
// Writes:
//   content/projects.json
//   content/projects/<projectId>/groups.json   (groups + lookalikes)
//   content/projects/<projectId>/species/<groupId>.json
//
// Per-project files are only (re)written when the project appears in the
// CSV, so this script is safe to run with a partial template set — other
// projects on disk are left untouched.
//
// Usage:
//   npm run import-csv
//   node scripts/csv-to-json.js          (same thing)

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(ROOT, "templates");
const CONTENT = path.join(ROOT, "content");

// ---- minimal CSV parser (RFC 4180-ish: quoted fields, "" -> ", multiline ok) ----
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.some((v) => v !== "")) rows.push(row);
        row = [];
      } else { field += c; }
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((v) => v !== "")) rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    headers.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); });
    return o;
  });
}

function readCsvIfExists(name) {
  const p = path.join(TEMPLATES, name);
  if (!fs.existsSync(p)) return [];
  return parseCsv(fs.readFileSync(p, "utf8"));
}

// Multi-value cells: students may use newlines (Alt+Enter) or pipes — accept both.
function splitMulti(s) {
  if (!s) return [];
  return s.split(/\r?\n|\|/).map((x) => x.trim()).filter(Boolean);
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function main() {
  const projects = readCsvIfExists("projects.csv");
  const groups = readCsvIfExists("groups.csv");
  const species = readCsvIfExists("species.csv");
  const lookalikes = readCsvIfExists("lookalikes.csv");
  const references = readCsvIfExists("references.csv");

  if (projects.length === 0) {
    console.error("templates/projects.csv is empty or missing — nothing to import.");
    process.exit(1);
  }

  // index references by species id (within their project for safety)
  const refsBySpecies = new Map();
  for (const r of references) {
    const key = `${r.project_id}::${r.species_id}`;
    if (!refsBySpecies.has(key)) refsBySpecies.set(key, []);
    refsBySpecies.get(key).push({
      source: r.source || "Reference",
      label: r.label || "",
      url: r.url || "",
      n: r.n || "",
    });
  }

  // index lookalikes per project: { speciesId: [lookalikeId, ...] }
  const lookalikesByProject = new Map();
  for (const l of lookalikes) {
    if (!lookalikesByProject.has(l.project_id)) lookalikesByProject.set(l.project_id, {});
    const map = lookalikesByProject.get(l.project_id);
    if (!map[l.species_id]) map[l.species_id] = [];
    map[l.species_id].push(l.lookalike_id);
  }

  // 1) projects.json — full rewrite from the CSV (it must list every project)
  const projectsOut = {
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      sciName: p.sciName,
      blurb: p.blurb,
      swatch: p.swatch,
      pattern: p.pattern,
      image: p.image,
      status: p.status || "active",
    })),
  };
  writeJson(path.join(CONTENT, "projects.json"), projectsOut);
  console.log(`✓ content/projects.json (${projectsOut.projects.length} projects)`);

  // 2) per-project groups.json + species files
  const projectIds = new Set(projects.map((p) => p.id));
  for (const pid of projectIds) {
    const projGroups = groups.filter((g) => g.project_id === pid);
    if (projGroups.length === 0) continue; // planned project — no groups yet

    const groupsOut = {
      groups: projGroups.map((g) => ({
        id: g.id,
        name: g.name,
        sciName: g.sciName,
        blurb: g.blurb,
        swatch: g.swatch,
        pattern: g.pattern,
        image: g.image,
      })),
      lookalikes: lookalikesByProject.get(pid) || {},
    };
    writeJson(path.join(CONTENT, "projects", pid, "groups.json"), groupsOut);
    console.log(`✓ content/projects/${pid}/groups.json (${projGroups.length} groups)`);

    for (const g of projGroups) {
      const groupSpecies = species.filter(
        (s) => s.project_id === pid && s.group_id === g.id
      );
      const out = groupSpecies.map((s) => {
        const rec = {
          id: s.id,
          common: s.common,
          scientific: s.scientific,
          family: s.family,
          order: s.order,
          habitat: s.habitat,
          range: s.range,
          size: s.size,
          color: s.color,
          tags: splitMulti(s.tags),
          quickId: splitMulti(s.quickId),
          habitatNotes: s.habitatNotes || "",
          management: s.management || "",
        };
        if (s.additionalNotes) rec.additionalNotes = s.additionalNotes;
        rec.image = s.image || "";
        rec.imageCredit = s.imageCredit || "";
        rec.references = refsBySpecies.get(`${pid}::${s.id}`) || [];
        return rec;
      });
      writeJson(
        path.join(CONTENT, "projects", pid, "species", `${g.id}.json`),
        out
      );
      console.log(
        `  ↳ species/${g.id}.json (${out.length} record${out.length === 1 ? "" : "s"})`
      );
    }
  }

  console.log("Done.");
}

main();
