---
name: functional-dag-repo-converter-skill
description: Convert existing repositories incrementally into a pure functional, contract-first DAG workflow. Use when Codex is asked to retrofit an app, library, CLI, service, or mixed codebase into explicit typed nodes with schemas/contracts, invariants, tests, allowed edit scopes, DAG metadata, verification commands, and zero-trust agent boundaries. Works across languages and should preserve existing architecture while moving deterministic logic into pure nodes and side effects into shells.
---

# Functional DAG Repo Converter

Use this skill to convert an existing repo toward a pure functional, contract-first DAG paradigm without a risky rewrite.

## First Pass

1. Read local instructions: `AGENTS.md`, `README`, `CONTRIBUTING`, package files, test config, and existing architecture docs.
2. Inspect the repo shape and identify language, framework, test runner, typecheck command, and side-effect boundaries.
3. Locate deterministic business logic that can become pure nodes.
4. Locate shells: CLIs, HTTP handlers, jobs, database adapters, filesystem/network/time/randomness code.
5. Preserve existing public interfaces unless the user explicitly asks to change them.

If the repo already has `specs/dag.json` or equivalent DAG files, follow the local format.

## Conversion Strategy

Convert incrementally:

1. Add minimal workflow files if absent: `AGENTS.md`, `specs/user_spec.md`, `specs/dag.json`, and a contracts module appropriate for the stack.
2. Select one narrow workflow with low blast radius.
3. Define DAG node contracts before implementation changes.
4. Add tests for the contract and invariants.
5. Move deterministic logic into pure node functions.
6. Leave side effects in existing shell code and pass plain data into nodes.
7. Add or update verification commands.
8. Run verification and report what remains imperative.

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

Run `scripts/repo-scan.mjs <repo-root>` for a quick filesystem-oriented scan. Treat its output as a starting point, not authority.

## Finish With

Report:

- Added or changed DAG files.
- Node contracts created.
- Shells separated from pure logic.
- Public interfaces changed, if any.
- Verification commands run and results.
- Remaining candidate nodes.
