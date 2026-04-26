#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { run as planNodeScaffold } from "../src/nodes/planNodeScaffold/implementation.js";

function usage(): never {
  console.error("Usage: npm run create:node -- <nodeName>");
  process.exit(1);
}

function readTemplate(templateName: string): string {
  return readFileSync(path.join(process.cwd(), "templates", templateName), "utf8");
}

const nodeName = process.argv[2];

if (!nodeName) {
  usage();
}

const plan = planNodeScaffold({
  nodeName,
  templates: {
    contract: readTemplate("node.contract.template.ts"),
    implementation: readTemplate("node.implementation.template.ts"),
    test: readTemplate("node.test.template.ts")
  }
});

if (!plan.ok || !plan.nodeDir || !plan.files) {
  console.error("Could not create node scaffold:");
  for (const error of plan.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

mkdirSync(path.join(process.cwd(), plan.nodeDir), { recursive: false });

for (const file of plan.files) {
  writeFileSync(path.join(process.cwd(), file.path), file.contents, "utf8");
}

console.log(`Created node scaffold at ${plan.nodeDir}`);
console.log("Add the node to specs/dag.json before implementation or verification.");
