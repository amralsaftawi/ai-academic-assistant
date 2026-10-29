import type { DocumentReader } from "@/modules/documents";
import { NotImplementedError } from "@/shared/errors/application-error";

/**
 * Example-only adapter used by the API route example.
 *
 * It exists to show that a concrete implementation can be injected into an
 * application use case without being exported from the module's public API.
 * It deliberately has no persistence behaviour and always reports that document
 * storage is not implemented.
 */
export const unavailableDocumentReader: DocumentReader = {
  async findById(): Promise<never> {
    throw new NotImplementedError(
      "Document persistence is not implemented yet. This reader exists only to demonstrate dependency injection.",
    );
  },
};
