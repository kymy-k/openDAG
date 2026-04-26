import type { DagNode, NodeKind, NodeStatus } from "../../../contracts/contractTypes.js";
import { InputSchema, OutputSchema, type Input, type Output, type VisualRoute } from "./contract.js";

const statusOrder: NodeStatus[] = [
  "planned",
  "contracted",
  "tested",
  "implemented",
  "verified"
];
const kindOrder: NodeKind[] = ["pure", "imperative", "helper", "orphan", "template", "skill"];
const cardWidth = 300;
const cardHeight = 108;
const marginX = 72;
const marginY = 84;
const columnGap = 390;
const rowGap = 150;

function depthForNode(
  node: DagNode,
  byId: Map<string, DagNode>,
  dependents: Map<string, string[]>,
  memo: Map<string, number>
): number {
  const existing = memo.get(node.id);
  if (existing !== undefined) {
    return existing;
  }

  const nodeDependents = dependents.get(node.id) ?? [];
  const depth =
    nodeDependents.length === 0
      ? 0
      : 1 +
        Math.max(
          ...nodeDependents.map((dependent) =>
            depthForNode(byId.get(dependent)!, byId, dependents, memo)
          )
        );

  memo.set(node.id, depth);
  return depth;
}

function routeForNode(node: DagNode): VisualRoute {
  if (node.id.startsWith("command.")) {
    return "shell";
  }

  if (node.kind === "pure") {
    return "main";
  }

  if (node.kind === "imperative") {
    return "shell";
  }

  if (node.kind === "template") {
    return "generated";
  }

  if (node.kind === "skill") {
    return "skill";
  }

  return "support";
}

function importanceForNode(node: DagNode, dependentCount: number): number {
  if (node.id.startsWith("command.")) {
    return 5;
  }

  if (node.kind === "pure") {
    return dependentCount > 0 ? 5 : 4;
  }

  if (node.kind === "imperative" || node.kind === "skill") {
    return 3;
  }

  if (node.kind === "orphan") {
    return 1;
  }

  return 2;
}

function sizeForImportance(importance: number): { width: number; height: number } {
  if (importance >= 5) {
    return { width: 320, height: 114 };
  }

  if (importance === 4) {
    return { width: 292, height: 104 };
  }

  if (importance === 3) {
    return { width: 260, height: 92 };
  }

  return { width: 226, height: 78 };
}

function routeForEdge(from: DagNode, to: DagNode): VisualRoute {
  const fromRoute = routeForNode(from);
  const toRoute = routeForNode(to);

  if (fromRoute === "main" && toRoute === "main") {
    return "main";
  }

  if (fromRoute === "shell" || toRoute === "shell") {
    return "shell";
  }

  if (fromRoute === "skill" || toRoute === "skill") {
    return "skill";
  }

  if (fromRoute === "generated" || toRoute === "generated") {
    return "generated";
  }

  return "support";
}

function overviewVisibleForNode(node: { id: string; importance: number }): boolean {
  return node.importance >= 4 || node.id.startsWith("command.");
}

function overviewRankForNode(nodeId: string): number {
  const ranks: Record<string, number> = {
    "command.visualise": 0,
    renderDagVisualisationHtml: 0,
    buildDagVisualisationModel: 0,
    validateDag: 0,
    "command.createNode": 10,
    planNodeScaffold: 10,
    "command.verifyNode": 20,
    planNodeVerification: 20,
    "command.validateDag": 30,
    "command.verifyAll": 40,
    normalizeText: 50
  };

  return ranks[nodeId] ?? 100;
}

function overviewDepthForNode(
  nodeId: string,
  visibleDependents: Map<string, string[]>,
  memo: Map<string, number>
): number {
  const existing = memo.get(nodeId);
  if (existing !== undefined) {
    return existing;
  }

  if (nodeId.startsWith("command.")) {
    memo.set(nodeId, 0);
    return 0;
  }

  const dependentsForNode = visibleDependents.get(nodeId) ?? [];
  const depth =
    dependentsForNode.length === 0
      ? 1
      : 1 +
        Math.max(
          ...dependentsForNode.map((dependent) =>
            overviewDepthForNode(dependent, visibleDependents, memo)
          )
        );

  memo.set(nodeId, depth);
  return depth;
}

export function run(input: Input): Output {
  const parsedInput = InputSchema.parse(input);
  const nodes = [...parsedInput.dag.nodes].sort((left, right) => left.id.localeCompare(right.id));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const depthMemo = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  const edges = nodes.flatMap((node) =>
    node.dependencies.map((dependency) => {
      const dependencyNode = byId.get(dependency)!;
      dependents.set(dependency, [...(dependents.get(dependency) ?? []), node.id]);
      return {
        from: node.id,
        to: dependency,
        route: routeForEdge(node, dependencyNode)
      };
    })
  );

  const visualNodes = nodes.map((node) => {
    const depth = depthForNode(node, byId, dependents, depthMemo);
    const dependentCount = dependents.get(node.id)?.length ?? 0;
    const importance = importanceForNode(node, dependentCount);
    const size = sizeForImportance(importance);
    return {
      id: node.id,
      kind: node.kind,
      route: routeForNode(node),
      importance,
      purpose: node.purpose,
      inputSchema: node.inputSchema,
      outputSchema: node.outputSchema,
      dependencies: [...node.dependencies].sort(),
      dependents: [...(dependents.get(node.id) ?? [])].sort(),
      invariants: node.invariants,
      allowedFiles: node.allowedFiles,
      status: node.status,
      depth,
      x: 120,
      y: marginY + cardHeight / 2 + depth * rowGap,
      width: size.width,
      height: size.height
    };
  });

  const rowsByDepth = new Map<number, number>();
  const positionedNodes = visualNodes.map((node) => {
    const row = rowsByDepth.get(node.depth) ?? 0;
    rowsByDepth.set(node.depth, row + 1);
    return {
      ...node,
      x: marginX + cardWidth / 2 + row * columnGap
    };
  });

  const overviewVisibleIds = new Set(
    positionedNodes.filter(overviewVisibleForNode).map((node) => node.id)
  );
  const visibleDependents = new Map<string, string[]>();
  for (const node of positionedNodes) {
    if (!overviewVisibleIds.has(node.id)) {
      continue;
    }

    for (const dependency of node.dependencies) {
      if (!overviewVisibleIds.has(dependency)) {
        continue;
      }

      visibleDependents.set(dependency, [...(visibleDependents.get(dependency) ?? []), node.id]);
    }
  }

  const overviewDepthMemo = new Map<string, number>();
  const overviewRowsByDepth = new Map<number, number>();
  for (const node of positionedNodes) {
    if (!overviewVisibleForNode(node)) {
      continue;
    }
    const overviewDepth = overviewDepthForNode(node.id, visibleDependents, overviewDepthMemo);
    overviewDepthMemo.set(node.id, overviewDepth);
  }

  const overviewPositions = new Map<string, { overviewX: number; overviewY: number }>();
  const orderedOverviewNodes = positionedNodes
    .filter(overviewVisibleForNode)
    .sort((left, right) => {
      const depthDifference =
        (overviewDepthMemo.get(left.id) ?? 0) - (overviewDepthMemo.get(right.id) ?? 0);
      if (depthDifference !== 0) {
        return depthDifference;
      }

      const rankDifference = overviewRankForNode(left.id) - overviewRankForNode(right.id);
      if (rankDifference !== 0) {
        return rankDifference;
      }

      return left.id.localeCompare(right.id);
    });

  for (const node of orderedOverviewNodes) {
    const overviewDepth = overviewDepthMemo.get(node.id) ?? 0;
    const row = overviewRowsByDepth.get(overviewDepth) ?? 0;
    overviewRowsByDepth.set(overviewDepth, row + 1);

    overviewPositions.set(node.id, {
      overviewX: marginX + cardWidth / 2 + row * columnGap,
      overviewY: marginY + cardHeight / 2 + overviewDepth * rowGap
    });
  }

  const overviewPositionedNodes = positionedNodes.map((node) => {
    const position = overviewPositions.get(node.id);
    return {
      ...node,
      overviewX: position?.overviewX ?? node.x,
      overviewY: position?.overviewY ?? node.y
    };
  });

  const maxDepth = Math.max(0, ...overviewPositionedNodes.map((node) => node.depth));
  const maxRows = Math.max(1, ...rowsByDepth.values());
  const overviewMaxRows = Math.max(1, ...overviewRowsByDepth.values());
  const overviewMaxDepth = Math.max(0, ...overviewDepthMemo.values());

  const statusCounts = Object.fromEntries(statusOrder.map((status) => [status, 0])) as Record<
    NodeStatus,
    number
  >;
  const kindCounts = Object.fromEntries(kindOrder.map((kind) => [kind, 0])) as Record<
    NodeKind,
    number
  >;
  for (const node of nodes) {
    statusCounts[node.status] += 1;
    kindCounts[node.kind] += 1;
  }

  return OutputSchema.parse({
    nodes: overviewPositionedNodes,
    edges: edges.sort((left, right) =>
      `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`)
    ),
    statusCounts,
    kindCounts,
    cardWidth,
    cardHeight,
    width: Math.max(960, marginX * 2 + cardWidth + (maxRows - 1) * columnGap),
    height: Math.max(620, marginY * 2 + cardHeight + maxDepth * rowGap),
    overviewWidth: Math.max(960, marginX * 2 + cardWidth + (overviewMaxRows - 1) * columnGap),
    overviewHeight: Math.max(620, marginY * 2 + cardHeight + overviewMaxDepth * rowGap)
  });
}
