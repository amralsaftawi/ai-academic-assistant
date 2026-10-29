# Knowledge Graph

## Purpose

Responsible for concepts, relationships, and evidence linking concepts to
academic sources.

Inclusion of this module in the folder structure does not mean that a graph
database or Knowledge Graph functionality is required for the MVP. No graph
storage or graph feature is implemented.

## Owns

- Concept records and concept identity, if the feature is adopted.
- Relationships between concepts.
- Evidence links that associate a concept or relationship with an academic
  source.
- Graph-specific metadata and provenance.
- Graph-oriented read contracts, if and when the feature is adopted.

## Must not own

- Source documents, document ownership, visibility, or file storage.
- Text extraction, chunking, or ingestion job state.
- Search indexing, ranking, or general retrieval.
- AI answer generation or conversation behavior.
- Authentication or authorization policy definitions.
- Source content that should be read through Documents or Ingestion contracts.

## Interactions

- May consume extracted content and processing results through Ingestion's
  public contract if the feature is adopted.
- May reference documents and academic sources through stable identifiers or
  public contracts; it must not read their persistence internals.
- May expose graph-related retrieval capabilities to Retrieval & Search or AI
  Assistant through an explicit public contract if adopted.
- Has no required dependency at this stage and should not be imported to make
  the architecture look connected.

## Public interface

`index.ts` is the public entry point. No contract is exported yet, and no graph
storage technology has been selected.

## Unresolved design decisions

- Whether Knowledge Graph functionality belongs in the MVP at all.
- Whether graph-like relationships can be modelled relationally in PostgreSQL.
- Whether a dedicated graph database is ever justified.
- Concept schema, relationship taxonomy, and evidence/provenance model.
- Who or what creates concepts and relationships (manual curation, extraction,
  or both).
- Whether graph capabilities are exposed to retrieval or directly to the AI
  Assistant.
