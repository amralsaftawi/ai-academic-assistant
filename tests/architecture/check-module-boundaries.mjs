#!/usr/bin/env node
/**
 * Lightweight module-boundary check with no external dependencies.
 *
 * It enforces the conventions documented in
 * docs/architecture/module-boundaries.md:
 * - cross-module imports must target a module's public `index.ts`;
 * - only explicitly approved cross-module dependencies are allowed;
 * - module entry points must not expose private infrastructure;
 * - shared code must not import business modules or the app layer;
 * - modules must not import the Next.js app layer;
 * - domain code must not import frameworks, the database, or module code;
 * - application code must not import its own infrastructure implementations;
 * - the module dependency graph must be acyclic.
 *
 * This is a guardrail, not a full static analysis tool. It intentionally checks
 * only TypeScript/TSX imports under `src/` (the project is TypeScript-only).
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TYPESCRIPT_FILE_PATTERN = /\.(ts|tsx)$/;

/**
 * The only approved cross-module dependencies. Adding an edge here is an
 * architecture decision and must be reflected in
 * docs/architecture/module-boundaries.md.
 */
const APPROVED_CROSS_MODULE_DEPENDENCIES = new Map([
  ["ingestion", new Set(["documents"])],
  ["ai-assistant", new Set(["retrieval-search"])],
]);

const APPROVED_DEPENDENCY_SUMMARY = [...APPROVED_CROSS_MODULE_DEPENDENCIES]
  .flatMap(([fromModule, targets]) =>
    [...targets].map((toModule) => `${fromModule} -> ${toModule}`),
  )
  .join(", ");

const checkerRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      files.push(...(await collectTypeScriptFiles(fullPath)));
      continue;
    }

    if (TYPESCRIPT_FILE_PATTERN.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relativeToSrc(srcRoot, file) {
  return path.relative(srcRoot, file).split(path.sep).join("/");
}

function moduleNameForFile(modulesRoot, file) {
  const relative = path.relative(modulesRoot, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  const parts = relative.split(path.sep).filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  return parts[0];
}

function importSpecifiers(source) {
  const specifiers = new Set();
  const staticPattern =
    /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\sfrom\s+)?["']([^"']+)["']/g;
  const dynamicPattern = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (const pattern of [staticPattern, dynamicPattern]) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1].split(/[?#]/)[0]);
    }
  }

  return [...specifiers];
}

/**
 * Resolve an alias or relative specifier to a normalized path relative to
 * `src/`. Returns `null` for bare package imports.
 */
function resolveImportPath(srcRoot, fromFile, specifier) {
  if (specifier === "@/") {
    return "";
  }

  if (specifier.startsWith("@/")) {
    return normalizeTargetPath(specifier.slice(2));
  }

  if (!specifier.startsWith(".")) {
    return null;
  }

  const resolved = path.resolve(path.dirname(fromFile), specifier);
  return normalizeTargetPath(path.relative(srcRoot, resolved));
}

function normalizeTargetPath(value) {
  const posixPath = value.split(path.sep).join("/");
  const normalized = path.posix.normalize(posixPath);
  const trimmed =
    normalized === "." ? "" : normalized.replace(/\/+$/, "");
  return trimmed.replace(/\.(ts|tsx)$/, "");
}

function moduleInfoForPath(normalizedPath) {
  if (
    normalizedPath === null ||
    !normalizedPath.startsWith("modules/") ||
    normalizedPath === "modules/"
  ) {
    return null;
  }

  const parts = normalizedPath.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  const moduleName = parts[1];
  const isPublic =
    parts.length === 2 || (parts.length === 3 && parts[2] === "index");

  return { moduleName, isPublic };
}

function pathIsWithin(normalizedPath, prefix) {
  return (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  );
}

function hasLayerSegment(normalizedPath, segment) {
  return normalizedPath.split("/").includes(segment);
}

function isFrameworkSpecifier(specifier) {
  return (
    specifier === "next" ||
    specifier.startsWith("next/") ||
    specifier === "react" ||
    specifier === "react-dom" ||
    specifier.startsWith("react-dom/")
  );
}

function isApprovedCrossModuleDependency(fromModule, toModule) {
  return APPROVED_CROSS_MODULE_DEPENDENCIES.get(fromModule)?.has(toModule) ?? false;
}

/**
 * Run the architecture check against a `src/` directory.
 *
 * @param {{ srcRoot?: string }} [options]
 * @returns {Promise<{ errors: string[], moduleNames: string[], fileCount: number }>}
 */
export async function checkModuleBoundaries(options = {}) {
  const srcRoot = options.srcRoot ?? path.join(checkerRoot, "src");
  const modulesRoot = path.join(srcRoot, "modules");
  const errors = [];
  const moduleDependencies = new Map();

  function addError(relativeFile, rule, message) {
    errors.push(`${relativeFile}: [${rule}] ${message}`);
  }

  function recordDependency(fromModule, toModule) {
    if (!moduleDependencies.has(fromModule)) {
      moduleDependencies.set(fromModule, new Set());
    }
    moduleDependencies.get(fromModule).add(toModule);
  }

  const files = await collectTypeScriptFiles(srcRoot);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relativeFile = relativeToSrc(srcRoot, file);
    const fromModule = moduleNameForFile(modulesRoot, file);
    const isDomain = relativeFile.includes("/domain/");
    const isApplication = relativeFile.includes("/application/");
    const isShared = relativeFile.startsWith("shared/");
    const isModuleIndex =
      fromModule !== null &&
      relativeFile.replace(TYPESCRIPT_FILE_PATTERN, "") ===
        `modules/${fromModule}/index`;

    for (const specifier of importSpecifiers(source)) {
      const targetPath = resolveImportPath(srcRoot, file, specifier);
      const target =
        targetPath === null ? null : moduleInfoForPath(targetPath);
      const isAppImport =
        targetPath === "app" || Boolean(targetPath?.startsWith("app/"));

      if ((fromModule !== null || isShared) && isAppImport) {
        addError(
          relativeFile,
          "app-layer",
          `${
            fromModule !== null ? "module" : "shared"
          } code must not import the Next.js app layer (${specifier} -> src/${targetPath}).`,
        );
      }

      if (isShared && target?.moduleName) {
        addError(
          relativeFile,
          "shared-module",
          `shared code must not import module "${target.moduleName}" (${specifier}).`,
        );
        continue;
      }

      if (target?.moduleName) {
        if (!target.isPublic && fromModule !== target.moduleName) {
          addError(
            relativeFile,
            "cross-module-deep-import",
            `cross-module deep import "${specifier}" is forbidden; import "@/modules/${target.moduleName}" instead.`,
          );
        }

        if (fromModule !== null && fromModule !== target.moduleName) {
          recordDependency(fromModule, target.moduleName);

          if (
            !isApprovedCrossModuleDependency(fromModule, target.moduleName)
          ) {
            addError(
              relativeFile,
              "cross-module-allowlist",
              `cross-module dependency ${fromModule} -> ${target.moduleName} via "${specifier}" is not approved. Approved edges: ${APPROVED_DEPENDENCY_SUMMARY}.`,
            );
          }
        }
      }

      if (isModuleIndex && target?.moduleName === fromModule) {
        const infrastructureRoot = `modules/${fromModule}/infrastructure`;
        if (pathIsWithin(targetPath, infrastructureRoot)) {
          addError(
            relativeFile,
            "public-infrastructure",
            `public entry point must not import or re-export private infrastructure (${specifier} -> src/${targetPath}).`,
          );
        }
      }

      if (isDomain) {
        if (isFrameworkSpecifier(specifier)) {
          addError(
            relativeFile,
            "domain-framework",
            `domain code must not import framework module "${specifier}".`,
          );
        }

        if (pathIsWithin(targetPath ?? "", "shared/database")) {
          addError(
            relativeFile,
            "domain-database",
            `domain code must not import the database layer (${specifier}).`,
          );
        }

        if (target?.moduleName && target.moduleName !== fromModule) {
          addError(
            relativeFile,
            "domain-module",
            `domain code must not import module "${target.moduleName}" (${specifier}).`,
          );
        }

        if (
          targetPath !== null &&
          (hasLayerSegment(targetPath, "application") ||
            hasLayerSegment(targetPath, "infrastructure"))
        ) {
          addError(
            relativeFile,
            "domain-layer",
            `domain code must not import application or infrastructure code (${specifier}).`,
          );
        }
      }

      if (isApplication && fromModule !== null && targetPath !== null) {
        const ownInfrastructureRoot = `modules/${fromModule}/infrastructure`;
        if (pathIsWithin(targetPath, ownInfrastructureRoot)) {
          addError(
            relativeFile,
            "application-infrastructure",
            `application code must depend on a contract, not the concrete infrastructure (${specifier}).`,
          );
        }
      }
    }
  }

  const moduleEntries = await readdir(modulesRoot, { withFileTypes: true });
  const moduleNames = moduleEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const moduleName of moduleNames) {
    const modulePath = path.join(modulesRoot, moduleName);
    const moduleFiles = await readdir(modulePath);

    if (!moduleFiles.includes("index.ts")) {
      errors.push(
        `modules/${moduleName}: [missing-index] missing public entry point index.ts.`,
      );
    }

    if (!moduleFiles.includes("README.md")) {
      errors.push(
        `modules/${moduleName}: [missing-readme] missing README.md.`,
      );
    }

    if (!moduleDependencies.has(moduleName)) {
      moduleDependencies.set(moduleName, new Set());
    }
  }

  const colors = new Map();
  const stack = [];

  function visitModule(moduleName) {
    colors.set(moduleName, "visiting");
    stack.push(moduleName);

    for (const dependency of moduleDependencies.get(moduleName) ?? []) {
      if (colors.get(dependency) === "visiting") {
        const cycleStart = stack.indexOf(dependency);
        const cycle = [...stack.slice(cycleStart), dependency].join(" -> ");
        errors.push(
          `modules/${moduleName}: [module-cycle] circular module dependency detected: ${cycle}.`,
        );
        continue;
      }

      if (!colors.has(dependency)) {
        visitModule(dependency);
      }
    }

    stack.pop();
    colors.set(moduleName, "visited");
  }

  for (const moduleName of moduleNames) {
    if (!colors.has(moduleName)) {
      visitModule(moduleName);
    }
  }

  return { errors, moduleNames, fileCount: files.length };
}

async function main() {
  const result = await checkModuleBoundaries();

  if (result.errors.length > 0) {
    console.error("Module boundary check failed:\n");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    console.error(`\n${result.errors.length} problem(s) found.`);
    globalThis.process.exitCode = 1;
    return;
  }

  console.log(
    `Module boundary check passed: ${result.moduleNames.length} modules, ${result.fileCount} TypeScript files, no cycles.`,
  );
}

const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedFile === fileURLToPath(import.meta.url)) {
  await main();
}
