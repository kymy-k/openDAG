import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run as validateDagNode } from "../src/nodes/validateDag/implementation.js";
import type { Output as ValidationResult } from "../src/nodes/validateDag/contract.js";

function readDag(dagPath = path.join(process.cwd(), "specs", "dag.json")): unknown {
  return JSON.parse(readFileSync(dagPath, "utf8"));
}

export function validateDag(dagPath?: string): ValidationResult {
  return validateDagNode({ dag: readDag(dagPath) });
}

function main(): void {
  const result = validateDag();

  if (!result.ok) {
    console.error("DAG validation failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("DAG validation passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
