#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [nodeId, outputDirArg] = process.argv.slice(2);

if (!nodeId || !outputDirArg) {
  console.error("Usage: scaffold-ts-zod-node.mjs <node-id> <output-dir>");
  process.exit(1);
}

const skillDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const templatesDir = path.join(skillDir, "templates");
const outputDir = path.resolve(outputDirArg);

mkdirSync(outputDir, { recursive: true });

const files = [
  ["typescript-zod-node.contract.template.ts", "contract.ts"],
  ["typescript-zod-node.implementation.template.ts", "implementation.ts"],
  ["typescript-zod-node.test.template.ts", "tests.test.ts"]
];

for (const [templateName, outputName] of files) {
  const template = readFileSync(path.join(templatesDir, templateName), "utf8");
  writeFileSync(path.join(outputDir, outputName), template.replaceAll("__NODE_ID__", nodeId));
}

console.log(`Created TypeScript/Zod node scaffold at ${outputDir}`);

