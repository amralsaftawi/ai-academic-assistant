/**
 * Public API for the Documents module.
 *
 * Only cross-module contracts are exported here. Persistence and storage
 * adapters remain private implementation details.
 */
export type {
  DocumentReader,
  DocumentSnapshot,
  DocumentVisibility,
} from "./application/contracts/document-reader";
