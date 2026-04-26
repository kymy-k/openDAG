---
name: functional-dag-agent-skill
description: Contract-first functional DAG workflow for complex coding tasks. Use when Codex is starting a complex implementation, decomposing work into pure typed DAG nodes, implementing a single assigned node, verifying contracts/tests, enforcing zero-trust agent boundaries, or refusing to mutate unrelated modules. Reusable across repositories; only assume the openDAG repo layout when the project has explicitly opted into it.
---

# Functional DAG Agent Skill

Use this skill to turn coding work into small, typed, contract-first functional units. Prefer it when the task has meaningful complexity, multiple steps, cross-module risk, or agent-boundary concerns.

## Core Rule

Separate the imperative shell from the pure core. DAG nodes should be deterministic functions with explicit input/output contracts, invariants, dependencies, and tests. Side effects belong outside nodes unless the project explicitly defines a side-effect boundary node.

## Repository Detection

Before editing:

1. Inspect the repo for local instructions such as `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, package scripts, and existing tests.
2. Look for project opt-in files such as `specs/dag.json`, `contracts/`, node contract files, or verification scripts.
3. If the project has a functional DAG layout, follow it exactly.
4. If the project has not opted in, apply the workflow conceptually: propose or create the smallest compatible contract/test/implementation structure that fits the existing repo.
5. Do not impose this exact skill's folder layout on application code unless the user asks.

## Starting A Complex Coding Task

1. Restate the task as a global spec: inputs, outputs, success criteria, constraints, and non-goals.
2. Decompose the task into a DAG of small nodes.
3. For each node define:
   - id
   - kind: pure, imperative, helper, orphan, template, or skill
   - purpose
   - input schema or type
   - output schema or type
   - invariants
   - dependencies
   - allowed edit scope
   - verification command
4. Check that dependencies are acyclic and that each node is independently testable.
5. Implement only after contracts and tests exist, unless the user explicitly requests exploratory prototyping.

Use `templates/dag-node.md` as a compact checklist when a repo has no existing DAG format.

## Implementing One Assigned Node

1. Read the global spec and DAG/contract entry for the assigned node.
2. Confirm the node's allowed files and public interface.
3. Write or update tests against the contract before implementation when feasible.
4. Implement the pure function only inside the assigned scope.
5. Validate input and output at the boundary when the local stack supports schemas, such as Zod in TypeScript.
6. Do not edit upstream/downstream node interfaces to make the implementation easier.
7. Run the node-level verification command and any relevant typecheck/lint command.

If the contract is impossible or underspecified, stop implementation for that part and write a proposed contract change with rationale.

## Verification Workflow

Prefer the repo's own commands. If none exist, run the nearest equivalents:

1. Contract/schema validation
2. Unit tests for the assigned node
3. Property or invariant tests when useful
4. Typecheck
5. Lint, if already configured
6. Full verification before finishing if the change touches shared behavior

For repositories that opt into the openDAG MVP, typical commands are:

```bash
npm run validate:dag
npm run verify:node -- <nodeName>
npm run verify:all
```

## Zero-Trust Boundaries

Treat individual agents as untrusted implementers:

- Do not silently mutate unrelated modules.
- Do not change public interfaces unless explicitly requested.
- Do not weaken tests to pass.
- Do not broaden allowed edit scope without calling it out.
- Do not add hidden state, filesystem access, network access, time, randomness, caches, or globals inside pure nodes.
- Do not make architectural changes while implementing a leaf node.

When a requested change would require touching unrelated files, explain the dependency and ask or record a proposed change rather than silently editing.

## Refusal Pattern For Unrelated Mutations

Use a concise refusal when an edit violates the assigned contract:

```text
I cannot make that change as part of this node implementation because it mutates <module/file>, which is outside the assigned node scope. I can either write a proposed DAG/contract change or proceed with the current contract.
```

## Deliverable Format

When finishing, report:

- Node(s) or contract(s) changed
- Public interfaces changed, if any
- Verification commands run and results
- Any proposed DAG/contract changes left for review
