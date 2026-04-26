---
name: functional-dag-repo-converter-skill
description: Convert existing repositories incrementally into a pure functional, contract-first DAG workflow. Use when Codex is asked to retrofit an app, library, CLI, service, or mixed codebase into explicit typed nodes with schemas/contracts, invariants, tests, allowed edit scopes, DAG metadata, verification commands, and zero-trust agent boundaries. Works across languages and should preserve existing architecture while moving deterministic logic into pure nodes and side effects into shells.
---

# Functional DAG Repo Converter

Use this skill to convert an existing repo toward a pure functional, contract-first DAG paradigm without a risky rewrite.

## Goal-Driven Completion Contract

The goal is: convert the repository so every repo-owned named function is represented in the DAG, each deterministic unit has an explicit contract, side effects are isolated as shell/imperative nodes, generated docs are current, and verification passes.

Completion criteria are strict:

- `scripts/repo-scan.mjs --fail-on-uncovered <repo-root>` exits successfully, except generated/vendor files explicitly documented as excluded.
- `specs/dag.json` exists and includes every named repo-owned function as `pure`, `imperative`, `helper`, `orphan`, `template`, or `skill`.
- Every node has clear `purpose`, `inputSchema`, `outputSchema`, dependencies, invariants, status, and `allowedFiles`.
- Pure nodes do not perform filesystem, network, database, process env, time, randomness, hidden global state, or framework request/response effects.
- Shell/effectful functions are present in the DAG and marked `imperative`.
- Generated node docs are current.
- The repo's DAG validation and available tests/static checks pass.

Do **not** stop after a starter DAG, sample slice, or partial conversion when the user asks to convert the repo. Continue scanning, adding DAG nodes, updating docs, and verifying until the criteria above are met or a hard blocker is documented.

Use a goal-driven loop:

```text
while completion criteria are not met:
  scan the repo
  list uncovered functions and unclear contracts
  update DAG/contracts/docs for the next batch
  run validation
  if validation fails, fix the DAG or document a blocker
```

The master agent is the final evaluator. A subagent may claim its assigned node is done, but the master must check the criteria before accepting completion.

## First Pass

1. Read local instructions: `AGENTS.md`, `README`, `CONTRIBUTING`, package files, test config, and existing architecture docs.
2. Inspect the repo shape and identify language, framework, test runner, typecheck command, and side-effect boundaries.
3. Locate deterministic business logic that can become pure nodes.
4. Locate shells: CLIs, HTTP handlers, jobs, database adapters, filesystem/network/time/randomness code.
5. Preserve existing public interfaces unless the user explicitly asks to change them.

If the repo already has `specs/dag.json` or equivalent DAG files, follow the local format.

## Conversion Strategy

If the user asks for full conversion, convert exhaustively. If they explicitly ask for an incremental slice, convert only that slice and report remaining uncovered functions.

1. Add minimal workflow files if absent: `AGENTS.md`, `specs/user_spec.md`, `specs/dag.json`, and a contracts module appropriate for the stack.
2. Run the repo scanner and inspect its `functionCandidates`, `possiblyUncoveredFunctions`, and `sideEffectHits`.
3. Add DAG entries for every repo-owned named function. Use existing files in `allowedFiles`; do not move code unless needed.
4. Classify deterministic logic as pure/helper/orphan and effect boundaries as imperative.
5. Define or describe input/output contracts before implementation changes.
6. Add or preserve tests for contracts and invariants when changing behavior.
7. Move deterministic logic into pure node functions only when needed for the requested conversion; otherwise first represent the existing function faithfully in the DAG.
8. Leave side effects in existing shell code and pass plain data into nodes.
9. Add or update verification commands.
10. Regenerate docs, rerun the scanner, and repeat until no uncovered repo-owned functions remain.

Do not mass-refactor unrelated modules. Do not silently mutate unrelated public interfaces.

## Node Contract Checklist

Every node needs:

- id
- kind: pure, imperative, helper, orphan, template, or skill
- purpose
- input schema or type
- output schema or type
- dependencies
- invariants
- allowed edit scope
- tests
- pure implementation
- verification command

Use `templates/dag.json.template` and `templates/AGENTS.md.template` when the repo has no local convention.

## Purity Boundary

Pure DAG nodes must not directly use:

- filesystem
- network
- database
- process environment
- time
- randomness
- hidden global state
- mutable singleton caches
- framework request/response objects

Shells may do those things, but should convert effects into plain data before calling pure nodes.

## Language Mapping

Choose the repo-native contract tools:

- TypeScript: Zod or existing runtime schema library.
- Python: Pydantic, dataclasses plus validators, or typed dicts plus validation.
- Rust: typed structs/enums plus validation functions.
- Go: structs plus validation functions.
- JVM/.NET: typed DTOs plus validators.

Do not introduce a new validation library if the project already has a strong local standard.

## Refusal Rule

If an requested implementation requires mutating unrelated modules, global architecture, or public interfaces outside the assigned conversion slice, stop and propose a DAG/contract change instead of silently editing.

Use this wording:

```text
This change crosses the assigned DAG boundary because it touches <files/interfaces>. I can write a proposed contract/DAG update, or proceed with the current scoped node.
```

## Useful Scripts

Run `scripts/repo-scan.mjs <repo-root>` for a filesystem-oriented scan. Its `possiblyUncoveredFunctions` list is a work queue: do not declare full conversion complete while `possiblyUncoveredFunctionCount` is nonzero for repo-owned functions.

Run `scripts/repo-scan.mjs --fail-on-uncovered <repo-root>` as the goal check. A nonzero exit means conversion is not done.

The scanner is conservative. If it reports generated/vendor/test-helper functions that should not become DAG nodes, document the exclusion explicitly in the conversion plan or DAG notes rather than ignoring them silently.

## Finish With

Report:

- Added or changed DAG files.
- Node contracts created.
- Shells separated from pure logic.
- Public interfaces changed, if any.
- Verification commands run and results.
- Scanner result: total named functions, uncovered functions, and documented exclusions.
- Remaining candidate nodes. For full conversion, this must be empty or blocked with a concrete reason.
