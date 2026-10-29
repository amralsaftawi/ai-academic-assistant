# Architecture tests

This folder contains the guardrails for module boundaries and dependency rules.
They use Node built-ins only; no test framework or architecture-analysis
dependency is installed.

## What the check enforces

`check-module-boundaries.mjs` scans every `.ts` and `.tsx` file under `src/` and
enforces the rules in `docs/architecture/module-boundaries.md`:

- Every directory under `src/modules/` has an `index.ts` and a `README.md`.
- Cross-module imports, whether written with the `@/` alias or a relative path,
  target the other module's public `index.ts`.
- The only approved cross-module dependencies are:
  - `ingestion` → `documents`
  - `ai-assistant` → `retrieval-search`
- Every other module-to-module edge is rejected, even when the target API is
  public.
- A module or `src/shared/` file must not import `src/app/`, including through
  relative paths.
- `src/shared/` must not import any business module.
- A module's `index.ts` must not import or re-export its own
  `infrastructure/`.
- `domain/` code must not import Next.js, React, the database layer, another
  module, or application/infrastructure code.
- `application/` code must not import its own concrete infrastructure.
- The module dependency graph must be acyclic.
- Same-module imports and imports of genuinely shared technical utilities under
  `src/shared/` remain allowed.

Diagnostics name the source file, the offending import/export specifier, the
resolved target where relevant, and the rule that failed. The script exits
non-zero when any violation is found.

## What it does not enforce

- It uses regular expressions over import/export specifiers, not a full
  TypeScript program with type resolution.
- It is intentionally TypeScript-only. JavaScript, JSX, MJS, CJS, CommonJS
  `require()`, and package-level imports are not scanned. `tsconfig.json` keeps
  `allowJs` set to `false` to match this scope.
- It does not detect indirect exposure, such as an `index.ts` exporting a
  helper that itself imports `infrastructure/`. It does flag direct imports and
  re-exports of infrastructure from `index.ts`.
- It does not validate contract shape, runtime behavior, authorization, or
  whether an approved edge is actually appropriate for a new use case.
- It scans `src/` only; configuration and tooling code are outside its scope.

## Running the checks

```bash
npm run arch:check   # scan the real src/ tree
npm run arch:test    # run the fixture-based tests for the checker itself
npm run check        # lint, typecheck, arch:check, and arch:test
```

The fixture tests create isolated temporary `src/` trees under the operating
system's temporary directory. They are removed in a `finally` block even when an
assertion fails, and they never add fake modules to the repository's
`src/modules/`.

## Approving a new cross-module dependency

1. Confirm the dependency is a real responsibility relationship, not
   convenience, and that it does not create a cycle.
2. Consume only the target module's public `index.ts` contract or application
   entry point.
3. Add the directed edge to the approved dependency matrix in
   `docs/architecture/module-boundaries.md` and to the owning module's
   `README.md`.
4. Add the edge to `APPROVED_CROSS_MODULE_DEPENDENCIES` in
   `check-module-boundaries.mjs`.
5. Add or update a fixture in `check-module-boundaries.test.mjs` that proves the
   edge is allowed and an unapproved edge is still rejected.
6. Run `npm run check`.
