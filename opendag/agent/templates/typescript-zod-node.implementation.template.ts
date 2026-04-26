import { InputSchema, OutputSchema, type Input, type Output } from "./contract.js";

export function run(input: Input): Output {
  InputSchema.parse(input);
  const output = {};

  return OutputSchema.parse(output);
}

