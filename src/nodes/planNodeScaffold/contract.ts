import { z } from "zod";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({
  nodeName: z.string(),
  templates: z.object({
    contract: z.string(),
    implementation: z.string(),
    test: z.string()
  })
});

export const PlannedFileSchema = z.object({
  path: z.string(),
  contents: z.string()
});

export const OutputSchema = z.object({
  ok: z.boolean(),
  errors: z.array(z.string()),
  nodeDir: z.string().optional(),
  files: z.array(PlannedFileSchema).optional()
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;
export type PlannedFile = z.infer<typeof PlannedFileSchema>;

export const metadata: NodeMetadata = {
  id: "planNodeScaffold",
  purpose:
    "Plan the files and rendered contents needed to scaffold a new node without touching the filesystem.",
  dependencies: [],
  invariants: [
    "The function is pure and deterministic.",
    "Valid node names produce exactly three planned files.",
    "Invalid node names produce errors and no planned files.",
    "Rendered files contain the requested node name wherever the template placeholder appears."
  ]
};

