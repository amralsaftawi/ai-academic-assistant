# Shared kernel

`shared/` contains genuinely cross-cutting technical utilities only. It is not a
place for business logic, module-specific models, or convenience re-exports.

Allowed examples:

- Error and result types
- Logging interfaces
- Environment configuration helpers
- Generic date, identifier, or validation utilities that have no module-specific
  meaning

Forbidden:

- Importing anything from `src/modules/*`
- Importing Next.js, React, database clients, or AI SDKs into generic utilities
  where that would make them non-reusable
- Module business rules

Current contents:

- `errors/` — application error base classes
- `logging/` — logger interface and a console implementation
- `types/` — a small `Result` utility
- `config/` — documentation only; no runtime configuration module yet
- `database/` — documentation only; PostgreSQL is planned, no ORM is selected
