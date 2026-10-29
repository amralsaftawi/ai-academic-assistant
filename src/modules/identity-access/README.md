# Identity & Access

## Purpose

Owns user identity, roles, authentication-related capabilities, and
authorization policies for the application.

## Owns

- User identity and account representation.
- Roles, permissions, and authorization policy decisions.
- Authentication-related application capabilities and access context.
- The answer to "may this actor perform this action on this resource?" when that
  answer is not specific to another module's domain.

## Must not own

- Subject catalog or academic reference metadata.
- Document metadata, file storage, document visibility, or document lifecycle.
- Ingestion, extraction, indexing, search, retrieval, or AI workflows.
- Conversation history or answer orchestration.
- Business rules that belong to another module. Identity supplies context;
  the owning module enforces its own domain rules.

## Interactions

- Intended to provide identity and authorization context to protected
  application flows in other modules.
- Other modules should consume an explicit Identity & Access public contract
  (for example, an access-context or authorization-decision interface) rather
  than reading identity tables or importing security adapters.
- No module currently imports another module's identity internals.

## Public interface

`index.ts` is the public entry point. No contract is exported yet because no
concrete identity flow exists. When one is added, it should be the smallest
application-facing contract needed by consumers, not an authentication provider
SDK type.

## Unresolved design decisions

- Authentication provider and session strategy.
- Role-based versus attribute/policy-based authorization.
- Institution/tenant model and how it scopes users and academic data.
- Whether user profiles belong here or in a separate module.
- How authorization context is propagated to server-side application flows.
- Ownership and retention rules for identity data.
