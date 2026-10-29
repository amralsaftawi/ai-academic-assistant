import type { DocumentReader, DocumentSnapshot } from "@/modules/documents";
import { NotFoundError } from "@/shared/errors/application-error";

export interface LoadDocumentForIngestionInput {
  readonly documentId: string;
}

/**
 * Minimal application-level entry point used by the architecture example.
 *
 * It loads document metadata through the Documents module's public contract.
 * It does not extract, transform, store, or process document content.
 */
export class LoadDocumentForIngestionUseCase {
  constructor(private readonly documents: DocumentReader) {}

  async execute(
    input: LoadDocumentForIngestionInput,
  ): Promise<DocumentSnapshot> {
    const document = await this.documents.findById(input.documentId);

    if (document === null) {
      throw new NotFoundError(
        `Document "${input.documentId}" was not found.`,
      );
    }

    return document;
  }
}
