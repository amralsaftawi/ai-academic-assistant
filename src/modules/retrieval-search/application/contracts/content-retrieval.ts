/**
 * Public retrieval contract exposed by the Retrieval & Search module.
 *
 * The AI Assistant module may depend on this interface. It deliberately avoids
 * committing to a search engine, embedding model, ranking strategy, or storage
 * implementation.
 */
export interface RetrievalRequest {
  readonly query: string;
  readonly limit?: number;
  readonly filters?: {
    readonly subjectId?: string;
    readonly documentIds?: readonly string[];
  };
}

export interface RetrievedSource {
  readonly sourceId: string;
  readonly documentId: string;
  readonly excerpt: string;
  /** Human-readable location such as a page, section, or character range. */
  readonly locator?: string;
}

export interface ContentRetrieval {
  retrieve(
    request: RetrievalRequest,
  ): Promise<readonly RetrievedSource[]>;
}
