"use client";

import { useState } from "react";
import Placeholder from "./Placeholder";

// Image with placeholder fallback. Used everywhere we render species, group,
// or project art. If the src is missing or 404s we fall back to the striped
// placeholder.
export default function Plate({ src, label, tone, glyph, credit, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <Placeholder label={label} tone={tone} glyph={glyph} />;
  }
  return (
    <div className="ph plate-img">
      <img
        src={src}
        alt={alt || label}
        onError={() => setFailed(true)}
        loading="lazy"
      />
      {credit && <div className="plate-credit">{credit}</div>}
    </div>
  );
}
