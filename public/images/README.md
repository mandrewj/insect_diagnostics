# Image assets

All curated photos for the diagnostics site live in this directory. Drop files in; reference them by root-relative path from JSON content under `/content`.

The site rebuilds automatically when you push to GitHub — no separate publishing step.

## Where each file goes

```
public/images/projects/<projectId>/cover.jpg                  ← project tile cover
public/images/projects/<projectId>/groups/<groupId>.jpg       ← group tile hero
public/images/projects/<projectId>/species/<speciesId>.jpg    ← species plate
```

`<projectId>`, `<groupId>`, `<speciesId>` are the slugs used in JSON (e.g. `indoor-insects`, `ants`, `odorous-house-ant`). Filenames must match those slugs **exactly** — that's the only convention that links a photo to its record.

A folder skeleton is already in place for the three shipped projects. To add a new project's images, create a folder named after its `id`.

## How to link a file from JSON

Once the file is in `public/images/...`, reference it from the matching JSON record using a **root-relative path** — drop the `public/` prefix:

| File on disk | JSON value |
|--------------|-----------|
| `public/images/projects/indoor-insects/cover.jpg` | `"image": "/images/projects/indoor-insects/cover.jpg"` |
| `public/images/projects/indoor-insects/groups/ants.jpg` | `"image": "/images/projects/indoor-insects/groups/ants.jpg"` |
| `public/images/projects/indoor-insects/species/odorous-house-ant.jpg` | `"image": "/images/projects/indoor-insects/species/odorous-house-ant.jpg"` |

The JSON files themselves are:

| Image referenced | JSON file to edit | Field |
|------------------|-------------------|-------|
| Project cover | `/content/projects.json` | `projects[].image` |
| Group tile | `/content/projects/<projectId>/groups.json` | `groups[].image` |
| Species plate | `/content/projects/<projectId>/species/<groupId>.json` | (each species record).`image` |

For species photos, also fill in `imageCredit` so the photographer is attributed in the bottom-right of the plate:

```json
{
  "id": "odorous-house-ant",
  "common": "Odorous House Ant",
  "image": "/images/projects/indoor-insects/species/odorous-house-ant.jpg",
  "imageCredit": "Photo: J. Doe / Purdue Entomology"
}
```

## What happens if a photo is missing or wrong

The site falls back to the striped placeholder — it won't break. So:

- It is always safe to add a JSON record before the photo arrives.
- Typos in the path render as the placeholder. If a tile shows stripes when you expected a photo, double-check the path matches the file on disk (case-sensitive on Linux/Vercel — Mac `Finder` is forgiving and will hide bugs).

## File format & size guidance

- **Format:** JPEG for photos, PNG only when transparency or sharp edges matter.
- **Aspect ratio:** species plates render at 4:3; group tiles at roughly 14:9; project covers at roughly 16:10. Anything close works — the layout uses `object-fit: cover`.
- **You don't need to pre-resize.** The site uses Next.js's image optimizer on Vercel: every photo is automatically resized to several widths (mobile/tablet/desktop), converted to WebP or AVIF when the browser supports it, and cached on the CDN. Drop the original JPEG in and the platform does the rest.
- **Soft cap on originals: ~5 MB.** Anything bigger bloats the git repo over time without improving what visitors see (the optimizer downsamples it anyway). If a phone-camera JPEG is 10+ MB, run it through Preview's "Adjust Size" or `sips -Z 2400 input.jpg --out output.jpg` once before committing.
- **Color & exposure:** the site is editorial cream-on-black; photos look best when they're bright with a neutral or warm cast. Cool/bluish photos clash with the brand palette.

## Legacy `assets/...` paths

The original prototype used paths like `"image": "assets/images/..."`. The data loader strips a leading `assets/` prefix automatically, so old data still works — but new entries should always use the `/images/...` form above.
