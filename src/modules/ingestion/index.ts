/**
 * Public API for the Ingestion module.
 *
 * Application entry points and cross-module contracts may be exported here.
 * Worker, extraction, and persistence implementations must stay private.
 */
export { LoadDocumentForIngestionUseCase } from "./application/use-cases/load-document-for-ingestion";
export type { LoadDocumentForIngestionInput } from "./application/use-cases/load-document-for-ingestion";
