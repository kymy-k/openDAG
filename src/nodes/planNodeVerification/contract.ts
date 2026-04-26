import { z } from "zod";
import { DagSchema } from "../../../contracts/contractTypes.js";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const VerificationCommandSchema = z.object({
  command: z.string(),
  args: z.array(z.string())
});

export const InputSchema = z.object({
  dag: DagSchema,
  nodeName: z.string().min(1),
  existingFiles: z.array(z.string())
});

export const OutputSchema = z.object({
  ok: z.boolean(),
  errors: z.array(z.string()),
  testFiles: z.array(z.string()).optional(),
  commands: z.array(VerificationCommandSchema).optional()
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;
export type VerificationCommand = z.infer<typeof VerificationCommandSchema>;

export const metadata: NodeMetadata = {
  id: "planNodeVerification",
  purpose:
    "Plan node-level verification commands from a validated DAG and known existing files without running processes.",
  dependencies: ["validateDag"],
  invariants: [
    "The function is pure and deterministic.",
    "A missing node produces errors and no commands.",
    "A node without existing test files produces errors and no commands.",
    "A valid node produces test and typecheck commands without executing them."
  ]
};

