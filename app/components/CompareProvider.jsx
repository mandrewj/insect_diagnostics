"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Plate from "./Plate";

const CompareCtx = createContext(null);
const STORAGE_KEY = "id-compare-v1";

export function CompareProvider({ children }) {
  const [compare, setCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // hydrate from localStorage so the compare drawer survives navigation.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompare(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compare));
    } catch {}
  }, [compare]);

  const toggleCompare = useCallback((species, projectId, groupId) => {
    setCompare((prev) => {
      if (prev.some((x) => x.id === species.id)) {
        return prev.filter((x) => x.id !== species.id);
      }
      const entry = { ...species, _projectId: projectId, _groupId: groupId };
      if (prev.length >= 2) return [prev[1], entry];
      return [...prev, entry];
    });
  }, []);

  const value = useMemo(
    () => ({ compare, toggleCompare }),
    [compare, toggleCompare]
  );

  return (
    <CompareCtx.Provider value={value}>
      {children}
      <CompareBar
        compare={compare}
        onClear={() => setCompare([])}
        onRemove={(s) => setCompare((p) => p.filter((x) => x.id !== s.id))}
        onOpen={() => setShowCompare(true)}
      />
      {showCompare && compare.length === 2 && (
        <CompareModal a={compare[0]} b={compare[1]} onClose={() => setShowCompare(false)} />
      )}
    </CompareCtx.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareCtx);
  if (!ctx) return { compare: [], toggleCompare: () => {} };
  return ctx;
}

function CompareBar({ compare, onClear, onRemove, onOpen }) {
  return (
    <div className={"compare-bar " + (compare.length > 0 ? "open" : "")}>
      <div className="compare-bar-label">Compare ({compare.length}/2)</div>
      {compare.map((c) => (
        <div className="compare-pill" key={c.id}>
          <span style={{ fontStyle: "italic", fontFamily: "var(--serif)", color: "var(--gold)" }}>
            {c.scientific}
          </span>
          <button className="x" onClick={() => onRemove(c)} aria-label="Remove">
            ×
          </button>
        </div>
      ))}
      <div className="spacer" />
      <button className="clr" onClick={onClear}>
        Clear
      </button>
      <button
        className="go"
        disabled={compare.length < 2}
        onClick={onOpen}
        style={{ opacity: compare.length < 2 ? 0.5 : 1 }}
      >
        Compare side-by-side →
      </button>
    </div>
  );
}

function CompareModal({ a, b, onClose }) {
  const rows = [
    { k: "Scientific", get: (s) => <em style={{ fontFamily: "var(--serif)" }}>{s.scientific}</em> },
    { k: "Family", get: (s) => s.family },
    { k: "Order", get: (s) => s.order },
    { k: "Size", get: (s) => s.size },
    { k: "Habitat", get: (s) => s.habitat },
    { k: "Range", get: (s) => s.range },
    {
      k: "Quick-ID",
      get: (s) => (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(s.quickId || []).map((q, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {q}
            </li>
          ))}
        </ul>
      ),
    },
    { k: "Habitat notes", get: (s) => s.habitatNotes },
    { k: "Management", get: (s) => s.management },
  ];

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Side-by-side comparison</h3>
          <button className="modal-close" onClick={onClose}>
            Close ×
          </button>
        </div>
        <div className="compare-cols">
          <div className="head" />
          <div className="head">
            <div className="common">{a.common}</div>
            <div className="sci">{a.scientific}</div>
            <div className="art">
              <Plate src={a.image} credit={a.imageCredit} label={a.common} tone={a.color} />
            </div>
          </div>
          <div className="head">
            <div className="common">{b.common}</div>
            <div className="sci">{b.scientific}</div>
            <div className="art">
              <Plate src={b.image} credit={b.imageCredit} label={b.common} tone={b.color} />
            </div>
          </div>
          {rows.map((r, i) => (
            <span key={i} style={{ display: "contents" }}>
              <div className="row-k">{r.k}</div>
              <div className="row-v">{r.get(a)}</div>
              <div className="row-v">{r.get(b)}</div>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
