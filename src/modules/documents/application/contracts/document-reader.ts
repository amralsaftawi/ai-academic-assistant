/**
 * Public read contract exposed by the Documents module.
 *
 * This is the only document shape another module should rely on. It intentionally
 * contains metadata and a storage reference, not persistence entities or
 * infrastructure adapters.
 */
export type DocumentVisibility = "private" | "institution" | "public";

export interface DocumentSnapshot {
  readonly id: string;
  readonly ownerId: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly storageKey: string;
  readonly visibility: DocumentVisibility;
}

/**
 * Read-only access to document metadata.
 *
 * Ingestion depends on this interface and receives an implementation through
 * dependency injection. Documents owns the implementation.
 */
export interface DocumentReader {
  findById(documentId: string): Promise<DocumentSnapshot | null>;
}
