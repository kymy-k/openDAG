import { DagSchema, type DagNode } from "../../../contracts/contractTypes.js";
import { InputSchema, OutputSchema, type Input, type Output } from "./contract.js";

const allowedReferencePrefixes = ["specs/", "contracts/"];
const allowedGlobalPrefixes = [
  "tools/",
  "templates/",
  "functional-dag-agent-skill/",
  "functional-dag-repo-converter-skill/",
  "README.md",
  "SETUP_GUIDE.md",
  "AGENTS.md",
  "LICENSE",
  ".nvmrc",
  "package.json",
  "package-lock.json",
  "src/index.ts",
  "tsconfig.build.json",
  "tsconfig.json"
];

function normalizeAllowedFile(filePath: string): string | null {
  const normalized = filePath.replaceAll("\\", "/").split("/").filter(Boolean).join("/");

  if (
    filePath.startsWith("/") ||
    /^[A-Za-z]:\//u.test(filePath) ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized === ".."
  ) {
    return null;
  }

  return normalized;
}

function nodeFolders(node: DagNode): Set<string> {
  const folders = new Set<string>();

  for (const file of node.allowedFiles) {
    const normalized = normalizeAllowedFile(file);
    const match = normalized?.match(/^src\/nodes\/([^/]+)\//u);

    if (match) {
      folders.add(match[1]);
    }
  }

  return folders;
}

function validateAllowedFiles(node: DagNode): string[] {
  const errors: string[] = [];
  const folders = nodeFolders(node);
  const mustBeInsideOneNodeFolder = node.kind === "pure";

  if (mustBeInsideOneNodeFolder && folders.size === 0) {
    errors.push(`${node.id}: allowedFiles must include files inside src/nodes/<nodeFolder>/`);
  }

  if (mustBeInsideOneNodeFolder && folders.size > 1) {
    errors.push(`${node.id}: allowedFiles may only include one node folder`);
  }

  for (const file of node.allowedFiles) {
    const normalized = normalizeAllowedFile(file);

    if (!normalized) {
      errors.push(`${node.id}: allowedFile "${file}" must be a relative path inside the repo`);
      continue;
    }

    if (normalized.startsWith("src/nodes/")) {
      const [folder] = folders;
      if (folder && !normalized.startsWith(`src/nodes/${folder}/`)) {
        errors.push(`${node.id}: allowedFile "${file}" is outside this node's folder`);
      }
      continue;
    }

    if (!mustBeInsideOneNodeFolder) {
      if (
        allowedReferencePrefixes.some((prefix) => normalized.startsWith(prefix)) ||
        allowedGlobalPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(prefix))
      ) {
        continue;
      }

      errors.push(`${node.id}: allowedFile "${file}" is not in an approved repo workflow path`);
      continue;
    }

    if (!allowedReferencePrefixes.some((prefix) => normalized.startsWith(prefix))) {
      errors.push(
        `${node.id}: allowedFile "${file}" must be inside the node folder or be a specs/contracts reference`
      );
    }
  }

  return errors;
}

function validateAcyclic(nodes: DagNode[]): string[] {
  const errors: string[] = [];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(node: DagNode, pathStack: string[]): void {
    if (visited.has(node.id)) {
      return;
    }

    if (visiting.has(node.id)) {
      errors.push(`cycle detected: ${[...pathStack, node.id].join(" -> ")}`);
      return;
    }

    visiting.add(node.id);

    for (const dependency of node.dependencies) {
      const dependencyNode = byId.get(dependency);
      if (dependencyNode) {
        visit(dependencyNode, [...pathStack, node.id]);
      }
    }

    visiting.delete(node.id);
    visited.add(node.id);
  }

  for (const node of nodes) {
    visit(node, []);
  }

  return errors;
}

function validateNodeDocumentation(node: DagNode): string[] {
  const errors: string[] = [];
  const fields = [
    ["purpose", node.purpose],
    ["inputSchema", node.inputSchema],
    ["outputSchema", node.outputSchema]
  ] as const;

  for (const [fieldName, value] of fields) {
    if (/\b(todo|tbd)\b|fill this in/iu.test(value)) {
      errors.push(`${node.id}: ${fieldName} must not contain placeholder text`);
    }
  }

  if (node.purpose.trim().length < 24) {
    errors.push(`${node.id}: purpose must clearly describe what the node does`);
  }

  return errors;
}

export function run(input: Input): Output {
  const parsedInput = InputSchema.parse(input);
  const parsedDag = DagSchema.safeParse(parsedInput.dag);

  if (!parsedDag.success) {
    return OutputSchema.parse({
      ok: false,
      errors: parsedDag.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    });
  }

  const dag = parsedDag.data;
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const ids = new Set(dag.nodes.map((node) => node.id));

  for (const node of dag.nodes) {
    if (seenIds.has(node.id)) {
      errors.push(`duplicate node id: ${node.id}`);
    }
    seenIds.add(node.id);

    errors.push(...validateNodeDocumentation(node));

    if (node.kind === "pure") {
      const purityText = node.invariants.join(" ").toLowerCase();
      if (!purityText.includes("pure") || !purityText.includes("deterministic")) {
        errors.push(`${node.id}: pure nodes must state purity and determinism in invariants`);
      }
    }

    for (const dependency of node.dependencies) {
      if (dependency === node.id) {
        errors.push(`${node.id}: node must not depend on itself`);
      }

      if (!ids.has(dependency)) {
        errors.push(`${node.id}: dependency "${dependency}" does not exist`);
      }
    }

    errors.push(...validateAllowedFiles(node));
  }

  errors.push(...validateAcyclic(dag.nodes));

  return OutputSchema.parse({
    ok: errors.length === 0,
    errors,
    dag
  });
}
