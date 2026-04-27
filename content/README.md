# Content editor's guide

All copy, species records, and image references live as plain JSON files under this directory. Editing is a JSON-editing job — no code changes required.

The site rebuilds automatically when changes are pushed to GitHub. There's no separate publishing step on Vercel.

## File layout

```
content/
  projects.json                                 top-level project index
  projects/
    <projectId>/
      groups.json                               group index + lookalike pairs
      species/
        <groupId>.json                          species records — one file per group
```

Photos live separately, under `public/images/` — see [`/public/images/README.md`](../public/images/README.md) for the full image workflow (where to drop files, how to link them, file-format guidance).

The short version:

```
public/images/projects/<projectId>/cover.jpg                  ← project tile cover
public/images/projects/<projectId>/groups/<groupId>.jpg       ← group tile hero
public/images/projects/<projectId>/species/<speciesId>.jpg    ← primary species plate
```

Reference each image from JSON using its **root-relative path** (drop the `public/` prefix, keep the leading `/`):

```json
"image": "/images/projects/indoor-insects/species/odorous-house-ant.jpg"
```

A leading `assets/` prefix on any `image` field is stripped automatically (this is the form the prototype used). New entries should use the `/images/...` form above.

Missing or broken image paths fall back to the striped placeholder — editing JSON before photos arrive is always safe.

## Fields

### `content/projects.json`

```json
{
  "projects": [
    {
      "id": "indoor-insects",
      "name": "Indoor Insects",
      "sciName": "Pests of homes and structures",
      "blurb": "Insects, arachnids, and small invertebrates that turn up indoors…",
      "swatch": "#8E6F3E",
      "pattern": "diagonal",
      "image": "/images/projects/indoor-insects/cover.jpg",
      "status": "active"
    }
  ]
}
```

| Field | Notes |
|-------|-------|
| `id` | URL-safe slug. Must match `content/projects/<id>/`. |
| `name` | Project name shown on the projects-home tile, app bar, and hero. |
| `sciName` | Scientific subtitle (italics on display). |
| `blurb` | One-sentence description for the projects-home tile and the project hero. |
| `swatch`, `pattern` | Decorative tonal wash + striped pattern for the placeholder plate. |
| `image` | Optional cover image. Empty string = striped placeholder. |
| `status` | `active` (load groups + species) or `planned` (render a tile + stub home page only). |
| `groupCount` | **Auto-derived** at build time — leave it off or it'll be overwritten. |

### `content/projects/<projectId>/groups.json`

```json
{
  "groups": [
    {
      "id": "ants",
      "name": "Ants",
      "sciName": "Formicidae",
      "blurb": "Social hymenopterans nesting indoors and outdoors…",
      "swatch": "#8E6F3E",
      "pattern": "diagonal",
      "image": "/images/projects/indoor-insects/groups/ants.jpg"
    }
  ],
  "lookalikes": {
    "carpenter-ant": ["odorous-house-ant"]
  }
}
```

| Field | Notes |
|-------|-------|
| `id` | URL-safe slug. Must match the species file: `species/<id>.json`. |
| `name` | Group common name on the tile + page hero. |
| `sciName` | Scientific group name (italics on display). |
| `blurb` | One-sentence description for the project-home tile. |
| `swatch` | Tonal hex used as a background wash on the placeholder tile. |
| `pattern` | One of `diagonal`, `stipple`, `weave`, `grain`, `wing`, `web`, `hex`, `scale` — purely decorative. |
| `image` | Optional. Empty = placeholder. |
| `speciesCount` | **Auto-derived** from the species file at build — leave it off or it'll be overwritten. |

`lookalikes` maps a species id to an array of similar species ids; the species page surfaces these in the **Lookalikes** section. Lookalikes are scoped to one project and may cross groups within that project.

### `content/projects/<projectId>/species/<groupId>.json`

An array of species records. Add, remove, or reorder freely.

```json
[
  {
    "id": "odorous-house-ant",
    "common": "Odorous House Ant",
    "scientific": "Tapinoma sessile",
    "family": "Formicidae",
    "order": "Hymenoptera",
    "habitat": "In Homes",
    "range": "Statewide",
    "size": "2.4–3.3 mm",
    "color": "#3a3a3e",
    "tags": ["Trail-forming", "Sweet-feeding"],
    "quickId": [
      "Single, hidden node on petiole",
      "Even, brown-black body color",
      "Crushed workers smell of rotten coconut"
    ],
    "habitatNotes": "No structural damage. Contaminates exposed food…",
    "management": "Sanitation, moisture correction, slow-acting baits…",
    "additionalNotes": "Optional free-form notes that render as the final section on the species page when present.",
    "image": "/images/projects/indoor-insects/species/odorous-house-ant.jpg",
    "imageCredit": "Photo: J. Doe / Purdue Entomology",
    "references": [
      {
        "source": "Purdue Extension",
        "label": "Ants in and around the home",
        "url": "https://extension.entm.purdue.edu/publications/E-26.pdf",
        "n": "E-26"
      }
    ]
  }
]
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | URL-safe slug used in routing (`/p/<projectId>/g/<groupId>/s/<speciesId>`). |
| `common` | yes | Common name. |
| `scientific` | yes | Italicised on display. |
| `family`, `order` | yes | Shown in the species hero stat row and in filter chips. |
| `habitat` | yes | The **Habitat** filter chip — keep values consistent across the project (`In Homes`, `Stored Products`, `Around Structures`, `Structural`, etc.). Also shown in the species hero metadata grid. |
| `range`, `size` | yes | One-line strings. |
| `color` | yes | Hex. Drives the placeholder wash. |
| `tags` | optional | Short labels surfaced on the species hero. |
| `quickId` | yes | Array of 3–5 short identification points. |
| `habitatNotes` | yes | Paragraph rendered in the **Habitat & signs** section (left column, beside the PPDL referral card). |
| `management` | optional | Paragraph rendered in the **Summary of Treatment Options** section. Omit / leave blank to skip the entire section (and the corresponding sticky-nav link). |
| `additionalNotes` | optional | Free-form prose rendered as the final section. Omit / leave blank to skip it. Use blank lines (`\n\n`) inside the string to break paragraphs. |
| `image` | optional | Root-relative path to a primary photo. Empty / missing → striped placeholder. |
| `imageCredit` | optional | Caption rendered over the bottom-right of the photo. |
| `references` | optional | Array of `{source, label, url, n}`. Empty / missing → the references section is hidden entirely. |

The `range` field appears in the species hero metadata grid as a one-line label (e.g. "Statewide", "Northern Indiana"). Plain prose is fine.

### Sections that auto-hide

The species page renders sections in order, computing eyebrow numbers (01, 02, …) from what's actually present. Three sections are conditional:

- **Management** — hidden if `management` is empty.
- **References** — hidden if `references` is empty or missing.
- **Additional notes** — hidden unless `additionalNotes` is set.

When a section is hidden, its sticky-nav link disappears and the surrounding numbering reflows so there are no gaps.

## Common tasks

### Add a new project

1. Append an entry to `content/projects.json` → `projects`. Use `status: "planned"` if you only want the placeholder, or `status: "active"` to wire it up.
2. If active, create the directory `content/projects/<new-id>/`.
3. Add `groups.json` (at minimum, `{ "groups": [], "lookalikes": {} }`) and a `species/` directory with one JSON file per group.
4. (Optional) Drop a project cover image at `public/images/projects/<new-id>/cover.jpg` and reference it from `projects.json` → `image`.

A planned project still gets a live tile on the projects home and a stub project-home page reading "Coming soon."

### Add a new group inside a project

1. Append an entry to `content/projects/<projectId>/groups.json` → `groups`.
2. Create `content/projects/<projectId>/species/<new-id>.json` with at least one species record.
3. (Optional) Drop a group hero image at `public/images/projects/<projectId>/groups/<new-id>.jpg`.

### Add a new species

1. Append a record to the relevant `content/projects/<projectId>/species/<group>.json`.
2. Drop the photo at `public/images/projects/<projectId>/species/<id>.jpg` and reference it from the record (`/images/projects/<projectId>/species/<id>.jpg`).
3. (Optional) Add lookalike pairs to that project's `groups.json` → `lookalikes`.

### Remove content

Delete records from the JSON. Tile counts and group pages update on the next build.

## Caveats

- The site rebuilds on every push to the default branch — Vercel handles this automatically. If a deploy fails, check Vercel's build logs (most failures will be a malformed JSON file or a missing `groups.json` / `species/<groupId>.json`).
