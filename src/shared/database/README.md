# Shared database

PostgreSQL is the planned relational database for the application.

Current state:

- No database driver, ORM, query builder, migration tool, or schema exists.
- No module may assume a specific persistence technology from this folder.
- `src/shared/database` is intentionally empty of implementation code for now.

Intended conventions:

- Each module defines persistence interfaces in its application layer and
  implements them in its own `infrastructure/persistence` folder.
- Infrastructure adapters may use a shared connection/pool helper once one is
  introduced, but modules must not import each other's adapters.
- Cross-module transactions should be handled through explicit application
  workflows rather than by reaching into another module's tables.
- Migration ownership and schema boundaries are unresolved design decisions.
