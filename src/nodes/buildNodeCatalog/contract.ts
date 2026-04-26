import { z } from "zod";
import { DagSchema } from "../../../contracts/contractTypes.js";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({
  dag: DagSchema,
  title: z.string().min(1).optional()
});

export const OutputSchema = z.object({
  markdown: z.string().min(1)
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;

export const metadata: NodeMetadata = {
  id: "buildNodeCatalog",
  purpose:
    "Generate a deterministic Markdown catalog that clearly documents what every DAG node does, what input it expects, and what output it gives.",
  dependencies: ["validateDag"],
  invariants: [
    "The function is pure and deterministic.",
    "Every DAG node appears exactly once in the generated catalog.",
    "Every node section states what the node does, the input it expects, and the output it gives.",
    "Node sections are sorted by node id for stable diffs."
  ]
};
