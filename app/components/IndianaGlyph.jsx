// Inline silhouette of Indiana, used in stats and badges. Optional inner
// label. Uses the real state silhouette via a CSS mask so color follows tokens.
export default function IndianaGlyph({ size = 28, label, color = "currentColor" }) {
  const w = size;
  const h = Math.round(size * (161.96 / 170.10));
  const url = "/indiana.svg";
  const shape = (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: h,
        background: color,
        WebkitMask: `url(${url}) no-repeat center / contain`,
        mask: `url(${url}) no-repeat center / contain`,
        verticalAlign: "middle",
      }}
      aria-hidden="true"
    />
  );
  if (!label) return shape;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: w,
        height: h,
        lineHeight: 1,
        verticalAlign: "middle",
      }}
      aria-hidden="true"
    >
      {shape}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--display)",
          fontWeight: 700,
          fontSize: Math.round(h * 0.42),
          color: "var(--black)",
          letterSpacing: "0.04em",
          paddingTop: Math.round(h * 0.04),
        }}
      >
        {label}
      </span>
    </span>
  );
}
