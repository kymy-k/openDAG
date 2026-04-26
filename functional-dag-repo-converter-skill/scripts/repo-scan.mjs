#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? process.cwd());
const ignored = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".functional-codex",
  ".codex",
  ".next",
  ".nuxt",
  "target",
  "__pycache__"
]);

const markers = [
  "package.json",
  "tsconfig.json",
  "pyproject.toml",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "README.md",
  "AGENTS.md"
];

const sideEffectPatterns = [
  "fetch(",
  "axios.",
  "readFile",
  "writeFile",
  "fs.",
  "process.env",
  "Date.now",
  "new Date",
  "Math.random",
  "randomUUID",
  "prisma.",
  "db.",
  "pool.query",
  "request(",
  "app.get(",
  "app.post("
];

function walk(dir, limit = 600) {
  const results = [];
  const stack = [dir];

  while (stack.length > 0 && results.length < limit) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else {
        results.push(fullPath);
      }
    }
  }

  return results;
}

const files = walk(root);
const relativeFiles = files.map((file) => path.relative(root, file));
const foundMarkers = markers.filter((marker) => {
  try {
    return statSync(path.join(root, marker)).isFile();
  } catch {
    return false;
  }
});

const sideEffectHits = [];
for (const file of files) {
  if (path.relative(root, file) === "functional-dag-repo-converter-skill/scripts/repo-scan.mjs") {
    continue;
  }
  if (!/\.(ts|tsx|js|jsx|mjs|cjs|py|rs|go|java|cs)$/u.test(file)) continue;
  let contents = "";
  try {
    contents = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const hits = sideEffectPatterns.filter((pattern) => contents.includes(pattern));
  if (hits.length > 0) {
    sideEffectHits.push({
      file: path.relative(root, file),
      patterns: hits
    });
  }
}

console.log(
  JSON.stringify(
    {
      root,
      markers: foundMarkers,
      fileCountSampled: relativeFiles.length,
      topLevel: readdirSync(root).filter((entry) => !ignored.has(entry)).sort(),
      candidateFiles: relativeFiles.slice(0, 80),
      sideEffectHits: sideEffectHits.slice(0, 40)
    },
    null,
    2
  )
);
