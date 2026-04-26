import { z } from "zod";

export const NodeStatusSchema = z.enum([
  "planned",
  "contracted",
  "tested",
  "implemented",
  "verified"
]);

export const NodeKindSchema = z.enum([
  "pure",
  "imperative",
  "helper",
  "orphan",
  "template",
  "skill"
]);

export const DagNodeSchema = z.object({
  id: z.string().min(1),
  kind: NodeKindSchema,
  purpose: z.string().min(1),
  inputSchema: z.string().min(1),
  outputSchema: z.string().min(1),
  dependencies: z.array(z.string().min(1)),
  invariants: z.array(z.string().min(1)).min(1),
  allowedFiles: z.array(z.string().min(1)),
  status: NodeStatusSchema
});

export const DagSchema = z.object({
  nodes: z.array(DagNodeSchema)
});

export type NodeStatus = z.infer<typeof NodeStatusSchema>;
export type NodeKind = z.infer<typeof NodeKindSchema>;
export type DagNode = z.infer<typeof DagNodeSchema>;
export type Dag = z.infer<typeof DagSchema>;

export type NodeMetadata = Pick<
  DagNode,
  "id" | "purpose" | "dependencies" | "invariants"
>;
