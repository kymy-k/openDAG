import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { validateDag } from "./validate-dag.js";
import { run as planNodeVerification } from "../src/nodes/planNodeVerification/implementation.js";

function usage(): never {
  console.error("Usage: npm run verify:node -- <nodeName>");
  process.exit(1);
}

function runCommand(command: string, args: string[]): void {
  execFileSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit"
  });
}

const nodeName = process.argv[2];

if (!nodeName) {
  usage();
}

const validation = validateDag();

if (!validation.ok || !validation.dag) {
  console.error("Cannot verify node because DAG validation failed:");
  for (const error of validation.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const existingFiles = validation.dag.nodes.flatMap((node) =>
  node.allowedFiles.filter((file) => existsSync(file))
);
const verificationPlan = planNodeVerification({
  dag: validation.dag,
  nodeName,
  existingFiles
});

if (!verificationPlan.ok || !verificationPlan.commands) {
  console.error(`Cannot verify node "${nodeName}":`);
  for (const error of verificationPlan.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

try {
  console.log(`Verifying node "${nodeName}"...`);
  for (const command of verificationPlan.commands) {
    runCommand(command.command, command.args);
  }
  console.log(`Node "${nodeName}" verification passed.`);
} catch {
  console.error(`Node "${nodeName}" verification failed.`);
  process.exit(1);
}
