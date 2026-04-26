#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const failOnUncovered = args.includes("--fail-on-uncovered");
const rootArg = args.find((arg) => !arg.startsWith("--"));
const root = path.resolve(rootArg ?? process.cwd());
const ignored = new Set([
  ".git",
  "node_modules",
  "venv",
  ".venv",
  "vendor",
  "dist",
  "build",
  "coverage",
  ".openDAG",
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

const sourceFilePattern = /\.(ts|tsx|js|jsx|mjs|cjs|py|rs|go|java|cs)$/u;

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

function isSourceFile(file) {
  return sourceFilePattern.test(file);
}

function safeRead(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

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

function extractNamedFunctions(relativeFile, contents) {
  const functions = [];
  const pushMatches = (pattern, kind) => {
    for (const match of contents.matchAll(pattern)) {
      const name = match.groups?.name;
      if (name && !functions.some((fn) => fn.name === name && fn.kind === kind)) {
        functions.push({ file: relativeFile, name, kind });
      }
    }
  };

  if (/\.(ts|tsx|js|jsx|mjs|cjs)$/u.test(relativeFile)) {
    pushMatches(/\b(?:export\s+)?(?:async\s+)?function\s+(?<name>[A-Za-z_$][\w$]*)\s*\(/gu, "function");
    pushMatches(
      /\b(?:export\s+)?const\s+(?<name>[A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/gu,
      "arrow"
    );
    pushMatches(
      /\b(?:export\s+)?const\s+(?<name>[A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b/gu,
      "function-expression"
    );
  }

  if (/\.py$/u.test(relativeFile)) {
    pushMatches(/^\s*(?:async\s+)?def\s+(?<name>[A-Za-z_]\w*)\s*\(/gmu, "python-def");
  }

  if (/\.rs$/u.test(relativeFile)) {
    pushMatches(/\bfn\s+(?<name>[A-Za-z_]\w*)\s*[<(]/gu, "rust-fn");
  }

  if (/\.go$/u.test(relativeFile)) {
    pushMatches(/\bfunc\s+(?:\([^)]*\)\s*)?(?<name>[A-Za-z_]\w*)\s*\(/gu, "go-func");
  }

  if (/\.(java|cs)$/u.test(relativeFile)) {
    pushMatches(
      /\b(?:public|private|protected|internal|static|async|final|virtual|override|\s)+\s+[A-Za-z_<>\[\],.?]+\s+(?<name>[A-Za-z_]\w*)\s*\(/gu,
      "method"
    );
  }

  return functions;
}

function readDagCoverage() {
  const dagPath = path.join(root, "specs", "dag.json");
  const contents = safeRead(dagPath);
  if (!contents) {
    return { nodeIds: [], allowedFiles: [] };
  }

  try {
    const parsed = JSON.parse(contents);
    const nodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
    return {
      nodeIds: nodes.map((node) => String(node.id ?? "")),
      allowedFiles: nodes.flatMap((node) => (Array.isArray(node.allowedFiles) ? node.allowedFiles : []))
    };
  } catch {
    return { nodeIds: [], allowedFiles: [] };
  }
}

function functionAppearsCovered(fn, coverage) {
  const fileCovered = coverage.allowedFiles.includes(fn.file);
  const nameCovered = coverage.nodeIds.some((id) => id === fn.name || id.endsWith(`.${fn.name}`) || id.includes(fn.name));
  return fileCovered && nameCovered;
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
const functionCandidates = [];
for (const file of files) {
  if (path.relative(root, file) === "functional-dag-repo-converter-skill/scripts/repo-scan.mjs") {
    continue;
  }
  if (!isSourceFile(file)) continue;
  const contents = safeRead(file);
  if (!contents) continue;
  const relativeFile = path.relative(root, file);
  const hits = sideEffectPatterns.filter((pattern) => contents.includes(pattern));
  if (hits.length > 0) {
    sideEffectHits.push({
      file: relativeFile,
      patterns: hits
    });
  }
  functionCandidates.push(...extractNamedFunctions(relativeFile, contents));
}

const dagCoverage = readDagCoverage();
const possiblyUncoveredFunctions = functionCandidates.filter((fn) => !functionAppearsCovered(fn, dagCoverage));

const result = {
  root,
  markers: foundMarkers,
  fileCountSampled: relativeFiles.length,
  topLevel: readdirSync(root).filter((entry) => !ignored.has(entry)).sort(),
  candidateFiles: relativeFiles.slice(0, 80),
  sourceFunctionCount: functionCandidates.length,
  functionCandidatePreviewCount: Math.min(functionCandidates.length, 250),
  functionCandidates: functionCandidates.slice(0, 250),
  possiblyUncoveredFunctionCount: possiblyUncoveredFunctions.length,
  possiblyUncoveredPreviewCount: Math.min(possiblyUncoveredFunctions.length, 250),
  possiblyUncoveredFunctions: possiblyUncoveredFunctions.slice(0, 250),
  sideEffectHits: sideEffectHits.slice(0, 80)
};

console.log(JSON.stringify(result, null, 2));

if (failOnUncovered && possiblyUncoveredFunctions.length > 0) {
  process.exitCode = 1;
}
