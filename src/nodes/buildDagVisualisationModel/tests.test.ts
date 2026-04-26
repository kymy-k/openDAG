import { describe, expect, it } from "vitest";
import type { Dag } from "../../../contracts/contractTypes.js";
import { run } from "./implementation.js";

const dag: Dag = {
  nodes: [
    {
      id: "b",
      kind: "pure",
      purpose: "Second.",
      inputSchema: "BInput",
      outputSchema: "BOutput",
      dependencies: ["a"],
      invariants: ["Pure."],
      allowedFiles: ["src/nodes/b/contract.ts"],
      status: "implemented"
    },
    {
      id: "a",
      kind: "pure",
      purpose: "First.",
      inputSchema: "AInput",
      outputSchema: "AOutput",
      dependencies: [],
      invariants: ["Pure."],
      allowedFiles: ["src/nodes/a/contract.ts"],
      status: "verified"
    }
  ]
};

describe("buildDagVisualisationModel", () => {
  it("creates a deterministic node and edge model", () => {
    const result = run({ dag });

    expect(result.nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(result.nodes.map((node) => node.kind)).toEqual(["pure", "pure"]);
    expect(result.edges).toEqual([{ from: "b", to: "a", route: "main" }]);
    expect(result.nodes.find((node) => node.id === "a")?.dependents).toEqual(["b"]);
    expect(result.nodes.find((node) => node.id === "b")?.dependencies).toEqual(["a"]);
  });

  it("places entrypoints above their internal dependencies", () => {
    const result = run({ dag });
    const a = result.nodes.find((node) => node.id === "a");
    const b = result.nodes.find((node) => node.id === "b");

    expect(b?.depth).toBe(0);
    expect(a?.depth).toBe(1);
    expect((a?.y ?? 0) > (b?.y ?? 0)).toBe(true);
  });

  it("keeps card bounds inside the viewBox", () => {
    const result = run({ dag });

    for (const node of result.nodes) {
      expect(node.x - result.cardWidth / 2).toBeGreaterThanOrEqual(0);
      expect(node.y - result.cardHeight / 2).toBeGreaterThanOrEqual(0);
      expect(node.x + result.cardWidth / 2).toBeLessThanOrEqual(result.width);
      expect(node.y + result.cardHeight / 2).toBeLessThanOrEqual(result.height);
      expect(node.overviewX - result.cardWidth / 2).toBeGreaterThanOrEqual(0);
      expect(node.overviewY - result.cardHeight / 2).toBeGreaterThanOrEqual(0);
      expect(node.overviewX + result.cardWidth / 2).toBeLessThanOrEqual(result.overviewWidth);
      expect(node.overviewY + result.cardHeight / 2).toBeLessThanOrEqual(result.overviewHeight);
    }
  });

  it("counts statuses", () => {
    const result = run({ dag });

    expect(result.statusCounts).toEqual({
      planned: 0,
      contracted: 0,
      tested: 0,
      implemented: 1,
      verified: 1
    });
  });

  it("counts node kinds", () => {
    const result = run({ dag });

    expect(result.kindCounts).toEqual({
      pure: 2,
      imperative: 0,
      helper: 0,
      orphan: 0,
      template: 0,
      skill: 0
    });
  });

  it("marks pure nodes as the main route with higher importance", () => {
    const result = run({ dag });
    const nodeA = result.nodes.find((node) => node.id === "a");

    expect(nodeA?.route).toBe("main");
    expect(nodeA?.importance).toBe(5);
    expect(nodeA?.width).toBeGreaterThan(260);
  });

  it("provides compact overview coordinates", () => {
    const result = run({ dag });
    const nodeB = result.nodes.find((node) => node.id === "b");

    expect(nodeB?.overviewY).toBeLessThan(result.overviewHeight);
    expect(result.overviewWidth).toBeLessThanOrEqual(result.width);
  });
});
