# Insect Diagnostics — Student Data Entry Guide

Welcome. Your task is to fill in spreadsheet data for an entomology diagnostics project. The data you enter will be turned into a real, public website — see [insect-diagnostics.vercel.app](https://insect-diagnostics.vercel.app/) for the live result.

This guide walks you through the spreadsheet workflow, the five sheets you'll work with, and how to submit your work.

## How the data flows

```
   ┌──────────────────────────┐
   │  YOU edit 5 spreadsheets │
   └─────────────┬────────────┘
                 │  export as CSV  (File → Download → .csv)
                 ▼
   ┌──────────────────────────┐
   │  Instructor runs script  │   npm run import-csv
   │  CSV → JSON              │
   └─────────────┬────────────┘
                 │  push to GitHub
                 ▼
   ┌──────────────────────────┐
   │  Site rebuilds on Vercel │
   └──────────────────────────┘
```

You'll work in five sheets — they are **linked to each other through ID columns**. Get the IDs right and everything else falls into place.

| Sheet | What it holds | Linked to |
|-------|---------------|-----------|
| **projects** | Top-level projects (e.g. *Indoor Insects*) | — |
| **groups** | Categories within a project (e.g. *Ants*) | `project_id` → projects.id |
| **species** | Individual species records | `project_id`, `group_id` |
| **lookalikes** | Pairs of species commonly confused with each other | `project_id`, `species_id`, `lookalike_id` |
| **references** | Linked publications for a species | `project_id`, `species_id` |

A copy of all five sheets, pre-filled with the existing *Indoor Insects* dataset as a worked example, lives in the repo at `templates/`. Use those as your starting point.

---

## Working in the spreadsheet

### IDs are the glue

Every project, group, and species needs an **`id`** — a short, lowercase, URL-safe slug like `carpenter-ant` or `bed-bugs`. The id is what shows up in the website's URL (`/p/indoor-insects/g/ants/s/carpenter-ant`), so:

- Lowercase only.
- Use hyphens (`-`), never spaces or underscores.
- No accents or special characters.
- Pick one and don't change it later — you'd break links.

The `groups` sheet has a `project_id` column that **must match exactly** an `id` in the `projects` sheet. Same for `species`: its `project_id` and `group_id` must match real entries upstream.

### Multi-line cells (tags, quick-ID points)

Two columns hold lists, not single values: `tags` and `quickId`.

In a spreadsheet, **press `Alt+Enter` (Windows) or `Option+Enter` (Mac) inside a cell to add a new line**. Each line becomes a separate item.

Example for `quickId`:

```
Single, hidden node on petiole
Even, brown-black body color
Crushed workers smell of rotten coconut
Trails along baseboards and counters
```

That's one cell with four lines. Don't put commas between items — newlines only.

(If your spreadsheet won't let you do newlines, you can use the pipe character `|` instead: `Trail-forming|Sweet-feeding`.)

### Long prose (habitatNotes, management, additionalNotes)

These are paragraph-length text fields. Just type into the cell as a single block of prose. Press `Alt+Enter` if you want a paragraph break inside the field — the site will render the break as a real paragraph.

### Images

Leave the `image` and `imageCredit` columns **blank** unless your instructor tells you otherwise. The instructor will upload photos and update those fields separately. The site automatically falls back to a striped placeholder when an image isn't set.

---

## Field reference

### `projects` sheet

One row per top-level project.

| Column | Notes |
|--------|-------|
| `id` | URL-safe slug (`indoor-insects`, `lawn-garden`). |
| `name` | Display name (`Indoor Insects`). |
| `sciName` | Scientific subtitle, often a higher-level taxon or descriptor (`Pests of homes and structures`). |
| `blurb` | One sentence describing the project. Shown on the homepage tile. |
| `swatch` | A hex color (`#8E6F3E`) used as the placeholder tile background. Pick something earthy. |
| `pattern` | One of `diagonal`, `stipple`, `weave`, `grain`, `wing`, `web`, `hex`, `scale`. Decorative only. |
| `image` | Leave blank. |
| `status` | `active` for live projects; `planned` for placeholders. |

### `groups` sheet

One row per group within a project.

| Column | Notes |
|--------|-------|
| `project_id` | Must match an id from the projects sheet. |
| `id` | URL-safe slug (`ants`, `bed-bugs`). |
| `name` | Display name (`Ants`). |
| `sciName` | Scientific name (`Formicidae`). |
| `blurb` | One sentence about the group. |
| `swatch` | Hex color for placeholder. |
| `pattern` | Same options as projects. |
| `image` | Leave blank. |

### `species` sheet

One row per species. This is where most of your work happens.

| Column | Notes |
|--------|-------|
| `project_id`, `group_id` | Must match real upstream entries. |
| `id` | Slug — usually the common name lowercased and hyphenated (`carpenter-ant`). |
| `common` | Common name (`Black Carpenter Ant`). |
| `scientific` | Scientific name, no italics (the site adds them). |
| `family`, `order` | Taxonomic family and order. |
| `habitat` | The categorical filter — `In Homes`, `Stored Products`, `Around Structures`, `Structural`, etc. **Be consistent across the project** — these become the filter chips on the group page. |
| `range` | One-line geographic range (`Statewide`, `Southern Indiana`). |
| `size` | Adult body size with units (`6–13 mm`). |
| `color` | Hex color for placeholder when no photo. |
| `tags` | Multi-line. Short labels like `Trail-forming`, `Sweet-feeding`. |
| `quickId` | Multi-line. 3–5 short identification points. |
| `habitatNotes` | Paragraph: where and when this species turns up, what signals its presence. |
| `management` | Paragraph: control approach. **Optional** — leave blank if you don't have notes; the section auto-hides. |
| `additionalNotes` | Optional free-form prose rendered at the bottom. Skip if not needed. |
| `image`, `imageCredit` | Leave blank. |

### `lookalikes` sheet

One row per *directional* pair. If species A is commonly confused with species B, add **two rows**: one A→B, one B→A. The site only shows lookalikes pointing outward from the species you're viewing.

| Column | Notes |
|--------|-------|
| `project_id` | Must match a project. |
| `species_id` | The species you're on. |
| `lookalike_id` | A species id (in the same project) that's commonly confused with it. |

### `references` sheet

One row per reference. Optional — leave the sheet empty if a species has no linked publications.

| Column | Notes |
|--------|-------|
| `project_id`, `species_id` | Which species this reference belongs to. |
| `source` | The publishing body (`Purdue Extension`). |
| `label` | The publication title. |
| `url` | Direct link to the document or page. |
| `n` | Publication number, if any (`E-26`). |

---

## Submitting your work

When you're done editing, your instructor will tell you which of these to do:

**Option A — single Google Sheet.** Share the sheet with your instructor (View access is fine). They will export each tab to CSV and import.

**Option B — five CSV files.** From your spreadsheet, export each sheet as a `.csv` file (in Google Sheets: *File → Download → Comma-separated values*). Send the five files to your instructor.

**Option C — direct repo edit (advanced).** If you have GitHub access to the repo, replace the files in `templates/` with your CSVs, run `npm run import-csv`, commit, and push. The site updates automatically when Vercel finishes its build (usually under a minute).

---

## Common pitfalls

- **Mismatched IDs.** A typo in `species.project_id` that doesn't appear in `projects.id` means the species silently won't render. Double-check every `*_id` column.
- **Inconsistent `habitat` values.** If three students each invent a slightly different label (`In homes` vs. `In Homes` vs. `Indoor`), they all become separate filter chips. Decide on the canonical labels with your group before you start.
- **Commas inside cells.** Spreadsheets handle this automatically when exporting to CSV — but if you're hand-writing CSV, wrap any field containing a comma in double quotes.
- **Smart quotes.** If your software auto-converts `"` to `"` or `–` to `—`, that's usually fine for prose but not for the `id` columns. Keep IDs ASCII.
- **Blank required fields.** `id`, `common`, `scientific`, `family`, `order`, `habitat`, `range`, `size`, `color`, `quickId`, `habitatNotes` are required. The page may render but will look broken if they're missing.

---

## Questions?

Post them to the class channel or email your instructor. The website's source is at [github.com/mandrewj/insect_diagnostics](https://github.com/mandrewj/insect_diagnostics) — if you're curious how the data you're entering becomes the live page, the loader logic is in `lib/data.js` and the species page itself is `app/p/[projectId]/g/[groupId]/s/[speciesId]/page.jsx`.
