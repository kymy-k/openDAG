import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { run as buildDagVisualisationModel } from "../src/nodes/buildDagVisualisationModel/implementation.js";
import { run as renderDagVisualisationHtml } from "../src/nodes/renderDagVisualisationHtml/implementation.js";
import { validateDag } from "./validate-dag.js";

function openFile(filePath: string): void {
  const platform = process.platform;

  try {
    if (platform === "darwin") {
      execFileSync("open", [filePath], { stdio: "ignore" });
      return;
    }

    if (platform === "win32") {
      execFileSync("cmd", ["/c", "start", "", filePath], { stdio: "ignore" });
      return;
    }

    execFileSync("xdg-open", [filePath], { stdio: "ignore" });
  } catch {
    console.log("Could not open the visualisation automatically.");
  }
}

const shouldOpen = !process.argv.includes("--no-open");
const outputArgIndex = process.argv.indexOf("--output");
const outputPath =
  outputArgIndex >= 0 && process.argv[outputArgIndex + 1]
    ? path.resolve(process.argv[outputArgIndex + 1])
    : path.join(process.cwd(), ".functional-codex", "dag-visualisation.html");

const validation = validateDag();

if (!validation.ok || !validation.dag) {
  console.error("Cannot visualise because DAG validation failed:");
  for (const error of validation.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const model = buildDagVisualisationModel({ dag: validation.dag });
const { html } = renderDagVisualisationHtml({
  title: "functional-codex DAG",
  model
});

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html, "utf8");

console.log(`DAG visualisation written to ${outputPath}`);
console.log("Use --no-open to skip opening the generated HTML file.");

if (shouldOpen) {
  openFile(outputPath);
}

