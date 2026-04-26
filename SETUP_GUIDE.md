# Setup Guide: Add Functional DAG Contracts To Any Project

This guide shows how to adopt the `openDAG` workflow in an existing repository without assuming this exact repo layout.

## Goal

Move risky coding-agent work into small, typed, contract-first pure functions. Keep imperative side effects in thin shells around the pure core.

```text
user spec -> DAG -> contracts -> tests -> implementations -> generated docs -> verification
```

## 1. Inspect The Existing Project

Before changing code, identify:

- The language and type system.
- The test runner and typecheck command.
- Existing architecture boundaries.
- Existing pure or mostly-pure business logic.
- Side-effect boundaries such as HTTP handlers, CLIs, database adapters, queues, filesystem code, clocks, randomness, and external APIs.

Do not reorganize the whole repo first. Start with one useful slice.

## 2. Add Minimal Workflow Files

Recommended files:

```text
AGENTS.md
specs/
  user_spec.md
  dag.json
contracts/
  contractTypes.ts
```

For non-TypeScript repos, replace `contractTypes.ts` with the project’s native contract/schema convention.

## 3. Define The DAG

Each node should include:

```json
{
  "id": "nodeName",
  "kind": "pure",
  "purpose": "Validate one parsed invoice object and return normalized invoice facts without reading external state.",
  "inputSchema": "Describe the exact input shape or named schema.",
  "outputSchema": "Describe the exact output shape or named schema.",
  "dependencies": [],
  "invariants": ["Pure and deterministic."],
  "allowedFiles": ["path/to/node/files"],
  "status": "planned"
}
```

Keep the graph acyclic. Prefer smaller nodes with explicit dependencies over large modules with implicit state.

Use `kind` to classify every function:

- `pure`: deterministic DAG core.
- `imperative`: shell function that performs filesystem, process, network, database, clock, random, or environment effects.
- `helper`: support function used by another node.
- `orphan`: standalone function not currently used by another node.
- `template`: function inside generated/template/client code.
- `skill`: skill artifact or skill helper script.

Every named function in repo-owned source, tools, templates, and skill scripts should appear in the DAG.

The `purpose`, `inputSchema`, and `outputSchema` fields are user-facing documentation, not just internal metadata. Write them so a new agent can understand what the node does, what input it expects, and what output it gives without opening the implementation.

## 4. Write Contracts Before Implementations

For TypeScript, use Zod:

```ts
import { z } from "zod";

export const InputSchema = z.object({});
export const OutputSchema = z.object({});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;

export function run(input: Input): Output {
  InputSchema.parse(input);
  const output = {};
  return OutputSchema.parse(output);
}
```

For other stacks, use the closest equivalent: Pydantic, JSON Schema, Rust types plus validators, Go structs plus validation, or existing project conventions.

## 5. Keep Side Effects Outside DAG Nodes

Pure DAG nodes must not call:

- Filesystem
- Network
- Database
- Clock/time
- Randomness
- Process environment
- Hidden global state
- Mutable singletons or caches

Wrap those effects in an imperative shell, then pass plain data into pure nodes.

## 6. Add Verification

At minimum:

```bash
npm run validate:dag
npm run generate:docs
npm run check:docs
npm run verify:node -- <nodeName>
npm run verify:all
```

Equivalent commands are fine in other ecosystems. The important pieces are:

- Validate the DAG.
- Generate node documentation from the DAG and fail verification if it is stale.
- Run node-level tests.
- Run typecheck or static validation.
- Run full verification before finishing.

## 7. Convert Incrementally

A safe conversion order:

1. Pick one pure or mostly-pure workflow.
2. Write a DAG entry for it.
3. Add a contract.
4. Add unit and invariant tests.
5. Move deterministic logic into the node.
6. Leave side-effect code in the shell.
7. Verify.
8. Repeat for adjacent nodes.

## 8. Install The openDAG Skill

This repo includes one Codex skill for the implementation workflow and repository conversion workflow:

[opendag](opendag/SKILL.md)

Install it:

```bash
mkdir -p ~/.codex/skills
cp -R opendag ~/.codex/skills/
```

Then invoke it in another repo:

```text
Use opendag to convert this repo incrementally to a pure functional DAG contract workflow.
```
