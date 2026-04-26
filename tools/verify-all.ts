import { execFileSync } from "node:child_process";
import { validateDag } from "./validate-dag.js";

function runCommand(command: string, args: string[]): void {
  execFileSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit"
  });
}

const validation = validateDag();

if (!validation.ok) {
  console.error("DAG validation failed:");
  for (const error of validation.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

try {
  console.log("DAG validation passed.");
  runCommand("npx", ["tsx", "tools/generate-node-docs.ts", "--check"]);
  runCommand("npx", ["vitest", "run"]);
  runCommand("npx", ["tsc", "--noEmit"]);
  console.log("Full verification passed.");
} catch {
  console.error("Full verification failed.");
  process.exit(1);
}
