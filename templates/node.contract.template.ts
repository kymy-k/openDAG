import { z } from "zod";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({});

export const OutputSchema = z.object({});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;

export const metadata: NodeMetadata = {
  id: "__NODE_NAME__",
  purpose: "TODO: describe this node's purpose.",
  dependencies: [],
  invariants: ["TODO: define at least one invariant."]
};
