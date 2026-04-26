import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { run } from "./implementation.js";

const templates = {
  contract: "contract __NODE_NAME__",
  implementation: "implementation __NODE_NAME__",
  test: "test __NODE_NAME__"
};

describe("planNodeScaffold", () => {
  it("plans the three standard node files", () => {
    const result = run({ nodeName: "extractFacts", templates });

    expect(result).toEqual({
      ok: true,
      errors: [],
      nodeDir: "src/nodes/extractFacts",
      files: [
        {
          path: "src/nodes/extractFacts/contract.ts",
          contents: "contract extractFacts"
        },
        {
          path: "src/nodes/extractFacts/implementation.ts",
          contents: "implementation extractFacts"
        },
        {
          path: "src/nodes/extractFacts/tests.test.ts",
          contents: "test extractFacts"
        }
      ]
    });
  });

  it("rejects invalid node names without planning files", () => {
    const result = run({ nodeName: "../escape", templates });

    expect(result.ok).toBe(false);
    expect(result.files).toBeUndefined();
    expect(result.errors).toHaveLength(1);
  });

  it("renders all placeholders for valid generated names", () => {
    fc.assert(
      fc.property(
        fc
          .tuple(
            fc.char().filter((char) => /[A-Za-z]/u.test(char)),
            fc.stringOf(fc.char().filter((char) => /[A-Za-z0-9_-]/u.test(char)), {
              maxLength: 20
            })
          )
          .map(([first, rest]) => `${first}${rest}`),
        (nodeName) => {
          const result = run({ nodeName, templates });

          expect(result.ok).toBe(true);
          expect(result.files).toHaveLength(3);
          expect(result.files?.every((file) => file.contents.includes(nodeName))).toBe(true);
          expect(result.files?.every((file) => !file.contents.includes("__NODE_NAME__"))).toBe(
            true
          );
        }
      )
    );
  });
});

