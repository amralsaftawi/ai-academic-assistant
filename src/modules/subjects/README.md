# Subjects

## Purpose

Owns the academic subject catalog and academic reference metadata, including the
association between subjects and references.

## Owns

- Subject records (for example, course or topic identity and descriptive
  metadata).
- Academic reference metadata associated with a subject.
- The association between a subject and a reference, using stable identifiers.
- Subject-level catalog rules that do not belong to documents or search.

## Must not own

- Uploaded PDF files or binary document storage.
- Document ownership, visibility, or document lifecycle.
- Text extraction, normalization, chunking, embeddings, or indexing.
- Retrieval, ranking, or AI answer generation.
- Another module's persistence entities or storage internals.

## Interactions

- May reference documents through stable identifiers or the Documents module's
  public contract. It must not depend on document storage internals.
- Does not need to depend on Ingestion, Retrieval & Search, or AI Assistant.
- Retrieval & Search may later consume subject identifiers as filters through a
  public contract, but no such contract exists yet.
- Identity & Access may supply authorization context; Subjects does not define
  its own identity model.

## Public interface

`index.ts` is the public entry point. No contract is exported yet. A future
contract should expose only the subject/reference information another module
genuinely needs.

## Unresolved design decisions

- Whether references are bibliographic records, links to uploaded documents, or
  both.
- Subject hierarchy, taxonomy, and cross-institution sharing rules.
- Whether subject-reference associations are owned here or jointly coordinated
  with Documents.
- Deletion and archival semantics for subjects and references.
- Whether subject browsing requires its own read model.
