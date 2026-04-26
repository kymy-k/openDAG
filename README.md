# openDAG

`openDAG` is a Codex skill for contract-first functional DAG coding work.

Use it when you want Codex to structure implementation around explicit node contracts, pure deterministic functions, zero-trust subagent boundaries, and verification before finishing.

## Install

Install this repository directly as a Codex skill:

```bash
mkdir -p ~/.codex/skills
git clone https://github.com/kymy-k/openDAG.git ~/.codex/skills/opendag
```

For local development, symlink the repo instead:

```bash
mkdir -p ~/.codex/skills
ln -s /path/to/openDAG ~/.codex/skills/opendag
```

Start a new Codex session after installing so the skill is discovered.

## Layout

```text
SKILL.md
agent/
  functional-dag-agent.md
  scripts/
  templates/
repo-converter/
  functional-dag-repo-converter.md
  scripts/
  templates/
```

[SKILL.md](SKILL.md) is the skill entrypoint. The `agent/` folder contains the master/subagent implementation workflow. The `repo-converter/` folder contains the workflow and scanner for converting existing repositories toward openDAG.

## Workflows

The agent workflow is for normal coding tasks:

- Read local instructions and DAG files before editing.
- Define contracts and tests before implementation.
- Keep deterministic logic in pure functions.
- Keep filesystem, network, database, clock, randomness, and process effects at shell boundaries.
- Give each subagent exactly one node and one editable file.
- Verify file scope, node behavior, DAG validity, docs, and full project checks when the target repo supports them.

The repo-converter workflow is for retrofitting an existing codebase:

- Scan the requested scope for repo-owned named functions.
- Add DAG entries for every in-scope function.
- Classify deterministic units as pure/helper/orphan and effect boundaries as imperative.
- Add contracts, tests, generated docs, and verification.
- Continue until the requested scope is converted or every remaining item has a concrete blocker or exclusion.

## Bundled Scripts

Run the lightweight DAG checker:

```bash
node agent/scripts/check-dag-json.mjs /path/to/repo/specs/dag.json
```

Scaffold a TypeScript/Zod node:

```bash
node agent/scripts/scaffold-ts-zod-node.mjs normalizeText /path/to/repo/src/nodes/normalizeText
```

Scan a repo during conversion:

```bash
node repo-converter/scripts/repo-scan.mjs --fail-on-uncovered --fail-on-missing-tests /path/to/repo
```

For a scoped conversion:

```bash
node repo-converter/scripts/repo-scan.mjs --fail-on-uncovered --fail-on-missing-tests /path/to/repo --scope src/payments
```
