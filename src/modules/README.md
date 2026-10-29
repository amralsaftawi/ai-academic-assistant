# Business modules

Each folder under `src/modules` is a business module with its own internal
Clean Architecture layers:

```text
<module>/
├── domain/          # Entities, value objects, policies; no framework or I/O
├── application/     # Use cases, commands, queries, and ports/contracts
├── infrastructure/  # Adapters for persistence, storage, security, search, LLM
├── index.ts         # Public API: the only cross-module import path
└── README.md        # Responsibility and boundary documentation
```

Modules:

| Module | Primary responsibility |
| --- | --- |
| `identity-access` | Identity, roles, authentication capabilities, authorization policies |
| `subjects` | Academic subject catalog and reference metadata |
| `documents` | Document metadata, ownership, visibility, lifecycle, storage coordination |
| `ingestion` | Extraction, normalization, processing status, failures, retries |
| `knowledge-graph` | Concepts, relationships, evidence (not confirmed for MVP) |
| `retrieval-search` | Search and retrieval over eligible content with provenance |
| `ai-assistant` | Question-answering orchestration, LLM abstraction, citations |

Rules of thumb:

- Import another module only through its `index.ts`.
- Do not import another module's `domain/`, `application/`, or
  `infrastructure/` path directly.
- Do not add a dependency merely to make the diagram look connected.
- Domain code must stay free of Next.js, database, AI SDK, and infrastructure
  imports.
- Application code depends on interfaces; infrastructure implements them.
- App Router route handlers call application entry points.

See `docs/architecture/module-boundaries.md` for the full matrix and dependency
rules.
