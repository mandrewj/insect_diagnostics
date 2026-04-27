// Striped SVG placeholder with a tonal wash, monospace label, and faint glyph.
export default function Placeholder({ label, tone = "#8E6F3E", glyph }) {
  return (
    <div className="ph">
      <div className="ph-stripes" />
      <div className="ph-tone" style={{ background: tone }} />
      {glyph && <div className="ph-glyph">{glyph}</div>}
      <div className="ph-label">[ {label} ]</div>
    </div>
  );
}
