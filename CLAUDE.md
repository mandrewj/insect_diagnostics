# CLAUDE.md

Project context for future Claude Code sessions in this repo.

## What this is

Field-guide-style website for the Purdue **Insect Diversity & Diagnostics Lab** (Department of Entomology, Purdue University). The site is a visual identification reference for insects, arachnids, and small invertebrates relevant to extension work in Indiana.

- **Live site:** https://insect-diagnostics.vercel.app
- **Repo:** https://github.com/mandrewj/insect_diagnostics (public)
- **Hosting:** Vercel, auto-deploys on push to `main`. Connected via GitHub integration; no env vars required.
- **Stack:** Next.js 16 (App Router) + React 19, plain JavaScript/JSX (no TypeScript). Fully statically generated — every project, group, and species is pre-rendered at build time via `generateStaticParams`.

## Information architecture

Four-level hierarchy:

1. **Projects library** (`/`) — top-level collection of diagnostics projects.
2. **Project home** (`/p/<projectId>`) — overview of one project.
3. **Group page** (`/p/<projectId>/g/<groupId>`) — filterable species grid.
4. **Species page** (`/p/<projectId>/g/<groupId>/s/<speciesId>`) — full diagnostic record.

The species page renders **dynamic sections** (built into a `sections` array in `app/p/[projectId]/g/[groupId]/s/[speciesId]/page.jsx`). Three sections auto-hide when their JSON content is empty: Management, References, Additional notes. Eyebrow numbers (01, 02, …) reflow so there are no gaps.

## Data flow

```
content/*.json  ──┐
                  │  read by lib/data.js (server-only fs reads, cached
                  │  via React.cache, normalized/validated)
                  ▼
                Server Components in app/  ──→  pre-rendered HTML on Vercel
```

Optional second authoring path:

```
templates/*.csv  ──→  npm run import-csv  ──→  content/*.json
                       (scripts/csv-to-json.js)
```

The CSV path exists for student/cohort data entry. Running `npm run import-csv` regenerates **every** `content/projects.json` and per-project file from the CSVs in `templates/`. It is non-destructive only for projects that aren't listed in `projects.csv` — listed projects get a full rewrite.

## File map

```
app/                      Next.js App Router
  layout.jsx                root layout (Google Fonts, AppBar, Footer, CompareProvider)
  page.jsx                  "/" — projects library
  p/[projectId]/page.jsx
  p/[projectId]/g/[groupId]/page.jsx
  p/[projectId]/g/[groupId]/s/[speciesId]/page.jsx     — dynamic sections live here
  components/               Plate, AppBar, Footer, Placeholder, IndianaGlyph,
                            CompareProvider, SpeciesGrid (filters + tile reveal),
                            SpeciesNav (sticky in-page nav).
  globals.css               every brand token + style. No Tailwind, no CSS modules.
  favicon.ico               App-Router-native favicon location.

lib/data.js               Server-only loader. Cached helpers, normalizers,
                          and the deterministic id→palette tone derivation.

content/                  JSON source of truth.
  projects.json
  projects/<projectId>/groups.json
  projects/<projectId>/species/<groupId>.json

public/                   Static assets served at root.
  images/projects/...     (team drops photos here, root-relative paths)
  indiana.svg             (used by IndianaGlyph CSS mask)
  indd-logo.png           Shipped but NOT wired into UI yet.

templates/                CSV templates for the spreadsheet workflow.
scripts/csv-to-json.js    CSV→JSON importer (RFC-4180 parser, no deps).
docs/                     student-guide.{md,html,pdf}
```

## Conventions and sharp edges

### Field naming (recent rename)

The species record uses `habitat` (categorical filter chip — e.g. `"In Homes"`, `"Stored Products"`) and `habitatNotes` (paragraph). The pre-rename names `damage` and `damageNotes` are gone — don't re-introduce them. There is **no separate `habitat` micro-environment field** anymore (it was dropped during the rename).

### Auto-derived fields

These should NOT be set manually in source data; the loader / build computes them:

- `groupCount` (in projects.json) — derived from each project's groups.json at read time
- `speciesCount` (in groups.json) — derived from species file count
- `swatch` (project, group) and `color` (species) — auto-derived from the `id` slug via a deterministic hash → 12-tone palette in `lib/data.js`. Explicit hex values in JSON still win as overrides; the CSV templates dropped these columns.

### Image paths

- All images live in `public/images/projects/<projectId>/...`
- JSON references them root-relatively (`/images/...`, no `public/` prefix)
- Legacy `assets/...` prefixes are stripped automatically by `lib/data.js`
- The `Plate` component is `next/image` with `fill` mode → Vercel handles responsive sizes, WebP/AVIF, lazy loading. No team-side resize step needed (soft cap ~5 MB on originals so git doesn't bloat).

### Routing

- Path-based, not hash-based. The original prototype used `#/` hashes; do not re-introduce.
- The AppBar derives breadcrumbs from `usePathname()` + a `navIndex` (compact `{projectId: {name, groups: {groupId: {name, species: {speciesId: name}}}}}`) loaded once in the root layout.

### Search

- Header search box writes `?q=` to the URL.
- The `SpeciesGrid` client component reads `useSearchParams().get("q")` and filters its tile grid. The group page itself is fully static — search does not make it dynamic.

### Compare drawer

- Lives in `app/components/CompareProvider.jsx`. React context + localStorage persistence.
- Limit of 2 species. Clicking a third evicts the oldest.
- Side-by-side modal opens when both slots are filled.

## Common workflows

```bash
npm run dev          # local development (Turbopack, occasionally slow first compile)
npm run build        # production build — TRUTH SOURCE for code validity
npm start            # serve the built output (instant, used as preview)
npm run import-csv   # regenerate JSON from templates/*.csv
npm run guide-pdf    # regenerate docs/student-guide.pdf via Chrome headless
```

**If `next dev` hangs:** don't loop. `npm run build && npm start` is faster, more reliable, and proves code validity. Dev mode's slow first compile (Turbopack cold start) is environmental, not code-caused.

**Don't `rm -rf .next` while a dev server is running** — it leaves the server in a corrupted state. Kill the process first, then clear.

## What's intentional (don't revert)

- **No TypeScript.** Plain JS/JSX is deliberate to lower the barrier for the lab team.
- **No Tailwind / no CSS framework.** All styling in `app/globals.css` with brand tokens at the top. The aesthetic is print-editorial; rounded corners and shadows are absent on purpose.
- **`IndianaMap.jsx` was deleted** when the Geographic Range section was removed from the species page. The `range` field on each species still drives the species-hero metadata cell; do not re-add a section.
- **References fall back to nothing**, not to placeholder publications. The section auto-hides when empty.
- **Field tip → PPDL referral.** The "Where Encountered" callout points to https://ag.purdue.edu/department/btny/ppdl/. Don't replace it with auto-generated habitat-based copy.
- **Management section copy is fixed.** The "Before treating" callout reads the standard pesticide-label guidance ("Read and follow all label instructions…"). It is regulatory boilerplate, not editorial.

## Things still pending

- The lab logo `public/indd-logo.png` is shipped but not yet rendered anywhere in the UI. Ready to wire into AppBar or Footer when desired.
- No species photos have been wired beyond the bedbug placeholder; the team is sourcing photography.

## Documentation index

- `README.md` — top-level repo overview
- `content/README.md` — full JSON field reference
- `public/images/README.md` — photo workflow
- `docs/student-guide.{md,html,pdf}` — spreadsheet workflow for student data entry
- `templates/*.csv` — pre-filled with the indoor-insects dataset as a worked example
