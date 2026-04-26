#!/usr/bin/env node
import { readFileSync } from "node:fs";

const file = process.argv[2];

if (!file) {
  console.error("Usage: check-dag-json.mjs <path-to-dag.json>");
  process.exit(1);
}

const dag = JSON.parse(readFileSync(file, "utf8"));
const nodes = Array.isArray(dag.nodes) ? dag.nodes : [];
const errors = [];
const ids = new Set();

for (const node of nodes) {
  if (!node.id) {
    errors.push("node missing id");
    continue;
  }
  if (ids.has(node.id)) {
    errors.push(`duplicate id: ${node.id}`);
  }
  ids.add(node.id);
}

for (const node of nodes) {
  for (const dependency of node.dependencies ?? []) {
    if (dependency === node.id) {
      errors.push(`${node.id}: depends on itself`);
    }
    if (!ids.has(dependency)) {
      errors.push(`${node.id}: unknown dependency ${dependency}`);
    }
  }
}

const visiting = new Set();
const visited = new Set();
const byId = new Map(nodes.map((node) => [node.id, node]));

function visit(node, stack) {
  if (visited.has(node.id)) return;
  if (visiting.has(node.id)) {
    errors.push(`cycle: ${[...stack, node.id].join(" -> ")}`);
    return;
  }
  visiting.add(node.id);
  for (const dependency of node.dependencies ?? []) {
    const dependencyNode = byId.get(dependency);
    if (dependencyNode) visit(dependencyNode, [...stack, node.id]);
  }
  visiting.delete(node.id);
  visited.add(node.id);
}

for (const node of nodes) {
  visit(node, []);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`DAG OK: ${nodes.length} node(s)`);

