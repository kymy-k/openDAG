# openDAG Agent Workflow

Use this workflow through the root `opendag` skill to turn coding work into small, typed, contract-first functional units. Prefer it when the task has meaningful complexity, multiple steps, cross-module risk, or agent-boundary concerns.

## Core Rule

Separate the imperative shell from the pure core. DAG nodes should be deterministic functions with explicit input/output contracts, invariants, dependencies, and tests. Side effects belong outside nodes unless the project explicitly defines a side-effect boundary node.

## Agent Roles

Default to **master agent** unless the user explicitly assigns Codex to one node as a subagent.

The master agent:

- Owns the global spec, DAG, contracts, public I/O, dependencies, and architecture.
- Decomposes features into node assignments before implementation.
- May edit `specs/dag.json`, contracts, shell entrypoints, and shared architecture when the requested feature requires it.
- Creates one assignment packet per editable file and, when the runtime and user authorization allow delegation, spawns one subagent per file.
- Reviews every subagent patch against that single editable file, rejects out-of-scope edits, runs file-scope verification, runs node verification, then runs full verification.

A node subagent:

- Implements or tests exactly one assigned node for exactly one assigned editable file.
- May read other files for context, including files listed in that node's `allowedFiles`, but may modify only the assignment's single editable file.
- Must not edit DAG entries, shared contracts, package scripts, verification tools, public interfaces, architecture, or another node unless the master assignment explicitly includes those files.
- Must not broaden its own scope. If blocked, it writes a proposed DAG/contract change for the master instead of applying it.

If subagents are unavailable, the master still uses the same assignment packets and enforces the same boundaries while implementing locally.

## Repository Detection

Before editing:

1. Inspect the repo for local instructions such as `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, package scripts, and existing tests.
2. Look for project opt-in files such as `specs/dag.json`, `contracts/`, node contract files, or verification scripts.
3. If the project has a functional DAG layout, follow it exactly.
4. If the project has not opted in, apply the workflow conceptually: propose or create the smallest compatible contract/test/implementation structure that fits the existing repo.
5. Do not impose this exact skill's folder layout on application code unless the user asks.

## Starting A Complex Coding Task

1. Act as master agent.
2. Restate the task as a global spec: inputs, outputs, success criteria, constraints, and non-goals.
3. Decompose the task into a DAG of small nodes.
4. For each node define:
   - id
   - kind: pure, imperative, helper, orphan, template, or skill
   - purpose
   - input schema or type
   - output schema or type
   - invariants
   - dependencies
   - allowed edit scope
   - verification command
5. Check that dependencies are acyclic and that each node is independently testable.
6. Write or update contracts and tests before implementation when feasible.
7. Create file-scoped node assignment packets. Use one packet per editable file per subagent or local implementation pass.
8. Implement only after contracts and tests exist, unless the user explicitly requests exploratory prototyping.

Use `templates/dag-node.md` as a compact checklist when a repo has no existing DAG format.
Use `templates/master-feature-plan.md` for master planning and `templates/subagent-assignment.md` for node handoffs.

## Master Workflow

For every feature:

1. Read local agent instructions and the DAG.
2. Decide which files are master-owned: DAG, public I/O, shared contracts, shell commands, docs, verification.
3. Decide node boundaries and update DAG/contracts/tests.
4. For each implementation node, prepare one assignment per editable file, selecting that file from the node's `allowedFiles`.
5. Delegate only when useful and allowed by the execution environment. Assign one node and one editable file per subagent.
6. Review subagent output before integration:
   - changed files must be exactly empty or the assignment's single editable file
   - tests must not be weakened
   - public I/O must match the master-approved contract
   - no hidden effects inside pure nodes
7. Run `npm run verify:file-scope -- <editableFile>` for accepted subagent work.
8. Run node verification for accepted node work.
9. Regenerate DAG docs and run full verification.

## Implementing One Assigned Node

1. Confirm you are acting as a node subagent, not master.
2. Read the global spec and DAG/contract entry for the assigned node.
3. Confirm the node's allowed files, the assignment's single editable file, and public interface.
4. Write or update tests against the contract before implementation when feasible.
5. Implement the pure function only inside the assigned scope.
6. Validate input and output at the boundary when the local stack supports schemas, such as Zod in TypeScript.
7. Do not edit upstream/downstream node interfaces to make the implementation easier.
8. Do not edit any file except the assignment's single editable file, including `specs/dag.json`, shared contracts, package scripts, verification tools, other nodes, or global architecture.
9. Run the node-level verification command and any relevant typecheck/lint command.

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

- Master agents may change DAG/contracts/architecture; subagents may not.
- Subagents are constrained to one node and exactly one editable file selected by the master from that node's `allowedFiles`.
- Subagents may read other files for context but may only edit that one file's contents.
- Do not silently mutate unrelated modules.
- Do not change public interfaces unless explicitly requested.
- Do not weaken tests to pass.
- Do not broaden allowed edit scope without calling it out.
- Do not add hidden state, filesystem access, network access, time, randomness, caches, or globals inside pure nodes.
- Do not make architectural changes while implementing a leaf node.

When a requested change would require touching unrelated files, explain the dependency and ask or record a proposed change rather than silently editing.

## Subagent Assignment Format

Every node assignment must include this information:

```text
Role: node subagent
Assigned node: <node id>
Goal: implement or test only this node
Contract: <input schema, output schema, invariants, dependencies>
Editable file: <exactly one file from allowedFiles>
Read-only context files: <other files the subagent may inspect but not edit>
Forbidden edits: every file except Editable file, including DAG, shared contracts, package scripts, verification tools, public I/O, architecture, and other nodes unless that file is the Editable file and approved by master
If blocked: write a proposed DAG/contract change; do not apply it
Verification: npm run verify:file-scope -- <editableFile> and <node-level command>
Return: changed files, behavior summary, verification results, proposed changes if any
```

## Refusal Pattern For Unrelated Mutations

Use a concise refusal when an edit violates the assigned contract:

```text
I cannot make that change as part of this node implementation because it mutates <module/file>, which is outside the assigned node scope. I can either write a proposed DAG/contract change or proceed with the current contract.
```

## Deliverable Format

When finishing, report:

- Node(s) or contract(s) changed
- Public interfaces changed, if any
- Whether work was master-owned or subagent-owned
- Any subagent patch boundary checks performed
- Verification commands run and results
- Any proposed DAG/contract changes left for review
