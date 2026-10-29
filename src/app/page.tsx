export default function HomePage() {
  return (
    <main className="page">
      <p className="eyebrow">Project foundation</p>
      <h1>AI Academic Assistant</h1>
      <p>
        This repository currently contains the application foundation and module
        boundaries only. No academic workflows, authentication, document
        processing, retrieval, or AI features are implemented yet.
      </p>

      <section className="panel">
        <h2>Architecture</h2>
        <ul>
          <li>Next.js App Router with TypeScript</li>
          <li>Modular monolith organized by business module</li>
          <li>Clean Architecture layers inside each module</li>
          <li>PostgreSQL is the planned database; no ORM is selected</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Documentation</h2>
        <ul>
          <li>
            <code>docs/architecture/module-boundaries.md</code> — module rules
            and dependency matrix
          </li>
          <li>
            <code>docs/adr/0001-modular-monolith.md</code> — architecture
            decision record
          </li>
          <li>
            <code>src/modules/*/README.md</code> — per-module responsibilities
          </li>
        </ul>
      </section>
    </main>
  );
}
