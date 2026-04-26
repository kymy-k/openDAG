import { z } from "zod";
import { DagSchema } from "../../../contracts/contractTypes.js";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({
  dag: z.unknown()
});

export const OutputSchema = z.object({
  ok: z.boolean(),
  errors: z.array(z.string()),
  dag: DagSchema.optional()
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;

export const metadata: NodeMetadata = {
  id: "validateDag",
  purpose:
    "Validate a openDAG object without reading files or mutating process state.",
  dependencies: [],
  invariants: [
    "The function is pure and deterministic.",
    "Valid output has ok true and no errors.",
    "Invalid output has ok false and at least one human-readable error.",
    "Every dependency must refer to an existing node and the graph must be acyclic.",
    "Allowed files must remain inside one node folder, except specs/contracts references."
  ]
};

