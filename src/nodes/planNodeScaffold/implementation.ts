import { InputSchema, OutputSchema, type Input, type Output } from "./contract.js";

const nodeNamePattern = /^[A-Za-z][A-Za-z0-9_-]*$/u;

function render(template: string, nodeName: string): string {
  return template.replaceAll("__NODE_NAME__", nodeName);
}

export function run(input: Input): Output {
  const parsedInput = InputSchema.parse(input);
  const { nodeName, templates } = parsedInput;

  if (!nodeNamePattern.test(nodeName)) {
    return OutputSchema.parse({
      ok: false,
      errors: [
        "nodeName must start with a letter and contain only letters, numbers, underscores, or hyphens"
      ]
    });
  }

  const nodeDir = `src/nodes/${nodeName}`;

  return OutputSchema.parse({
    ok: true,
    errors: [],
    nodeDir,
    files: [
      {
        path: `${nodeDir}/contract.ts`,
        contents: render(templates.contract, nodeName)
      },
      {
        path: `${nodeDir}/implementation.ts`,
        contents: render(templates.implementation, nodeName)
      },
      {
        path: `${nodeDir}/tests.test.ts`,
        contents: render(templates.test, nodeName)
      }
    ]
  });
}

