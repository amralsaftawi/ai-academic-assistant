import { NextResponse } from "next/server";

import { LoadDocumentForIngestionUseCase } from "@/modules/ingestion";
import { ApplicationError } from "@/shared/errors/application-error";

import { unavailableDocumentReader } from "../unavailable-document-reader";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

/**
 * Compile-time architecture example.
 *
 * This route lives under a private `_examples` folder, so Next.js does not
 * expose it as a public endpoint. It demonstrates:
 * - a route handler calling a module application entry point;
 * - that entry point consuming another module's public contract;
 * - an interface dependency injected instead of importing a concrete adapter
 *   from a module's infrastructure layer.
 *
 * The injected reader intentionally reports "not implemented"; no database,
 * authentication, extraction, or document-processing work happens here.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { documentId } = await context.params;
  const useCase = new LoadDocumentForIngestionUseCase(unavailableDocumentReader);

  try {
    const document = await useCase.execute({ documentId });
    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode },
      );
    }

    throw error;
  }
}
