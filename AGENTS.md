# AGENTS.md

This repository is governed by contract-first functional DAG rules.

## Required Workflow

1. Always read `specs/dag.json` before editing.
2. Do not implement a node before its contract and tests exist.
3. Do not change public interfaces unless explicitly requested.
4. Do not edit files outside the assigned node unless the user asks.
5. Prefer pure functions: no filesystem, network, database, time, randomness, or hidden global state inside DAG nodes.
6. Keep DAG node behavior deterministic and side-effect free.
7. Every new feature must be implemented through pure functions first, with imperative behavior isolated to shell boundaries.
8. Every new feature must be DAG-compliant: add or update `specs/dag.json` entries for every new named function, contract, helper, template function, skill artifact, and shell function.
9. Any unavoidable side-effecting function must be explicitly marked `imperative`, kept thin, and delegated to by pure DAG nodes only through plain data boundaries.
10. Every DAG node must clearly document what it does, what input it expects, and what output it gives.
11. Keep generated node documentation current by running `npm run generate:docs` after DAG changes.
12. Do not weaken tests to make an implementation pass.
13. If a contract is impossible or underspecified, write a proposed change instead of silently modifying it.
14. Run verification before finishing.
15. Explain what changed and how it was verified.

## Zero-Trust Agent Rules

Agents may implement assigned nodes, add proposed nodes, and add tests for assigned nodes. Agents must not silently change unrelated nodes, global architecture, shared contracts, or verification tools.

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

For any new feature, implement the deterministic core as pure DAG nodes before adding shell code. The minimum acceptable path is:

1. Add or update the DAG entries.
2. Add contracts and invariants.
3. Add tests for the contracts/invariants.
4. Implement pure functions.
5. Add thin imperative shell code only if external effects are required.
6. Classify every new function with `kind`.
7. Run `npm run generate:docs`.
8. Run `npm run validate:dag`, relevant `npm run verify:node -- <nodeId>` commands, and `npm run verify:all`.

If a feature cannot be expressed this way, stop and propose a DAG/contract change instead of bypassing the workflow.
