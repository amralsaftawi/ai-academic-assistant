# Test utilities

Reusable test fixtures and fakes belong here. Utilities must not become hidden
production dependencies.

Current state:

- No test runner or assertion library is installed yet.
- No shared fixtures exist.
- `tests/unit`, `tests/integration`, and `tests/architecture` describe the
  intended test layers.

Guidelines:

- Test utilities may implement module public contracts for tests.
- Do not import a module's infrastructure internals from tests unless the test is
  explicitly an integration test for that adapter.
- Keep fakes deterministic and free of network or database access.
