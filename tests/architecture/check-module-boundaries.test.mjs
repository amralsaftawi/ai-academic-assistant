import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { checkModuleBoundaries } from "./check-module-boundaries.mjs";

async function writeFixtureFile(srcRoot, relativePath, contents) {
  const filePath = path.join(srcRoot, ...relativePath.split("/"));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${contents.trim()}\n`, "utf8");
}

async function createModule(srcRoot, name, indexSource = "export {};") {
  await writeFixtureFile(srcRoot, `modules/${name}/index.ts`, indexSource);
  await writeFixtureFile(srcRoot, `modules/${name}/README.md`, "# Fixture module");
}

async function withFixture(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "arch-boundaries-"));
  const srcRoot = path.join(root, "src");
  await mkdir(srcRoot, { recursive: true });

  try {
    return await run(srcRoot);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("accepts a valid same-module import", async () => {
  await withFixture(async (srcRoot) => {
    await createModule(
      srcRoot,
      "alpha",
      'export { loadAlpha } from "./application/load-alpha";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/alpha/domain/value.ts",
      "export const value = 1;",
    );
    await writeFixtureFile(
      srcRoot,
      "modules/alpha/application/load-alpha.ts",
      [
        'import { value } from "../domain/value";',
        "",
        "export const loadAlpha = () => value;",
      ].join("\n"),
    );

    const result = await checkModuleBoundaries({ srcRoot });

    assert.deepEqual(result.errors, []);
  });
});

test("accepts an approved cross-module public import and a shared utility", async () => {
  await withFixture(async (srcRoot) => {
    await createModule(
      srcRoot,
      "documents",
      'export type { DocumentReader } from "./application/contracts/document-reader";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/documents/application/contracts/document-reader.ts",
      [
        "export interface DocumentReader {",
        "  findById(documentId: string): Promise<null>;",
        "}",
      ].join("\n"),
    );

    await createModule(
      srcRoot,
      "ingestion",
      'export type { UseDocuments } from "./application/use-documents";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/ingestion/application/use-documents.ts",
      [
        'import type { DocumentReader } from "@/modules/documents";',
        'import type { Logger } from "@/shared/logging/logger";',
        "",
        "export type UseDocuments = {",
        "  reader: DocumentReader;",
        "  logger: Logger;",
        "};",
      ].join("\n"),
    );
    await writeFixtureFile(
      srcRoot,
      "shared/logging/logger.ts",
      "export interface Logger { info(message: string): void; }",
    );

    const result = await checkModuleBoundaries({ srcRoot });

    assert.deepEqual(result.errors, []);
  });
});

test("rejects a private cross-module import through a relative path", async () => {
  await withFixture(async (srcRoot) => {
    await createModule(
      srcRoot,
      "documents",
      'export type { DocumentReader } from "./application/contracts/document-reader";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/documents/application/contracts/document-reader.ts",
      "export interface DocumentReader { findById(documentId: string): Promise<null>; }",
    );
    await createModule(srcRoot, "ingestion");
    await writeFixtureFile(
      srcRoot,
      "modules/ingestion/application/use-private-reader.ts",
      [
        'import type { DocumentReader } from "../../documents/application/contracts/document-reader";',
        "",
        "export type PrivateReader = DocumentReader;",
      ].join("\n"),
    );

    const result = await checkModuleBoundaries({ srcRoot });

    assert.equal(result.errors.length, 1);
    assert.match(
      result.errors[0],
      /modules\/ingestion\/application\/use-private-reader\.ts: \[cross-module-deep-import\]/,
    );
    assert.match(result.errors[0], /document-reader/);
  });
});

test("rejects an infrastructure re-export from a public index", async () => {
  await withFixture(async (srcRoot) => {
    await createModule(
      srcRoot,
      "documents",
      'export { DocumentStore } from "./infrastructure/document-store";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/documents/infrastructure/document-store.ts",
      "export class DocumentStore {}",
    );

    const result = await checkModuleBoundaries({ srcRoot });

    assert.equal(result.errors.length, 1);
    assert.match(
      result.errors[0],
      /modules\/documents\/index\.ts: \[public-infrastructure\]/,
    );
    assert.match(result.errors[0], /infrastructure\/document-store/);
  });
});

test("rejects a relative import from a module into the app layer", async () => {
  await withFixture(async (srcRoot) => {
    await createModule(srcRoot, "alpha");
    await writeFixtureFile(srcRoot, "app/page.ts", "export const page = 1;");
    await writeFixtureFile(
      srcRoot,
      "modules/alpha/application/page-link.ts",
      [
        'import { page } from "../../../app/page";',
        "",
        "export const linked = page;",
      ].join("\n"),
    );

    const result = await checkModuleBoundaries({ srcRoot });

    assert.equal(result.errors.length, 1);
    assert.match(
      result.errors[0],
      /modules\/alpha\/application\/page-link\.ts: \[app-layer\]/,
    );
    assert.match(result.errors[0], /app\/page/);
  });
});

test("rejects an unapproved public cross-module dependency", async () => {
  await withFixture(async (srcRoot) => {
    await createModule(
      srcRoot,
      "alpha",
      'export type { AlphaContract } from "./application/contracts";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/alpha/application/contracts.ts",
      "export type AlphaContract = { id: string };",
    );
    await createModule(
      srcRoot,
      "beta",
      'export type { BetaContract } from "./application/contracts";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/beta/application/contracts.ts",
      "export type BetaContract = { id: string };",
    );
    await writeFixtureFile(
      srcRoot,
      "modules/alpha/application/use-beta.ts",
      [
        'import type { BetaContract } from "@/modules/beta";',
        "",
        "export type UsesBeta = BetaContract;",
      ].join("\n"),
    );

    const result = await checkModuleBoundaries({ srcRoot });

    assert.equal(result.errors.length, 1);
    assert.match(
      result.errors[0],
      /modules\/alpha\/application\/use-beta\.ts: \[cross-module-allowlist\]/,
    );
    assert.match(result.errors[0], /alpha -> beta/);
    assert.match(result.errors[0], /ingestion -> documents/);
  });
});

test("detects a circular module dependency", async () => {
  await withFixture(async (srcRoot) => {
    await createModule(
      srcRoot,
      "alpha",
      'export type { AlphaContract } from "./application/contracts";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/alpha/application/contracts.ts",
      [
        'import type { BetaContract } from "@/modules/beta";',
        "",
        "export type AlphaContract = BetaContract;",
      ].join("\n"),
    );
    await createModule(
      srcRoot,
      "beta",
      'export type { BetaContract } from "./application/contracts";',
    );
    await writeFixtureFile(
      srcRoot,
      "modules/beta/application/contracts.ts",
      [
        'import type { AlphaContract } from "@/modules/alpha";',
        "",
        "export type BetaContract = AlphaContract;",
      ].join("\n"),
    );

    const result = await checkModuleBoundaries({ srcRoot });

    assert.ok(
      result.errors.some(
        (error) =>
          error.includes("[module-cycle]") &&
          error.includes("alpha -> beta -> alpha"),
      ),
      `Expected a cycle diagnostic, received:\n${result.errors.join("\n")}`,
    );
  });
});
