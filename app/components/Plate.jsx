"use client";

import Image from "next/image";
import { useState } from "react";
import Placeholder from "./Placeholder";

// Image with placeholder fallback. Used everywhere we render species, group,
// or project art. If the src is missing or 404s we fall back to the striped
// placeholder.
//
// Wraps next/image with `fill`, so the team can drop full-resolution photos
// into /public/images and Vercel serves per-device renditions (WebP/AVIF,
// responsive sizes) automatically. Pass a `sizes` override at call sites
// where the rendered width differs sharply from the default tile width.
const DEFAULT_SIZES = "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px";

export default function Plate({ src, label, tone, glyph, credit, alt, sizes }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <Placeholder label={label} tone={tone} glyph={glyph} />;
  }
  return (
    <div className="ph plate-img">
      <Image
        src={src}
        alt={alt || label}
        fill
        sizes={sizes || DEFAULT_SIZES}
        onError={() => setFailed(true)}
      />
      {credit && <div className="plate-credit">{credit}</div>}
    </div>
  );
}
