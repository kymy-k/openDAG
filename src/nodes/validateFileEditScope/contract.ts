import { z } from "zod";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({
  editableFile: z.string().min(1),
  changedFiles: z.array(z.string().min(1))
});

export const OutputSchema = z.object({
  ok: z.boolean(),
  errors: z.array(z.string()),
  editableFile: z.string().optional(),
  changedFiles: z.array(z.string()).optional()
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;

export const metadata: NodeMetadata = {
  id: "validateFileEditScope",
  purpose:
    "Validate that a file-scoped subagent patch changes only the single file assigned as editable.",
  dependencies: ["validateFileEditScope.normalizeRepoPath"],
  invariants: [
    "The function is pure and deterministic.",
    "The editable file and every changed file must normalize to repo-relative paths.",
    "Valid output has ok true when all changed paths equal the one editable file.",
    "Invalid output has ok false and explains every out-of-scope changed path."
  ]
};
