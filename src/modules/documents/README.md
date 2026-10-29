# Documents

## Purpose

Owns document metadata, ownership, visibility, file lifecycle, and coordination
with file storage.

## Owns

- Document metadata records and stable document identifiers.
- Document ownership and visibility.
- Document lifecycle transitions such as creation, availability, archival, and
  deletion.
- Coordination with the file-storage adapter.
- The document read contract exposed to other modules.

## Must not own

- Text extraction, normalization, chunking, or embedding generation.
- Retrieval, ranking, search indexes, or answer generation.
- Processing job status, retry behavior, or extraction failures. Those belong
  to Ingestion.
- Identity, roles, or authorization policy definitions.
- Subject catalog or academic reference metadata.

Personal documents remain private to their owner unless an explicitly designed
authorization and publication workflow is introduced later. The current
`DocumentSnapshot.visibility` field is a contract placeholder, not an
authorization implementation.

## Interactions

- Exposes `DocumentReader` and `DocumentSnapshot` through `index.ts`.
  Ingestion consumes this contract to obtain the metadata it needs.
- May consume Identity & Access context to enforce ownership and visibility
  rules; it must not implement authentication itself.
- Subjects may reference documents by stable identifier or public contract, but
  must not read document persistence or storage internals.
- Does not depend on Ingestion, Retrieval & Search, Knowledge Graph, or AI
  Assistant.

## Public interface

`index.ts` exports:

- `DocumentSnapshot` — a read-only metadata shape for cross-module use.
- `DocumentVisibility` — the proposed visibility categories.
- `DocumentReader` — the read interface implemented by Documents infrastructure
  and injected into consumers.

No repository, storage adapter, ORM entity, or upload implementation is exported.

## Unresolved design decisions

- File storage provider and upload/download flow.
- The final visibility and publication model, including sharing within an
  institution.
- Whether document versions are supported and how they relate to ingestion runs.
- Soft-delete, retention, and legal-hold behavior.
- How ownership transfer and administrative access are authorized.
- Whether document metadata and subject-reference metadata share a model.
