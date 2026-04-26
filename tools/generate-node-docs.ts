#!/usr/bin/env node
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run as buildNodeCatalog } from "../src/nodes/buildNodeCatalog/implementation.js";
import { validateDag } from "./validate-dag.js";

function catalogPath(): string {
  return path.join(process.cwd(), "specs", "node_catalog.md");
}

function generatedCatalog(): string {
  const validation = validateDag();

  if (!validation.ok || !validation.dag) {
    throw new Error(`Cannot generate node catalog because DAG validation failed:\n${validation.errors.join("\n")}`);
  }

  return buildNodeCatalog({ dag: validation.dag }).markdown;
}

function isCatalogCurrent(expected: string, outputPath: string): boolean {
  try {
    return readFileSync(outputPath, "utf8") === expected;
  } catch {
    return false;
  }
}

function main(): void {
  const outputPath = catalogPath();
  const markdown = generatedCatalog();

  if (process.argv.includes("--check")) {
    if (!isCatalogCurrent(markdown, outputPath)) {
      console.error("Generated node catalog is stale. Run npm run generate:docs.");
      process.exit(1);
    }

    console.log("Generated node catalog is current.");
    return;
  }

  writeFileSync(outputPath, markdown);
  console.log(`Generated node catalog written to ${outputPath}`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
