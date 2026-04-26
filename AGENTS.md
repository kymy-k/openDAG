# AGENTS.md

This repository is governed by contract-first functional DAG rules.

## Default Agent Role

Codex acts as the **master agent** unless the user explicitly assigns it to implement one specific DAG node as a subagent.

The master agent owns decomposition, contracts, DAG shape, verification, and integration. Node subagents are zero-trust implementers: they may read files needed for context, but each spawned subagent must be assigned exactly one editable file and may only modify that file's contents.

## Required Workflow

1. Always read `specs/dag.json` before editing.
2. Do not implement a node before its contract and tests exist.
3. As master, decompose new features into DAG nodes before implementation.
4. As master, edit `specs/dag.json`, public interfaces, dependencies, node I/O, and architecture only when required by the requested feature.
5. As subagent, do not change public interfaces, dependencies, DAG entries, shared contracts, global architecture, package scripts, or verification tools.
6. As subagent, edit only the one `Editable file` named by the master assignment. You may read other files for context, including the node's `allowedFiles`, but you must not write to them.
7. Prefer pure functions: no filesystem, network, database, time, randomness, or hidden global state inside DAG nodes.
8. Keep DAG node behavior deterministic and side-effect free.
9. Every new feature must be implemented through pure functions first, with imperative behavior isolated to shell boundaries.
10. Every new feature must be DAG-compliant: add or update `specs/dag.json` entries for every new named function, contract, helper, template function, skill artifact, and shell function.
11. Any unavoidable side-effecting function must be explicitly marked `imperative`, kept thin, and delegated to by pure DAG nodes only through plain data boundaries.
12. Every DAG node must clearly document what it does, what input it expects, and what output it gives.
13. Keep generated node documentation current by running `npm run generate:docs` after DAG changes.
14. Do not weaken tests to make an implementation pass.
15. If a contract is impossible or underspecified, write a proposed change instead of silently modifying it.
16. Run verification before finishing.
17. Explain what changed and how it was verified.

## Zero-Trust Agent Rules

Agents are divided into two roles:

- **Master agent**: may edit the DAG, create or revise contracts, change I/O, add dependencies, spawn or assign node subagents, review patches, and integrate verified node work.
- **Node subagent**: may implement exactly one assigned node for exactly one assigned editable file, and propose contract/DAG changes. A subagent must not apply proposed DAG/interface/global changes itself.

Subagent patch rules:

- A subagent patch is invalid if it changes any file other than the assignment's single `Editable file`.
- The assigned `Editable file` must be one file from the assigned node's `allowedFiles`. The rest of `allowedFiles` is read-only context for that subagent.
- A subagent patch is invalid if it mutates `specs/dag.json`, shared contract types, package scripts, global architecture, verification tools, or another node unless those files are explicitly in that node's `allowedFiles` and the master assignment permits it.
- If the assigned contract is impossible or underspecified, the subagent must stop and write a proposed change for the master instead of widening scope.
- The master must inspect subagent diffs before accepting them, run `npm run verify:file-scope -- <editableFile>`, run node-level verification, and then run full verification after integration.

Agents may implement assigned nodes, add proposed nodes, and add tests for assigned nodes. When implementation and test changes are both needed, spawn separate file-scoped subagents, one per editable file. Agents must not silently change unrelated nodes, global architecture, shared contracts, or verification tools.

Every node should have:

- A `kind` classification: `pure`, `imperative`, `helper`, `orphan`, `template`, or `skill`
- Written purpose
- Zod input schema
- Zod output schema
- Clear generated documentation in `specs/node_catalog.md`
- TypeScript input/output types
- Invariants
- Tests
- Pure implementation
- DAG entry in `specs/dag.json`

Every named function in repository-owned source, tool, template, and skill code must be represented in `specs/dag.json`. Imperative functions are allowed only at shell boundaries and must be marked `imperative`. Standalone helpers must be marked `helper` or `orphan`. Template/client-generated functions must be marked `template`. Skill artifacts and skill scripts must be marked `skill`.

## New Feature Rule

For any new feature, the master agent must implement the deterministic core as pure DAG nodes before adding shell code. The minimum acceptable path is:

1. Add or update the DAG entries.
2. Add contracts and invariants.
3. Add tests for the contracts/invariants.
4. Create one assignment per editable file within each implementation unit.
5. If using subagents, give each subagent only one node id, one editable file, its contract, its dependencies, read-only context files, and its verification commands.
6. Reject or revise any subagent output that changes files outside that one editable file.
7. Implement pure functions.
8. Add thin imperative shell code only if external effects are required.
9. Classify every new function with `kind`.
10. Run `npm run generate:docs`.
11. Run `npm run validate:dag`, relevant `npm run verify:file-scope -- <editableFile>` and `npm run verify:node -- <nodeId>` commands, and `npm run verify:all`.

If a feature cannot be expressed this way, stop and propose a DAG/contract change instead of bypassing the workflow.

## Subagent Assignment Prompt

When the master assigns a node to a subagent, the assignment must include:

```text
Role: node subagent
Assigned node: <node id>
Goal: implement or test only this node in the single editable file
Contract: <input schema, output schema, invariants, dependencies>
Editable file: <exactly one file from specs/dag.json allowedFiles>
Read-only context files: <other relevant allowedFiles or repo files the subagent may read but not edit>
Forbidden edits: every file except Editable file, including specs/dag.json, shared contracts, other nodes, package scripts, verification tools, public I/O, architecture unless that file is the Editable file and the master explicitly permits it
If blocked: write a proposed DAG/contract change; do not apply it
Verification: npm run verify:file-scope -- <editable file>, npm run verify:node -- <node id>, and any node-local tests
Return: changed files, behavior summary, verification results, proposed changes if any
```
