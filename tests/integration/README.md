# Integration tests

Integration tests should cover adapters and cross-module workflows at their
public boundaries, including persistence adapters once a database is selected.

Current state: no database, ORM, test runner, or integration environment is
configured. Do not add database tests before the persistence design exists.
