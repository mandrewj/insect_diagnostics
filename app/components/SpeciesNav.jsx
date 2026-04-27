"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "identification", label: "Quick ID" },
  { id: "damage", label: "Where Encountered" },
  { id: "range", label: "Range" },
  { id: "management", label: "Management" },
  { id: "lookalikes", label: "Lookalikes" },
  { id: "references", label: "References" },
];

// Sticky in-page navigation for the species page. Highlights the current
// section as the user scrolls and smooth-scrolls to anchors on click.
export default function SpeciesNav({ prev, next }) {
  const [activeSection, setActiveSection] = useState("identification");

  useEffect(() => {
    const onScroll = () => {
      let active = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top < 200) active = s.id;
      }
      setActiveSection(active);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onClick = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: "smooth" });
  };

  return (
    <div className="species-nav">
      <div className="species-nav-inner">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={activeSection === s.id ? "active" : ""}
            onClick={onClick(s.id)}
          >
            {s.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {prev && <Link href={prev.href}>← {prev.label}</Link>}
        {next && <Link href={next.href}>{next.label} →</Link>}
      </div>
    </div>
  );
}
