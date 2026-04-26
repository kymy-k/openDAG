import { InputSchema, OutputSchema, type Input, type Output } from "./contract.js";

export function run(input: Input): Output {
  const parsedInput = InputSchema.parse(input);
  const node = parsedInput.dag.nodes.find((candidate) => candidate.id === parsedInput.nodeName);

  if (!node) {
    return OutputSchema.parse({
      ok: false,
      errors: [`Node "${parsedInput.nodeName}" does not exist in specs/dag.json.`]
    });
  }

  const testFiles = node.allowedFiles.filter((file) => file.endsWith(".test.ts"));

  if (testFiles.length === 0) {
    return OutputSchema.parse({
      ok: false,
      errors: [`Node "${parsedInput.nodeName}" has no test file in allowedFiles.`]
    });
  }

  const existingFiles = new Set(parsedInput.existingFiles);
  const missingFiles = testFiles.filter((file) => !existingFiles.has(file));

  if (missingFiles.length > 0) {
    return OutputSchema.parse({
      ok: false,
      errors: missingFiles.map((file) => `Test file does not exist: ${file}`)
    });
  }

  return OutputSchema.parse({
    ok: true,
    errors: [],
    testFiles,
    commands: [
      {
        command: "npx",
        args: ["vitest", "run", ...testFiles]
      },
      {
        command: "npx",
        args: ["tsc", "--noEmit"]
      }
    ]
  });
}

