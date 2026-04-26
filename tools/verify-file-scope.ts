#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { run as validateFileEditScope } from "../src/nodes/validateFileEditScope/implementation.js";

function usage(): never {
  console.error("Usage: npm run verify:file-scope -- <editableFile>");
  process.exit(1);
}

function parseGitStatusPaths(statusOutput: string): string[] {
  const paths: string[] = [];

  for (const line of statusOutput.split("\n")) {
    if (!line.trim()) {
      continue;
    }

    const rawPath = line.slice(3);
    if (rawPath.includes(" -> ")) {
      paths.push(...rawPath.split(" -> "));
    } else {
      paths.push(rawPath);
    }
  }

  return [...new Set(paths)];
}

function readChangedFiles(): string[] {
  const statusOutput = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  return parseGitStatusPaths(statusOutput);
}

export function verifyFileScope(editableFile: string): ReturnType<typeof validateFileEditScope> {
  return validateFileEditScope({
    editableFile,
    changedFiles: readChangedFiles()
  });
}

function main(): void {
  const editableFile = process.argv[2];

  if (!editableFile) {
    usage();
  }

  const result = verifyFileScope(editableFile);

  if (!result.ok) {
    console.error("File edit scope validation failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`File edit scope validation passed for ${result.editableFile}.`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
