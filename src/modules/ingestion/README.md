# Ingestion

## Purpose

Owns the document-processing workflow: extraction, normalization, processing
status, failures, and retry-related behavior.

## Owns

- Processing runs for a document.
- Extraction and normalization workflow state (not the document file itself).
- Processing status, failure records, and retry-related behavior.
- Idempotency and re-processing rules for a document version.
- The processing results that downstream indexing may consume.

## Must not own

- Document ownership, visibility, metadata, or file lifecycle. Those belong to
  Documents.
- The stored document file or general file storage.
- Text search, ranking, retrieval, or answer generation.
- Authentication or authorization policy definitions.
- Knowledge graph concepts or relationships.

Ingestion consumes documents through an explicit contract and must not silently
change a document's visibility or ownership.

## Interactions

- Consumes the Documents module's public `DocumentReader` contract.
- `LoadDocumentForIngestionUseCase` in this module is a minimal application
  entry point that demonstrates loading document metadata through that contract.
  It does not perform extraction or processing.
- Intends to publish or expose processing results for downstream indexing
  through an explicit contract. No such contract is implemented yet.
- May receive identity context for who initiated a run, but it does not own
  identity.
- Must not import Retrieval & Search internals or write search indexes directly.

Actual PDF parsing, background workers, queues, and retry schedulers are not
implemented at this stage.

## Public interface

`index.ts` exports:

- `LoadDocumentForIngestionUseCase` — the minimal example entry point.
- `LoadDocumentForIngestionInput` — its input type.

No extraction adapter, worker, queue, repository, or processing implementation
is exported.

## Unresolved design decisions

- Whether processing runs inside the Next.js process or in a separate worker
  process within the same deployment.
- Background-job and retry mechanism, if any.
- Supported input formats and extraction tooling.
- Where normalized output is stored and in what shape.
- Processing status model and how clients observe progress.
- Idempotency keys and handling of document version changes.
- The contract by which indexing consumes processing results.
