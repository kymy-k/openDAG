import { InputSchema, OutputSchema, type Input, type Output } from "./contract.js";

export function run(input: Input): Output {
  const parsedInput = InputSchema.parse(input);
  const output = {
    normalized: parsedInput.text.trim().replace(/\s+/g, " ")
  };

  return OutputSchema.parse(output);
}
