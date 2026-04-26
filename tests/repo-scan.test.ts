import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const scannerPath = path.join(process.cwd(), "opendag", "repo-converter", "scripts", "repo-scan.mjs");

async function makeRepo(dagAllowedFiles: string[]): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "opendag-scan-"));
  await mkdir(path.join(root, "src"), { recursive: true });
  await mkdir(path.join(root, "specs"), { recursive: true });
  const source = "export fun" + "ction normalize" + "Name(value) { return value.trim(); }\n";
  await writeFile(path.join(root, "src", "feature.ts"), source);
  await writeFile(
    path.join(root, "specs", "dag.json"),
    JSON.stringify({
      nodes: [
        {
          id: "feature.normalizeName",
          kind: "pure",
          purpose: "Normalize one display name by trimming surrounding whitespace.",
          inputSchema: "value: string",
          outputSchema: "trimmed string",
          dependencies: [],
          invariants: ["Pure and deterministic."],
          allowedFiles: dagAllowedFiles,
          status: "implemented"
        }
      ]
    })
  );

  return root;
}

async function scan(root: string, args: string[] = []) {
  const { stdout } = await execFileAsync("node", [scannerPath, root, ...args]);
  return JSON.parse(stdout);
}

describe("repo-scan", () => {
  it("reports DAG nodes in the requested scope that do not have separate tests", async () => {
    const root = await makeRepo(["src/feature.ts"]);
    const result = await scan(root);

    expect(result.possiblyUncoveredFunctionCount).toBe(0);
    expect(result.nodesMissingTests).toEqual([
      expect.objectContaining({
        id: "feature.normalizeName",
        kind: "pure"
      })
    ]);

    await expect(
      execFileAsync("node", [scannerPath, root, "--fail-on-missing-tests"])
    ).rejects.toMatchObject({ code: 1 });
  });

  it("accepts DAG nodes that declare separate tests files", async () => {
    const root = await makeRepo(["src/feature.ts", "tests/feature.normalizeName.test.ts"]);
    const result = await scan(root, ["--fail-on-missing-tests"]);

    expect(result.possiblyUncoveredFunctionCount).toBe(0);
    expect(result.nodesMissingTestsCount).toBe(0);
  });
});
