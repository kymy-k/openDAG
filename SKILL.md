---
name: opendag
description: Use openDAG's contract-first functional DAG workflow for coding-agent work, including master/subagent node implementation, zero-trust file boundaries, verification, and incremental repository conversion into pure typed DAG nodes. Use when Codex is starting a complex implementation, enforcing DAG contracts, assigning or implementing a node, verifying node/file scope, or converting an existing repo toward openDAG.
---

# openDAG

Use this skill when coding work should follow openDAG: a contract-first, functional DAG workflow with explicit node contracts, tests, allowed file boundaries, and verification.

## Choose The Workflow

Use the agent workflow for normal implementation inside an openDAG-aware repo:

- Read local instructions and `specs/dag.json` before editing.
- Act as master agent unless the user explicitly assigns one node as a subagent.
- Define or update contracts and tests before implementation.
- Keep deterministic behavior in pure DAG nodes and side effects in thin shell boundaries.
- Assign exactly one node and one editable file per subagent when delegation is used.
- Verify file scope, node behavior, DAG validity, generated docs, and full project checks before finishing.

Detailed reference: `agent/functional-dag-agent.md`.

Use the repo-converter workflow when the user asks to retrofit an existing repository:

- Scan the requested scope for repo-owned named functions.
- Add or update DAG entries for every in-scope function.
- Classify deterministic units as pure/helper/orphan and side-effect boundaries as imperative.
- Add tests and generated docs before declaring the conversion complete.
- For full conversion, continue until no scanner-reported repo-owned functions remain uncovered unless each remainder has a concrete blocker or exclusion.

Detailed reference: `repo-converter/functional-dag-repo-converter.md`.

## Core Rules

1. Read repo-local instructions and DAG files before editing.
2. Do not implement a node before its contract and tests exist unless the user explicitly asks for exploratory prototyping.
3. Prefer pure functions with explicit input/output schemas and invariants.
4. Keep filesystem, network, database, process, time, randomness, and framework effects in imperative shell nodes.
5. Track every repo-owned named function, helper, template function, skill artifact, and shell function in `specs/dag.json` when the repo has opted into openDAG.
6. Do not weaken tests to make an implementation pass.
7. Run the repo's DAG validation, node verification, generated-docs check, and full verification before finishing when feasible.

## Bundled Tools

- `agent/scripts/check-dag-json.mjs`: lightweight DAG checker for skill-local or early setup use.
- `agent/scripts/scaffold-ts-zod-node.mjs`: TypeScript/Zod node scaffold helper.
- `repo-converter/scripts/repo-scan.mjs`: scanner for uncovered functions, side-effect hints, and missing node tests.

## Subagent Boundary

When assigning node work, provide exactly one editable file and forbid all other writes. A node subagent may read relevant context but must not change DAG entries, shared contracts, package scripts, public I/O, verification tools, architecture, or another node unless that one file is explicitly assigned.

Use `agent/templates/subagent-assignment.md` for assignment packets.
