import { z } from "zod";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({
  text: z.string()
});

export const OutputSchema = z.object({
  normalized: z.string()
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;

export const metadata: NodeMetadata = {
  id: "normalizeText",
  purpose:
    "Normalize text by trimming outer whitespace and collapsing repeated whitespace to one space.",
  dependencies: [],
  invariants: [
    "The function is pure and deterministic.",
    "The output normalized string has no leading or trailing whitespace.",
    "Every non-empty whitespace run in the input becomes a single space in the output.",
    "Normal words are preserved in their original order."
  ]
};
