export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="lockup">Insect Diagnostics</div>
          <div className="small">
            A product of the{" "}
            <strong style={{ color: "var(--gold)" }}>
              Insect Diversity and Diagnostics Lab
            </strong>
            , Department of Entomology, Purdue University &mdash; in cooperation
            with Purdue Extension. Visual identification reference. Always
            confirm identifications with a specimen and consult an extension
            specialist for treatment decisions.
          </div>
        </div>
        <div>
          <h4>Resources</h4>
          <a href="https://ag.purdue.edu/department/btny/ppdl/" target="_blank" rel="noopener noreferrer">
            Plant &amp; Pest Diagnostic Lab
          </a>
          <a href="https://insectid.org" target="_blank" rel="noopener noreferrer">
            Insect Diversity &amp; Diagnostics Lab
          </a>
        </div>
      </div>
    </footer>
  );
}
