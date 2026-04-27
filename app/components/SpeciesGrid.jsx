"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Plate from "./Plate";
import { useCompare } from "./CompareProvider";

// Filterable species grid for the group page. Order/Family/WhereEncountered
// chips are derived from the species list. The global text search is read
// straight from ?q= so the parent page can stay fully static.
export default function SpeciesGrid({ projectId, groupId, species }) {
  const params = useSearchParams();
  const search = params.get("q") || "";
  const [orderFilter, setOrderFilter] = useState("All");
  const [familyFilter, setFamilyFilter] = useState("All");
  const [damageFilter, setDamageFilter] = useState("All");

  const orders = useMemo(
    () => ["All", ...Array.from(new Set(species.map((s) => s.order)))],
    [species]
  );
  const families = useMemo(
    () => ["All", ...Array.from(new Set(species.map((s) => s.family)))],
    [species]
  );
  const damages = useMemo(
    () => ["All", ...Array.from(new Set(species.map((s) => s.damage)))],
    [species]
  );

  const filtered = species.filter((s) => {
    if (orderFilter !== "All" && s.order !== orderFilter) return false;
    if (familyFilter !== "All" && s.family !== familyFilter) return false;
    if (damageFilter !== "All" && s.damage !== damageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const blob = [s.common, s.scientific, s.family, s.order, s.damage, s.habitat]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <div className="filterbar">
        <div className="filterbar-group">
          <span className="filterbar-label">Order</span>
          {orders.map((o) => (
            <button
              key={o}
              className={"chip" + (orderFilter === o ? " active" : "")}
              onClick={() => setOrderFilter(o)}
            >
              {o}
            </button>
          ))}
        </div>
        <div className="filterbar-group">
          <span className="filterbar-label">Family</span>
          {families.map((f) => (
            <button
              key={f}
              className={"chip" + (familyFilter === f ? " active" : "")}
              onClick={() => setFamilyFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="filterbar-group">
          <span className="filterbar-label">Where Encountered</span>
          {damages.map((d) => (
            <button
              key={d}
              className={"chip" + (damageFilter === d ? " active" : "")}
              onClick={() => setDamageFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="filterbar-spacer" />
        <div className="filterbar-count">
          {filtered.length} / {species.length} species
        </div>
      </div>

      <div className="tile-grid">
        {filtered.map((s) => (
          <SpeciesTile key={s.id} species={s} projectId={projectId} groupId={groupId} />
        ))}
      </div>
    </>
  );
}

function SpeciesTile({ species: s, projectId, groupId }) {
  const { compare, toggleCompare } = useCompare();
  const isCompared = compare.some((c) => c.id === s.id);
  const href = `/p/${projectId}/g/${groupId}/s/${s.id}`;
  const glyph = (s.common || "").split(" ")[0].slice(0, 3);

  return (
    <div style={{ position: "relative" }}>
      <Link href={href} className="tile" style={{ display: "flex" }}>
        <div className="tile-art">
          <Plate
            src={s.image}
            credit={s.imageCredit}
            label={s.common}
            tone={s.color}
            glyph={glyph}
          />
          <div className="tile-tag">{s.family}</div>
          <div className="tile-range">{s.range}</div>
          <div className="tile-reveal">
            <div className="tile-reveal-name">{s.common}</div>
            <div className="tile-reveal-sci">{s.scientific}</div>
            <div className="tile-reveal-row">
              <span className="k">Size</span>
              <span className="v">{s.size}</span>
            </div>
            <div className="tile-reveal-row">
              <span className="k">Damage</span>
              <span className="v">{s.damage}</span>
            </div>
            <div className="tile-reveal-row">
              <span className="k">Habitat</span>
              <span className="v">{s.habitat}</span>
            </div>
            <div className="tile-reveal-cta">
              <span>Open profile</span>
              <span>→</span>
            </div>
          </div>
        </div>
        <div className="tile-body">
          <div className="tile-common">{s.common}</div>
          <div className="tile-sci">{s.scientific}</div>
          <div className="tile-meta">
            <span>{s.order}</span>
            <span className="tile-meta-dot" />
            <span>{s.size}</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={"tile-compare" + (isCompared ? " on" : "")}
        aria-label={isCompared ? "Remove from compare" : "Add to compare"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCompare(s, projectId, groupId);
        }}
      >
        {isCompared ? "✓" : "+"}
      </button>
    </div>
  );
}
