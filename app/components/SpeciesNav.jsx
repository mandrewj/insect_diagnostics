"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Sticky in-page navigation for the species page. The page computes which
// sections are actually rendered (the references section is conditional)
// and passes them in so the nav never points at a missing anchor.
export default function SpeciesNav({ sections, prev, next }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);

  useEffect(() => {
    const onScroll = () => {
      let active = sections[0]?.id;
      for (const s of sections) {
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
  }, [sections]);

  const onClick = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: "smooth" });
  };

  return (
    <div className="species-nav">
      <div className="species-nav-inner">
        {sections.map((s) => (
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
