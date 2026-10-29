# ADR 0001: Use a modular monolith

- Status: Accepted
- Date: 2026-10-29
- Deciders: Project maintainers (initial foundation)

## Context

The AI Academic Assistant is a new application with a small initial codebase and
several business capabilities that are expected to evolve: identity and access,
subjects, documents, ingestion, retrieval and search, a possible knowledge
graph, and an AI assistant.

The boundaries between these capabilities are not yet proven. The MVP must stay
simple to operate, and the team needs room to discover the right domain model
before committing to distributed infrastructure. The application is built with
Next.js and TypeScript and is expected to run as one application initially.
PostgreSQL is the planned relational database, but no ORM or schema has been
selected.

## Decision

Build the application as a **modular monolith**:

- One Next.js application and one deployment unit.
- Code organized by business module under `src/modules`.
- Each module has internal `domain`, `application`, and `infrastructure` layers
  where they add value.
- Each module exposes a small public API through `index.ts`.
- Cross-module imports must use that public API; deep imports are forbidden.
- Application code depends on interfaces, and infrastructure implements them.
- Modules share one planned PostgreSQL database, but do not read or write each
  other's private persistence.
- Dependencies remain logical and explicit; there are no separate services,
  message brokers, caches, graph databases, or vector databases at this stage.

## Reasons

- The product and its domain boundaries are still being discovered.
- A single deployment is cheaper and simpler to develop, test, deploy, and
  observe than distributed services.
- Next.js route handlers, server components, and future background processing
  can share one codebase and one set of module contracts.
- A single relational database can support initial transactions and reporting
  without distributed consistency problems.
- Clean Architecture inside each module makes business rules testable without
  Next.js, a database, or an LLM provider.
- Explicit public APIs preserve the option to extract a module later if a real
  scaling or team-boundary need appears.

## Benefits

- Lower operational complexity for the MVP.
- Clear ownership of business capabilities.
- Business logic separated from UI, route handlers, and infrastructure.
- Easier refactoring while boundaries are still fluid.
- Simpler local development and CI.
- One migration path to PostgreSQL and one deployment pipeline.
- Modules can evolve independently without premature network boundaries.

## Trade-offs and risks

- **Boundary erosion:** without network or package boundaries, developers can
  accidentally import internals. This is mitigated by module READMEs, review, and
  `npm run arch:check`, but those checks are not absolute.
- **Single deploy blast radius:** a defect in one module can affect the whole
  application. Independent deployment and fault isolation are not available.
- **Shared database coupling:** schema changes can affect multiple modules, and
  table ownership must be enforced by discipline.
- **Build and test time:** the whole application builds together; this is
  acceptable at the expected initial size.
- **Scaling granularity:** modules cannot be scaled independently without later
  extraction or process separation.
- **Refactoring cost:** if a module is extracted later, its public contracts and
  data ownership must already be clean.

## Consequences

- New modules require a public `index.ts`, a README, and an explicit boundary
  decision.
- Cross-module calls use contracts, not concrete adapters.
- Domain code stays framework-free.
- Shared code stays technical and must not depend on modules.
- A module extraction is a future option, not an assumption in the current
  design.
- Architecture decisions that change boundaries should be recorded as new ADRs.

## Unresolved decisions (not decided by this ADR)

- Database ORM, migration tool, and schema ownership per module.
- Authentication provider and authorization model.
- Search strategy (PostgreSQL full-text search, pgvector, hybrid, or other).
- Whether the Knowledge Graph is in the MVP and what storage it needs.
- Background processing and retry mechanism for ingestion.
- Conversation persistence and whether it is a separate module.
- Multi-institution/tenant model.
- Deployment platform and operational tooling.
