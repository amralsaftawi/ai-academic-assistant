# AI Academic Assistant

Foundation for an AI academic assistant built as a **modular monolith** with
Next.js, TypeScript, and Clean Architecture inside each business module.

This repository currently contains project structure, module boundaries,
documentation, and a small compilable integration example. It does **not**
implement authentication, document processing, retrieval, database access, or AI
features yet.

## Requirements

- Node.js 20.9 or newer
- npm (the existing package manager and lockfile)

## Commands

```bash
npm install      # install dependencies
npm run dev      # start the Next.js development server
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
npm run typecheck # TypeScript without emitting files
npm run arch:check # module boundary and cycle guard
npm run check    # lint + typecheck + arch:check
```

## Project structure

```text
src/
├── app/                  # Next.js App Router: UI and thin route handlers
│   ├── (auth)/           # route group, no routes yet
│   ├── (student)/        # route group, no routes yet
│   ├── (admin)/          # route group, no routes yet
│   ├── api/              # route handlers + private compile-time example
│   ├── layout.tsx
│   └── page.tsx
├── modules/              # business modules, each with its own public API
│   ├── identity-access/
│   ├── subjects/
│   ├── documents/
│   ├── ingestion/
│   ├── knowledge-graph/
│   ├── retrieval-search/
│   └── ai-assistant/
├── shared/               # cross-cutting technical utilities only
└── test-utils/           # reusable test fixtures/fakes (no fixtures yet)
tests/
├── unit/                 # currently documentation only
├── integration/          # currently documentation only
└── architecture/         # dependency-free boundary check
docs/
├── architecture/         # module boundary rules
├── diagrams/             # diagram notes
└── adr/                  # architecture decision records
```

Every module contains `domain/`, `application/`, and `infrastructure/` folders
as appropriate, plus an `index.ts` public entry point and a `README.md`.

## Module boundaries

- The App Router calls module application entry points, not repositories or
  infrastructure adapters.
- A module may import another module only through its `index.ts`.
- Domain code stays free of Next.js, the database, AI SDKs, and infrastructure.
- Application code depends on interfaces; infrastructure implements them.
- Only genuine cross-module dependencies are introduced.

See [`docs/architecture/module-boundaries.md`](docs/architecture/module-boundaries.md)
for the responsibility matrix, allowed and forbidden dependencies, and the
logical dependency diagram. See
[`docs/adr/0001-modular-monolith.md`](docs/adr/0001-modular-monolith.md) for the
decision record.

## Current integration example

`src/app/api/_examples/ingestion-documents/[documentId]/route.ts` is a
compile-time example inside a private App Router folder. Next.js does not expose
it as an endpoint. It demonstrates:

- a route handler calling an application entry point;
- Ingestion consuming the Documents module's public `DocumentReader` contract;
- an interface dependency injected instead of a concrete infrastructure import.

The injected reader deliberately reports that document persistence is not
implemented. No authentication, database, extraction, or AI request happens.

## Database and environment

PostgreSQL is the planned relational database, but no database client, ORM,
migration system, or schema exists yet. `.env.example` contains placeholder
configuration names only. Copy it to `.env.local` when local configuration is
needed; never commit real secrets.

## Status and next step

The next step is to choose the first vertical slice with a real requirement,
then implement it through the module boundaries: domain model, application
contract, infrastructure adapter, and a thin entry point. Database, auth, search,
and LLM choices remain intentionally unresolved.
