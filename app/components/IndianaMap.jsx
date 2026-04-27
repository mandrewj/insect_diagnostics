// Stylized Indiana outline used on the species range section. Regions
// (north / central / south) are shaded based on the species `range` field.
export default function IndianaMap({ range }) {
  const path =
    "M120 20 L210 24 L240 30 L260 50 L262 90 L268 130 L275 175 L282 230 L286 285 L290 340 L255 360 L210 364 L165 360 L120 354 L100 308 L96 260 L92 210 L94 160 L100 110 L108 60 Z";

  const regions = [
    { id: "n", label: "Northern" },
    { id: "c", label: "Central" },
    { id: "s", label: "Southern" },
  ];

  const lower = (range || "").toLowerCase();
  const fill = (id) => {
    if (lower.includes("statewide")) return "var(--gold-rush)";
    if (lower.includes("southern") && id === "s") return "var(--gold-rush)";
    if (lower.includes("northern") && id === "n") return "var(--gold-rush)";
    if (lower.includes("central") && id === "c") return "var(--gold-rush)";
    return "transparent";
  };

  return (
    <svg viewBox="0 0 380 400" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="380" height="400" fill="var(--paper-2)" />
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y) => (
        <line key={"h" + y} x1="0" y1={y} x2="380" y2={y} stroke="rgba(0,0,0,0.04)" />
      ))}
      {[40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
        <line key={"v" + x} x1={x} y1="0" x2={x} y2="400" stroke="rgba(0,0,0,0.04)" />
      ))}
      <path d={path} fill="white" stroke="var(--black)" strokeWidth="1.5" />
      <defs>
        <clipPath id="clip-state">
          <path d={path} />
        </clipPath>
      </defs>
      {regions.map((r) => {
        let y, height;
        if (r.id === "n") { y = 0; height = 130; }
        else if (r.id === "c") { y = 130; height = 110; }
        else { y = 240; height = 160; }
        return (
          <rect
            key={r.id}
            x="0"
            y={y}
            width="380"
            height={height}
            fill={fill(r.id)}
            fillOpacity="0.85"
            clipPath="url(#clip-state)"
          />
        );
      })}
      <path d={path} fill="none" stroke="var(--black)" strokeWidth="1.5" />
      <text x="180" y="80" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" letterSpacing="2" fill="var(--steel)">N</text>
      <text x="180" y="195" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" letterSpacing="2" fill="var(--steel)">C</text>
      <text x="195" y="320" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" letterSpacing="2" fill="var(--steel)">S</text>
      <g transform="translate(330, 40)">
        <circle r="14" fill="white" stroke="var(--line-soft)" />
        <text textAnchor="middle" y="-2" fontFamily="var(--mono)" fontSize="8" fill="var(--cool-gray)">N</text>
        <line x1="0" y1="2" x2="0" y2="10" stroke="var(--gold-aged)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
