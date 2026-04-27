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
          <h4>Diagnostics</h4>
          <a href="/">All projects</a>
          <a href="#">Recent additions</a>
          <a href="#">Specimen submission</a>
        </div>
        <div>
          <h4>Resources</h4>
          <a href="https://extension.purdue.edu" target="_blank" rel="noopener">
            Purdue Extension
          </a>
          <a href="https://ag.purdue.edu/department/entomology/ppdl/" target="_blank" rel="noopener">
            Plant &amp; Pest Diagnostic Lab
          </a>
          <a href="#">Field guides</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="#">Ask an entomologist</a>
          <a href="#">Submit a sample</a>
          <a href="mailto:extension@purdue.edu">extension@purdue.edu</a>
        </div>
      </div>
    </footer>
  );
}
