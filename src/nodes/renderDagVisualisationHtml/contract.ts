import { z } from "zod";
import { OutputSchema as VisualisationModelSchema } from "../buildDagVisualisationModel/contract.js";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({
  title: z.string().min(1),
  model: VisualisationModelSchema
});

export const OutputSchema = z.object({
  html: z.string().min(1)
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;

export const metadata: NodeMetadata = {
  id: "renderDagVisualisationHtml",
  purpose:
    "Render a DAG visualisation model into a standalone interactive HTML document without filesystem or browser side effects.",
  dependencies: ["buildDagVisualisationModel"],
  invariants: [
    "The function is pure and deterministic.",
    "The output is a complete HTML document.",
    "The output embeds the model data without raw less-than characters inside the JSON script payload.",
    "The rendered page includes interactive search, overview/full mode, route filtering, status filtering, and node selection controls.",
    "Node labels are clipped inside fixed-size cards instead of overflowing.",
    "Non-pure node kinds have distinct visual styling.",
    "Route and importance metadata are visible through labels, edge styles, and node size."
  ]
};
