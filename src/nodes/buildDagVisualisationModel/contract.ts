import { z } from "zod";
import { DagSchema, NodeKindSchema, NodeStatusSchema } from "../../../contracts/contractTypes.js";
import type { NodeMetadata } from "../../../contracts/contractTypes.js";

export const InputSchema = z.object({
  dag: DagSchema
});

export const VisualRouteSchema = z.enum(["main", "shell", "support", "generated", "skill"]);

export const VisualNodeSchema = z.object({
  id: z.string(),
  kind: NodeKindSchema,
  route: VisualRouteSchema,
  importance: z.number().int().min(1).max(5),
  purpose: z.string(),
  inputSchema: z.string(),
  outputSchema: z.string(),
  dependencies: z.array(z.string()),
  dependents: z.array(z.string()),
  invariants: z.array(z.string()),
  allowedFiles: z.array(z.string()),
  status: NodeStatusSchema,
  depth: z.number().int().nonnegative(),
  x: z.number(),
  y: z.number(),
  overviewX: z.number(),
  overviewY: z.number(),
  width: z.number().positive(),
  height: z.number().positive()
});

export const VisualEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  route: VisualRouteSchema
});

export const StatusCountsSchema = z.object({
  planned: z.number().int().nonnegative(),
  contracted: z.number().int().nonnegative(),
  tested: z.number().int().nonnegative(),
  implemented: z.number().int().nonnegative(),
  verified: z.number().int().nonnegative()
});

export const KindCountsSchema = z.object({
  pure: z.number().int().nonnegative(),
  imperative: z.number().int().nonnegative(),
  helper: z.number().int().nonnegative(),
  orphan: z.number().int().nonnegative(),
  template: z.number().int().nonnegative(),
  skill: z.number().int().nonnegative()
});

export const OutputSchema = z.object({
  nodes: z.array(VisualNodeSchema),
  edges: z.array(VisualEdgeSchema),
  statusCounts: StatusCountsSchema,
  kindCounts: KindCountsSchema,
  cardWidth: z.number().positive(),
  cardHeight: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  overviewWidth: z.number().positive(),
  overviewHeight: z.number().positive()
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;
export type VisualNode = z.infer<typeof VisualNodeSchema>;
export type VisualEdge = z.infer<typeof VisualEdgeSchema>;
export type VisualRoute = z.infer<typeof VisualRouteSchema>;

export const metadata: NodeMetadata = {
  id: "buildDagVisualisationModel",
  purpose:
    "Build a deterministic visual model for an already-validated DAG without rendering HTML or touching the filesystem.",
  dependencies: ["validateDag"],
  invariants: [
    "The function is pure and deterministic.",
    "Every DAG node appears exactly once in the visual model.",
    "Every dependency is represented as one visual edge from dependent to dependency.",
    "Node depths place entrypoints above their internal dependencies.",
    "Layout dimensions keep node cards inside the viewBox.",
    "Overview coordinates provide a compact default layout for command and pure feature nodes.",
    "Node kind is preserved for visual styling.",
    "Pure core route nodes are visually more important than shell, support, generated, and skill routes."
  ]
};
