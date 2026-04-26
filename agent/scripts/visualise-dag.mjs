#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);

function usage() {
  return `Usage: visualise-dag.mjs [path-to-dag.json] [--output <html-file>] [--open]

Generates a standalone HTML DAG visualisation from an openDAG specs/dag.json file.

Defaults:
  DAG input: ./specs/dag.json
  Output: ./.openDAG/dag-visualisation.html`;
}

function parseArgs() {
  const options = {
    dagPath: "specs/dag.json",
    outputPath: ".openDAG/dag-visualisation.html",
    open: false
  };

  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }

    if (arg === "--open") {
      options.open = true;
      continue;
    }

    if (arg === "--output") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("--output requires a file path");
      }
      options.outputPath = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--output=")) {
      options.outputPath = arg.slice("--output=".length);
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
    }

    positional.push(arg);
  }

  if (positional.length > 1) {
    throw new Error(`Expected at most one DAG path.\n\n${usage()}`);
  }

  if (positional[0]) {
    options.dagPath = positional[0];
  }

  return options;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadDag(dagPath) {
  if (!existsSync(dagPath)) {
    throw new Error(`DAG file not found: ${dagPath}`);
  }

  const parsed = JSON.parse(readFileSync(dagPath, "utf8"));
  if (!Array.isArray(parsed.nodes)) {
    throw new Error("DAG file must contain a nodes array");
  }

  return parsed;
}

function nodeDepth(node, byId, memo, visiting = new Set()) {
  if (memo.has(node.id)) {
    return memo.get(node.id);
  }

  if (visiting.has(node.id)) {
    return 0;
  }

  visiting.add(node.id);
  const dependencies = Array.isArray(node.dependencies) ? node.dependencies : [];
  const dependencyDepths = dependencies
    .map((dependency) => byId.get(dependency))
    .filter(Boolean)
    .map((dependencyNode) => nodeDepth(dependencyNode, byId, memo, visiting));
  visiting.delete(node.id);

  const depth = dependencyDepths.length === 0 ? 0 : Math.max(...dependencyDepths) + 1;
  memo.set(node.id, depth);
  return depth;
}

function layout(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const memo = new Map();
  const rows = new Map();

  for (const node of nodes) {
    const depth = nodeDepth(node, byId, memo);
    if (!rows.has(depth)) {
      rows.set(depth, []);
    }
    rows.get(depth).push(node);
  }

  const positioned = new Map();
  const rowHeight = 170;
  const columnWidth = 310;
  const cardWidth = 250;
  const cardHeight = 92;

  for (const [depth, rowNodes] of [...rows.entries()].sort(([a], [b]) => a - b)) {
    rowNodes.sort((a, b) => a.id.localeCompare(b.id));
    rowNodes.forEach((node, index) => {
      positioned.set(node.id, {
        node,
        x: 40 + index * columnWidth,
        y: 40 + depth * rowHeight,
        width: cardWidth,
        height: cardHeight
      });
    });
  }

  const width = Math.max(900, ...[...positioned.values()].map((item) => item.x + item.width + 40));
  const height = Math.max(520, ...[...positioned.values()].map((item) => item.y + item.height + 40));

  return { positioned, width, height };
}

function renderHtml(dag) {
  const nodes = dag.nodes;
  const { positioned, width, height } = layout(nodes);
  const nodeKinds = new Set(nodes.map((node) => node.kind || "unknown"));

  const edges = [];
  for (const item of positioned.values()) {
    const dependencies = Array.isArray(item.node.dependencies) ? item.node.dependencies : [];
    for (const dependency of dependencies) {
      const from = positioned.get(dependency);
      if (from) {
        edges.push({ from, to: item });
      }
    }
  }

  const edgeSvg = edges
    .map(({ from, to }) => {
      const x1 = from.x + from.width / 2;
      const y1 = from.y + from.height;
      const x2 = to.x + to.width / 2;
      const y2 = to.y;
      const midY = (y1 + y2) / 2;
      return `<path class="edge" d="M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}" />`;
    })
    .join("\n");

  const nodeSvg = [...positioned.values()]
    .map(({ node, x, y, width: cardWidth, height: cardHeight }) => {
      const kind = escapeHtml(node.kind || "unknown");
      const id = escapeHtml(node.id);
      const purpose = escapeHtml(node.purpose || "");
      return `<g class="node kind-${kind}" transform="translate(${x}, ${y})">
  <rect width="${cardWidth}" height="${cardHeight}" rx="8" />
  <text class="node-id" x="14" y="28">${id}</text>
  <text class="node-kind" x="14" y="50">${kind}</text>
  <title>${purpose}</title>
</g>`;
    })
    .join("\n");

  const legend = [...nodeKinds]
    .sort()
    .map((kind) => `<span class="legend-item kind-${escapeHtml(kind)}">${escapeHtml(kind)}</span>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>openDAG Visualisation</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f7f4;
      --ink: #1f2933;
      --muted: #667085;
      --line: #98a2b3;
      --card: #ffffff;
      --pure: #2563eb;
      --imperative: #c2410c;
      --helper: #047857;
      --orphan: #6b7280;
      --template: #7c3aed;
      --skill: #0369a1;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
    }
    header {
      padding: 22px 28px 12px;
      border-bottom: 1px solid #e4e7ec;
      background: #fff;
      position: sticky;
      top: 0;
      z-index: 2;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 20px;
      font-weight: 650;
    }
    .meta {
      color: var(--muted);
      font-size: 13px;
    }
    .legend {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .legend-item {
      border: 1px solid #d0d5dd;
      border-radius: 999px;
      padding: 4px 9px;
      font-size: 12px;
      background: #fff;
    }
    main {
      overflow: auto;
      padding: 20px;
    }
    svg {
      display: block;
      min-width: 100%;
      background: #fbfbf9;
      border: 1px solid #e4e7ec;
    }
    .edge {
      fill: none;
      stroke: var(--line);
      stroke-width: 1.6;
    }
    .node rect {
      fill: var(--card);
      stroke: #d0d5dd;
      stroke-width: 1.2;
    }
    .node-id {
      fill: var(--ink);
      font-size: 13px;
      font-weight: 650;
    }
    .node-kind {
      fill: var(--muted);
      font-size: 12px;
    }
    .kind-pure rect { stroke: var(--pure); }
    .kind-imperative rect { stroke: var(--imperative); }
    .kind-helper rect { stroke: var(--helper); }
    .kind-orphan rect { stroke: var(--orphan); }
    .kind-template rect { stroke: var(--template); }
    .kind-skill rect { stroke: var(--skill); }
  </style>
</head>
<body>
  <header>
    <h1>openDAG Visualisation</h1>
    <div class="meta">${nodes.length} node(s), ${edges.length} edge(s)</div>
    <div class="legend">${legend}</div>
  </header>
  <main>
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="DAG visualisation">
      ${edgeSvg}
      ${nodeSvg}
    </svg>
  </main>
</body>
</html>
`;
}

function openFile(filePath) {
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const argsForPlatform = process.platform === "win32" ? ["/c", "start", "", filePath] : [filePath];
  execFileSync(opener, argsForPlatform, { stdio: "ignore" });
}

const options = parseArgs();
const dagPath = resolve(options.dagPath);
const outputPath = resolve(options.outputPath);
const dag = loadDag(dagPath);
const html = renderHtml(dag);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
console.log(`Wrote DAG visualisation -> ${outputPath}`);

if (options.open) {
  openFile(outputPath);
}
