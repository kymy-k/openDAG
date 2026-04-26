import { describe, expect, it } from "vitest";
import { run } from "./implementation.js";

describe("validateFileEditScope", () => {
  it("accepts an unchanged or single-file patch for the editable file", () => {
    expect(run({ editableFile: "src/a.ts", changedFiles: [] })).toEqual({
      ok: true,
      errors: [],
      editableFile: "src/a.ts",
      changedFiles: []
    });

    expect(run({ editableFile: "src/a.ts", changedFiles: ["src/a.ts"] }).ok).toBe(true);
  });

  it("normalizes slash variants before comparing file paths", () => {
    const result = run({
      editableFile: "src\\nodes\\nodeA\\implementation.ts",
      changedFiles: ["src/nodes/nodeA/implementation.ts"]
    });

    expect(result.ok).toBe(true);
    expect(result.editableFile).toBe("src/nodes/nodeA/implementation.ts");
  });

  it("rejects changes outside the one editable file", () => {
    const result = run({
      editableFile: "src/a.ts",
      changedFiles: ["src/a.ts", "src/b.ts", "tests/a.test.ts"]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      'file-scoped subagent may edit only "src/a.ts", but changed "src/b.ts"',
      'file-scoped subagent may edit only "src/a.ts", but changed "tests/a.test.ts"'
    ]);
  });

  it("rejects absolute or escaping paths", () => {
    expect(run({ editableFile: "/tmp/a.ts", changedFiles: [] }).errors).toEqual([
      'editableFile "/tmp/a.ts" must be a relative path inside the repo'
    ]);

    const result = run({ editableFile: "src/a.ts", changedFiles: ["../outside.ts"] });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(["changedFiles must contain only relative paths inside the repo"]);
  });
});
