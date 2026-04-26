import { describe, expect, it } from "vitest";
import type { Output as VisualisationModel } from "../buildDagVisualisationModel/contract.js";
import { run } from "./implementation.js";

const model: VisualisationModel = {
  nodes: [
    {
      id: "a",
      kind: "pure",
      route: "main",
      importance: 5,
      purpose: "First <node>.",
      inputSchema: "Input",
      outputSchema: "Output",
      dependencies: [],
      dependents: ["b"],
      invariants: ["Pure."],
      allowedFiles: ["src/nodes/a/contract.ts"],
      status: "verified",
      depth: 0,
      x: 202,
      y: 130,
      overviewX: 202,
      overviewY: 130,
      width: 320,
      height: 114
    }
  ],
  edges: [],
  statusCounts: {
    planned: 0,
    contracted: 0,
    tested: 0,
    implemented: 0,
    verified: 1
  },
  kindCounts: {
    pure: 1,
    imperative: 0,
    helper: 0,
    orphan: 0,
    template: 0,
    skill: 0
  },
  cardWidth: 260,
  cardHeight: 92,
  width: 960,
  height: 640,
  overviewWidth: 960,
  overviewHeight: 640
};

describe("renderDagVisualisationHtml", () => {
  it("renders a complete interactive HTML document", () => {
    const result = run({ title: "DAG", model });

    expect(result.html).toContain("<!doctype html>");
    expect(result.html).toContain('id="search"');
    expect(result.html).toContain('id="statusFilter"');
    expect(result.html).toContain('id="routeFilter"');
    expect(result.html).toContain('id="viewMode"');
    expect(result.html).toContain('id="dag-data"');
    expect(result.html).toContain("foreignObject");
    expect(result.html).toContain("node-card");
    expect(result.html).toContain("Main route");
    expect(result.html).toContain("route-main");
    expect(result.html).toContain("function selectNode");
    expect(result.html).toContain("function dependencyIdsForNode");
    expect(result.html).toContain("function expandedDependencyIds");
    expect(result.html).toContain("function expandedDependencyPosition");
    expect(result.html).toContain("function expandedBandHeight");
    expect(result.html).toContain("function positionForNode");
    expect(result.html).toContain("function graphDimensions");
  });

  it("escapes title HTML and script JSON less-than characters", () => {
    const result = run({ title: "<DAG>", model });

    expect(result.html).toContain("<title>&lt;DAG&gt;</title>");
    expect(result.html).toContain("\\u003cnode>");
  });
});
