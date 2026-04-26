import { describe, expect, it } from "vitest";
import type { Dag } from "../../../contracts/contractTypes.js";
import { run } from "./implementation.js";

const dag: Dag = {
  nodes: [
    {
      id: "nodeA",
      kind: "pure",
      purpose: "Do one thing.",
      inputSchema: "InputSchema",
      outputSchema: "OutputSchema",
      dependencies: [],
      invariants: ["Pure and deterministic."],
      allowedFiles: [
        "src/nodes/nodeA/contract.ts",
        "src/nodes/nodeA/implementation.ts",
        "src/nodes/nodeA/tests.test.ts"
      ],
      status: "implemented"
    }
  ]
};

describe("planNodeVerification", () => {
  it("plans test and typecheck commands for an existing node", () => {
    const result = run({
      dag,
      nodeName: "nodeA",
      existingFiles: ["src/nodes/nodeA/tests.test.ts"]
    });

    expect(result).toEqual({
      ok: true,
      errors: [],
      testFiles: ["src/nodes/nodeA/tests.test.ts"],
      commands: [
        {
          command: "npx",
          args: ["vitest", "run", "src/nodes/nodeA/tests.test.ts"]
        },
        {
          command: "npx",
          args: ["tsc", "--noEmit"]
        }
      ]
    });
  });

  it("rejects a missing node", () => {
    const result = run({ dag, nodeName: "missing", existingFiles: [] });

    expect(result.ok).toBe(false);
    expect(result.commands).toBeUndefined();
    expect(result.errors).toEqual(['Node "missing" does not exist in specs/dag.json.']);
  });

  it("rejects a node without existing test files", () => {
    const result = run({ dag, nodeName: "nodeA", existingFiles: [] });

    expect(result.ok).toBe(false);
    expect(result.commands).toBeUndefined();
    expect(result.errors).toEqual(["Test file does not exist: src/nodes/nodeA/tests.test.ts"]);
  });
});
