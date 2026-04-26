# openDAG

`openDAG` is an agent skill for contract-first functional DAG coding work.

Use it when you want an agent to structure implementation around explicit node contracts, pure deterministic functions, zero-trust subagent boundaries, and verification before finishing.

## Install

Install from npm:

```bash
npx @themifaso/opendag --claude
```

or:

```bash
npx @themifaso/opendag --codex
```

`--claude` installs to `~/.claude/skills/opendag`, or `$CLAUDE_HOME/skills/opendag` when `CLAUDE_HOME` is set.

`--codex` installs to `~/.codex/skills/opendag`, or `$CODEX_HOME/skills/opendag` when `CODEX_HOME` is set.

You can override the skills directory for another runtime:

```bash
npx @themifaso/opendag --target ~/.agent/skills
```

You can also install this repository directly as an agent skill:

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/kymy-k/openDAG.git ~/.claude/skills/opendag
```

For local development, symlink the repo instead:

```bash
mkdir -p ~/.codex/skills
ln -s /path/to/openDAG ~/.codex/skills/opendag
```

Start a new agent session after installing so the skill is discovered.

The npm package only provides the installer. It does not include any other CLI commands.

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

Generate a standalone DAG visualisation graph:

```bash
node agent/scripts/visualise-dag.mjs /path/to/repo/specs/dag.json --output /path/to/repo/.openDAG/dag-visualisation.html
```

Add `--open` to open the generated HTML file after writing it.

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
