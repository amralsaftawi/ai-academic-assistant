# AI Assistant

## Purpose

Owns question-answering orchestration, conversation-related application behavior
if that remains the selected design, LLM integration abstractions, and answer
citation coordination.

## Owns

- The application workflow that turns a question into a grounded answer.
- Conversation-related application behavior, if conversation history is kept.
- LLM integration abstractions (ports), not a specific vendor SDK.
- Context assembly from retrieved sources.
- Citation coordination and the representation of cited sources in answers.
- Guardrail and refusal behavior that belongs to answer generation.

## Must not own

- Document metadata, ownership, visibility, file lifecycle, or storage.
- Extraction, normalization, chunking, indexing, or ingestion state.
- Search/retrieval implementation. It depends on Retrieval & Search through an
  explicit contract.
- Knowledge graph storage or concept curation.
- Authentication or authorization policy definitions. It consumes identity and
  access context.
- Direct access to another module's private persistence implementation.
- Bypassing another module's authorization rules.

## Interactions

- May depend on the Retrieval & Search module's public `ContentRetrieval`
  interface. This relationship is documented and the contract exists, but no
  answering use case is implemented yet.
- May consume Identity & Access context for protected flows.
- Must not reach into Documents, Ingestion, Retrieval & Search, or Knowledge
  Graph internal paths.
- Must not call an LLM or perform real AI requests at this stage.

## Public interface

`index.ts` is the public entry point. No use case or contract is exported yet.
A future public entry point should expose the smallest application-facing
answer operation needed by the App Router, not LLM SDK types.

## Unresolved design decisions

- Whether conversation history is persisted, and if so, by which module.
- Stateless versus stateful request model and streaming behavior.
- LLM provider and model selection.
- Prompt/context assembly strategy and token limits.
- Citation format, verification, and handling of unsupported claims.
- Safety, refusal, and academic-integrity guardrails.
- Whether conversation data belongs here or in a separate Conversations module.
- Evaluation approach for answer quality and grounding.
