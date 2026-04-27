# Insect Diagnostics

A field-guide-style website for the Purdue **Insect Diversity & Diagnostics Lab** (Department of Entomology, Purdue University). The site is a visual identification reference for insects, arachnids, and small invertebrates relevant to extension work in Indiana.

The information architecture is **four levels deep**:

1. **Projects library** (`/`) — top-level collection of diagnostics projects (e.g. *Indoor Insects*, *Lawn & Garden Insects*, *Beetles of Indiana*).
2. **Project home** (`/p/<projectId>`) — one project's group overview.
3. **Group page** (`/p/<projectId>/g/<groupId>`) — every species in a group as a filterable tile grid.
4. **Species page** (`/p/<projectId>/g/<groupId>/s/<speciesId>`) — full diagnostic record for a single species: quick-ID checklist, habitat & signs, management notes, lookalikes, and (when supplied) references.

## Stack

- **Next.js 16** (App Router) + **React 19**, plain JavaScript / JSX (no TypeScript).
- Google Fonts (Oswald, Source Sans 3, Source Serif 4, JetBrains Mono) loaded via `next/font`.
- All content lives as **JSON files** in `content/`, read at build time and statically generated.
- Photos and other media live in `public/images/` and are referenced by root-relative path.

The site is fully statically generated — every project, group, and species page is rendered at build time and served as static HTML on Vercel's CDN.

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

`npm run build && npm start` will produce and serve the production build locally.

## Deploying to Vercel

The repository is set up for zero-config Vercel deploy:

1. Push the repo to GitHub.
2. In Vercel, **Add New Project** and import the GitHub repo.
3. Framework preset will auto-detect as **Next.js**. No environment variables required.
4. Click **Deploy**.

Every push to the default branch triggers a production build; every PR gets its own preview URL. Editing JSON content under `content/` and pushing is enough to refresh the live site — no manual rebuild needed beyond Vercel's automatic build hook.

## File layout

```
app/                                Next.js App Router routes
  layout.jsx                          root layout (fonts, AppBar, Footer)
  page.jsx                            "/" — projects library
  p/[projectId]/page.jsx              "/p/:projectId" — project home
  p/[projectId]/g/[groupId]/page.jsx  "/p/:projectId/g/:groupId" — group
  p/[projectId]/g/[groupId]/s/[speciesId]/page.jsx — species
  components/                         shared UI (Plate, AppBar, IndianaGlyph, etc.)
  globals.css                         all styling (design tokens at top)

lib/data.js                         server-only loader for content/

content/                            curated content (JSON only — edit freely)
  README.md                           field-by-field editing guide
  projects.json                       project index
  projects/<projectId>/groups.json    group index + lookalike pairs
  projects/<projectId>/species/<groupId>.json  species records

public/                             static assets served at root
  indiana.svg                         state silhouette glyph
  indd-logo.png                       lab logo (not yet wired into UI)
  images/projects/<projectId>/cover.jpg                project tile cover
  images/projects/<projectId>/groups/<groupId>.jpg     group tile hero
  images/projects/<projectId>/species/<speciesId>.jpg  primary species plate

next.config.mjs / package.json / jsconfig.json / .gitignore — Next.js plumbing
```

## Editing content

All content edits happen under `content/` (text + structure) and `public/images/` (photos). **No code changes are required to add a project, group, or species** — the site rebuilds itself from these files.

Two editor guides, side by side:

- 📄 **[`content/README.md`](content/README.md)** — full field-by-field JSON schema and worked examples for adding a new project, group, or species.
- 🖼️ **[`public/images/README.md`](public/images/README.md)** — where to drop photos and how to link them from JSON, with file-format guidance.

The short version:

- **Add a project:** append an entry to `content/projects.json`, then create `content/projects/<id>/groups.json` (use `status: "planned"` if you only want a placeholder tile).
- **Add a group inside a project:** append to `content/projects/<projectId>/groups.json` and create `content/projects/<projectId>/species/<groupId>.json`.
- **Add a species:** append a record to the relevant `content/projects/<projectId>/species/<groupId>.json`.
- **Add a photo:** drop the file under `public/images/projects/<projectId>/...` and reference it from JSON as `"image": "/images/projects/<projectId>/species/<speciesId>.jpg"` (root-relative — note the leading `/` and no `public/`).

`groupCount` and `speciesCount` are recomputed from disk at build time — leave them off your edits or they'll be overwritten.

Missing or 404ing images automatically fall back to the striped placeholder, so editing JSON before photos arrive is safe.

## Fidelity & design tokens

Pixel fidelity to the original Purdue brand prototype is intentional. Final colors, typography, spacing, and interactions are tied to Purdue's brand system. All design tokens live at the top of `app/globals.css`:

| Token | Hex | Use |
|-------|-----|-----|
| `--gold` | `#CFB991` | Boilermaker Gold — primary brand accent (subdued) |
| `--gold-rush` | `#DAAA00` | Rush — high-saturation gold for active states, range fills |
| `--gold-aged` | `#8E6F3E` | Aged — eyebrow text, body accents |
| `--black` | `#0A0A0B` | Primary text, hero |
| `--steel` | `#555960` | Secondary text |
| `--cool-gray` | `#6F727B` | Tertiary / muted text |
| `--paper` | `#FAF8F4` | Section backgrounds (warm cream) |
| `--paper-2` | `#F2EEE5` | Hero / plate backgrounds (deeper cream) |
| `--line-soft` | `#d9d3c4` | Hairline rules and tile borders |

Typography stack (loaded via `next/font` in `app/layout.jsx`):

| Token | Family | Use |
|-------|--------|-----|
| `--display` | Oswald | H1, H2, eyebrows (uppercase) |
| `--serif` | Source Serif 4 | Body prose, scientific names (italic) |
| `--sans` | Source Sans 3 | UI labels, navigation, footer |
| `--mono` | JetBrains Mono | Eyebrows, mono labels, count chips |

## Notable behaviors

- **Hash routing → real routes.** The original prototype used `#/` URL hashes. The Next.js port uses path-based routing; URLs are now shareable and indexable.
- **Search.** The header search box updates `?q=` in the URL; the group page reads it from `searchParams` and filters its tile grid.
- **Compare drawer.** Toggling compare on a species tile adds it to a global drawer (max 2). Selection persists across navigation via `localStorage`. The "Compare side-by-side" button opens a side-by-side modal table.
- **PPDL referral.** The "Where Encountered" section ends with a callout pointing readers to the [Purdue Plant & Pest Diagnostic Laboratory](https://ag.purdue.edu/department/btny/ppdl/) for confirmed identifications and treatment recommendations.
- **References are opt-in.** The references section only renders when a species record actually has `references` entries — there's no placeholder fallback.
- **Image fallback.** When a species/group/project image is missing or 404s, the `Plate` component falls back to the striped placeholder.
- **Sticky in-page nav.** The species page has a 6-section sticky nav with smooth scroll and active-section tracking.

## Notes for future maintainers

- The data loader (`lib/data.js`) normalizes any legacy `assets/...` image path the prototype used by stripping the prefix. New entries should use root-relative paths (`/images/...`).
- Both routing and content are intentionally simple. If/when content outgrows hand-edited JSON, the JSON shape ports cleanly to a headless CMS (Sanity / Contentful / Strapi) — replace the helpers in `lib/data.js` with API fetches and the views won't change.
- The lab logo (`public/indd-logo.png`) is shipped but not currently rendered in the UI; wire it into the AppBar or Footer when desired.
