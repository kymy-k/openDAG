import { describe, expect, it } from "vitest";
import type { Dag } from "../../../contracts/contractTypes.js";
import { run } from "./implementation.js";

const baseNode = {
  id: "nodeA",
  kind: "pure" as const,
  purpose: "Validate one focused unit of DAG behavior with explicit contract metadata.",
  inputSchema: "InputSchema",
  outputSchema: "OutputSchema",
  dependencies: [],
  invariants: ["Pure and deterministic."],
  allowedFiles: [
    "src/nodes/nodeA/contract.ts",
    "src/nodes/nodeA/implementation.ts",
    "src/nodes/nodeA/tests.test.ts",
    "specs/dag.json",
    "contracts/contractTypes.ts"
  ],
  status: "implemented" as const
};

describe("validateDag", () => {
  it("accepts a valid DAG", () => {
    const result = run({ dag: { nodes: [baseNode] } satisfies Dag });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects duplicate ids", () => {
    const result = run({ dag: { nodes: [baseNode, baseNode] } });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("duplicate node id: nodeA");
  });

  it("rejects unknown and self dependencies", () => {
    const result = run({
      dag: {
        nodes: [
          {
            ...baseNode,
            dependencies: ["nodeA", "missing"]
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("nodeA: node must not depend on itself");
    expect(result.errors).toContain('nodeA: dependency "missing" does not exist');
  });

  it("rejects cycles", () => {
    const result = run({
      dag: {
        nodes: [
          { ...baseNode, id: "nodeA", dependencies: ["nodeB"] },
          {
            ...baseNode,
            id: "nodeB",
            dependencies: ["nodeA"],
            allowedFiles: ["src/nodes/nodeB/contract.ts"]
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.startsWith("cycle detected:"))).toBe(true);
  });

  it("allows separate tests files outside the node folder", () => {
    const result = run({
      dag: {
        nodes: [
          {
            ...baseNode,
            allowedFiles: [
              "src/nodes/nodeA/contract.ts",
              "src/nodes/nodeA/implementation.ts",
              "tests/nodeA.test.ts",
              "specs/dag.json",
              "contracts/contractTypes.ts"
            ]
          }
        ]
      }
    });

    expect(result.ok).toBe(true);
  });

  it("rejects allowed files outside the node folder or specs/contracts/tests references", () => {
    const result = run({
      dag: {
        nodes: [
          {
            ...baseNode,
            allowedFiles: ["src/nodes/nodeA/contract.ts", "tools/validate-dag.ts"]
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      'nodeA: allowedFile "tools/validate-dag.ts" must be inside the node folder or be a specs/contracts/tests reference'
    );
  });

  it("allows imperative shell files outside src/nodes", () => {
    const result = run({
      dag: {
        nodes: [
          {
            ...baseNode,
            id: "tools/validate-dag.ts#main",
            kind: "imperative" as const,
            allowedFiles: ["tools/validate-dag.ts"],
            invariants: ["May read files and write process output at the shell boundary."]
          }
        ]
      }
    });

    expect(result.ok).toBe(true);
  });

  it("allows imperative package workflow metadata files", () => {
    const result = run({
      dag: {
        nodes: [
          {
            ...baseNode,
            id: "command.build",
            kind: "imperative" as const,
            allowedFiles: [
              "package.json",
              "package-lock.json",
              "tsconfig.build.json",
              "src/index.ts",
              "LICENSE",
              ".nvmrc"
            ],
            invariants: ["May run package build subprocesses at the shell boundary."]
          }
        ]
      }
    });

    expect(result.ok).toBe(true);
  });

  it("rejects placeholder node documentation", () => {
    const result = run({
      dag: {
        nodes: [
          {
            ...baseNode,
            purpose: "TODO: fill this in later."
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("nodeA: purpose must not contain placeholder text");
  });
});
