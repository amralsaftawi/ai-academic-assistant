/**
 * Public API for the Retrieval & Search module.
 *
 * Search engine adapters, ranking strategies, and index implementations remain
 * private. The AI Assistant module may import only the contract below.
 */
export type {
  ContentRetrieval,
  RetrievalRequest,
  RetrievedSource,
} from "./application/contracts/content-retrieval";
