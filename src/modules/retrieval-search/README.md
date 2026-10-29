# Retrieval & Search

## Purpose

Owns the search and retrieval capability for eligible academic content. It must
respect document access restrictions and return source provenance suitable for
citations.

## Owns

- Retrieval query and result contracts.
- The search/retrieval capability over indexed academic content.
- Eligibility filtering at the retrieval boundary, using access information
  supplied by the owning modules.
- Source provenance returned with retrieved content.
- Future ranking and filtering behavior, if adopted.

## Must not own

- Document metadata, ownership, visibility, or file lifecycle. Those belong to
  Documents.
- Text extraction, normalization, chunking, or ingestion job state.
- AI answer generation, prompt construction, citation wording, or conversation
  behavior.
- Authentication or authorization policy definitions. It consumes identity and
  access decisions but does not define them.
- Graph concepts and relationships. Those belong to Knowledge Graph, if adopted.

No PostgreSQL Full-Text Search, pgvector, embeddings, ranking, or reranking is
implemented at this stage. The module exposes only a contract.

## Interactions

- Intends to retrieve eligible content from the indexing pipeline supplied by
  Ingestion, and to return source metadata suitable for citations.
- Must respect document access restrictions; it should receive access context or
  eligibility decisions through public contracts rather than querying another
  module's private tables.
- Exposes `ContentRetrieval` to the AI Assistant through `index.ts`.
- Must not import Ingestion's processing internals or AI Assistant internals.
- Does not currently depend on Knowledge Graph.

## Public interface

`index.ts` exports:

- `ContentRetrieval` — the application-facing retrieval interface.
- `RetrievalRequest` — the query shape.
- `RetrievedSource` — a retrieved passage with document and locator provenance.

No search adapter, index client, embedding model, ranking strategy, or database
query is exported.

## Unresolved design decisions

- Search technology: PostgreSQL full-text search, pgvector, a hybrid approach,
  or something else.
- Where the index lives and which module owns its lifecycle.
- Chunk/passage shape and how locators (page, section, character range) are
  represented.
- Ranking, filtering, and reranking strategy.
- Where access-control filtering is enforced and how eligibility is cached.
- Evaluation method and quality metrics.
- Whether graph retrieval is combined with document retrieval.
