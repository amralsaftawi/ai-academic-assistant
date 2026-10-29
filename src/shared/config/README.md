# Shared configuration

This folder is reserved for cross-cutting configuration helpers, such as reading
and validating environment variables.

Current state:

- No configuration module is implemented yet.
- `DATABASE_URL` is documented in `.env.example` as a placeholder because
  PostgreSQL is the planned database.
- No database client, ORM, authentication provider, or AI SDK is configured.

Guidelines:

- Read secrets from the environment; never hard-code them.
- Fail fast on missing required configuration at process startup once runtime
  configuration is introduced.
- Do not place module-specific business rules here. Configuration keys that
  belong to a single module should stay with that module.
