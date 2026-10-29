# API routes

Next.js route handlers in this folder should be thin adapters:

1. Parse and validate the HTTP request.
2. Obtain identity/authorization context through the Identity & Access module's
   public contract when that module exists.
3. Call a module application entry point (a use case or query).
4. Map the application result or error to an HTTP response.

Route handlers must not:

- Import module `domain/`, `application/`, or `infrastructure/` implementation
  paths directly.
- Query a database, file store, search index, or LLM directly.
- Contain business rules that belong in a module.

The `_examples/` folder is private to the App Router and is not exposed as a
public endpoint. It exists only to keep the intended integration pattern
compilable. See `_examples/ingestion-documents` for the current example.
