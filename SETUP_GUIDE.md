# Setup Guide

This guide shows how to use the `opendag` skill in another repository.

## Use The Skill

Install the skill:

```bash
npx @themifaso/opendag
```

That installs to `~/.skills/opendag` by default. Use `--target <skills-dir>` for another agent runtime, or `--codex` for Codex.

Then start a new agent session and ask for the workflow directly:

```text
Use opendag to implement this feature with contract-first DAG nodes.
```

For conversion work:

```text
Use opendag to convert this repo incrementally to a pure functional DAG contract workflow.
```

## Add Minimal openDAG Files To A Target Repo

For repositories that want enforceable DAG tracking, start with:

```text
AGENTS.md
specs/
  user_spec.md
  dag.json
contracts/
  contractTypes.ts
```

Use the target repo's native schema and test tools. TypeScript projects can use Zod; Python projects can use Pydantic, dataclasses plus validators, or existing local conventions.

## Conversion Order

1. Identify one useful pure or mostly-pure workflow.
2. Write the DAG entry and contract.
3. Add tests from the contract and invariants.
4. Move deterministic logic into a pure node.
5. Keep side effects in a thin shell.
6. Verify that node.
7. Repeat for adjacent nodes.

## Scanner

The repo-converter workflow includes a scanner:

```bash
node repo-converter/scripts/repo-scan.mjs --fail-on-uncovered --fail-on-missing-tests /path/to/repo
```

Use `--scope <path>` for an incremental slice:

```bash
node repo-converter/scripts/repo-scan.mjs --fail-on-uncovered --fail-on-missing-tests /path/to/repo --scope src/payments
```

## Visualisation

Generate a standalone DAG visualisation graph:

```bash
node agent/scripts/visualise-dag.mjs /path/to/repo/specs/dag.json --output /path/to/repo/.openDAG/dag-visualisation.html
```

Add `--open` to open the generated HTML file after writing it.
