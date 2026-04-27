"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Sticky top bar with the lockup, breadcrumb trail derived from the URL,
// and a search box that writes ?q= so the group page can read it.
export default function AppBar({ navIndex }) {
  const pathname = usePathname() || "/";
  const params = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(params.get("q") || "");

  useEffect(() => {
    setSearch(params.get("q") || "");
  }, [params]);

  const crumbs = useMemo(() => buildCrumbs(pathname, navIndex), [pathname, navIndex]);

  const onSubmit = (e) => {
    e.preventDefault();
    pushSearch(router, pathname, params, search);
  };

  return (
    <div className="appbar">
      <Link
        className="appbar-title"
        href="/"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        Insect Diagnostics
      </Link>
      <div className="appbar-crumbs">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "contents" }}>
            {i > 0 && <span className="sep">/</span>}
            {c.href ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span style={{ color: c.current ? "var(--black)" : "var(--cool-gray)" }}>
                {c.label}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="appbar-spacer" />
      <form className="search-box" onSubmit={onSubmit}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--cool-gray)" }}>⌕</span>
        <input
          placeholder="Search species, family, symptom…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => pushSearch(router, pathname, params, search)}
        />
      </form>
    </div>
  );
}

function pushSearch(router, pathname, params, value) {
  const next = new URLSearchParams(params);
  if (value) next.set("q", value);
  else next.delete("q");
  const qs = next.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

function buildCrumbs(pathname, navIndex) {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) {
    return [{ label: "Diagnostics", current: true }];
  }
  if (segs[0] !== "p" || !segs[1]) {
    return [{ label: "Diagnostics", href: "/" }, { label: "Not found", current: true }];
  }
  const projectId = segs[1];
  const project = navIndex[projectId];
  const projectName = project ? project.name : "Project";

  if (segs.length === 2) {
    return [
      { label: "Diagnostics", href: "/" },
      { label: projectName, current: true },
    ];
  }
  if (segs[2] === "g" && segs[3]) {
    const groupId = segs[3];
    const group = project && project.groups[groupId];
    const groupName = group ? group.name : "Group";

    if (segs.length === 4) {
      return [
        { label: "Diagnostics", href: "/" },
        { label: projectName, href: `/p/${projectId}` },
        { label: groupName, current: true },
      ];
    }
    if (segs[4] === "s" && segs[5]) {
      const speciesId = segs[5];
      const speciesName = (group && group.species[speciesId]) || "Species";
      return [
        { label: "Diagnostics", href: "/" },
        { label: projectName, href: `/p/${projectId}` },
        { label: groupName, href: `/p/${projectId}/g/${groupId}` },
        { label: speciesName, current: true },
      ];
    }
  }
  return [{ label: "Diagnostics", href: "/" }];
}
