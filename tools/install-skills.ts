#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillNames = ["opendag"];

function findPackageRoot(startDir: string): string {
  let current = startDir;

  while (current !== path.dirname(current)) {
    const hasPackageJson = existsSync(path.join(current, "package.json"));
    const hasSkills = skillNames.every((skillName) => existsSync(path.join(current, skillName, "SKILL.md")));

    if (hasPackageJson && hasSkills) {
      return current;
    }

    current = path.dirname(current);
  }

  throw new Error("Could not find openDAG package root with bundled skills.");
}

function installSkill(packageRoot: string, targetRoot: string, skillName: string, link: boolean): void {
  const source = path.join(packageRoot, skillName);
  const target = path.join(targetRoot, skillName);

  if (!existsSync(path.join(source, "SKILL.md"))) {
    throw new Error(`Bundled skill is missing SKILL.md: ${source}`);
  }

  rmSync(target, { recursive: true, force: true });

  if (link) {
    symlinkSync(source, target, "dir");
    return;
  }

  cpSync(source, target, { recursive: true });
}

function main(): void {
  const link = process.argv.includes("--link");
  const packageRoot = findPackageRoot(path.dirname(fileURLToPath(import.meta.url)));
  const codexHome = process.env.CODEX_HOME ?? path.join(homedir(), ".codex");
  const targetRoot = path.join(codexHome, "skills");

  mkdirSync(targetRoot, { recursive: true });

  for (const skillName of skillNames) {
    installSkill(packageRoot, targetRoot, skillName, link);
    console.log(`${link ? "Linked" : "Installed"} ${skillName} -> ${path.join(targetRoot, skillName)}`);
  }

  console.log("Restart Codex or start a new Codex session for the skills to appear.");
}

main();
