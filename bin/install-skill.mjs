#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillName = "opendag";
const skillEntries = [
  "AGENTS.md",
  "LICENSE",
  "README.md",
  "SETUP_GUIDE.md",
  "SKILL.md",
  "agent",
  "repo-converter"
];

function packageRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function usage() {
  return `Usage: opendag [--target <skills-dir>] [--codex]

Installs the openDAG skill into a skills directory.

Options:
  --target <dir>  Install into <dir>/opendag
  --codex         Install into $CODEX_HOME/skills/opendag or ~/.codex/skills/opendag
  --help          Show this help

Defaults:
  Uses $SKILLS_HOME/opendag when SKILLS_HOME is set.
  Otherwise installs into ~/.skills/opendag.`;
}

function parseArgs(args) {
  const options = {
    codex: false,
    target: null
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }

    if (arg === "--codex") {
      options.codex = true;
      continue;
    }

    if (arg === "--target") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("--target requires a directory path");
      }
      options.target = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length);
      continue;
    }

    throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
  }

  return options;
}

function skillsRoot(options) {
  if (options.target) {
    return path.resolve(options.target);
  }

  if (options.codex) {
    const codexHome = process.env.CODEX_HOME || path.join(homedir(), ".codex");
    return path.join(codexHome, "skills");
  }

  if (process.env.SKILLS_HOME) {
    return path.resolve(process.env.SKILLS_HOME);
  }

  return path.join(homedir(), ".skills");
}

function installSkill() {
  const options = parseArgs(process.argv.slice(2));
  const sourceRoot = packageRoot();
  const targetRoot = path.join(skillsRoot(options), skillName);

  if (!existsSync(path.join(sourceRoot, "SKILL.md"))) {
    throw new Error(`Missing SKILL.md in package root: ${sourceRoot}`);
  }

  rmSync(targetRoot, { recursive: true, force: true });
  mkdirSync(targetRoot, { recursive: true });

  for (const entry of skillEntries) {
    cpSync(path.join(sourceRoot, entry), path.join(targetRoot, entry), { recursive: true });
  }

  console.log(`Installed ${skillName} -> ${targetRoot}`);
  console.log("Restart or refresh your agent environment for the skill to appear.");
}

installSkill();
