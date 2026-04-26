# AGENTS.md

This repository is an agent skill repository. The root `SKILL.md` is the skill entrypoint.

## Editing Rules

- Keep the repository installable as a skill directly from its root.
- The npm package surface may exist only as an installer for the agent skill.
- Do not reintroduce TypeScript framework files, DAG implementation code, or extra npm commands unless explicitly requested.
- Keep `SKILL.md` concise and route detailed workflow instructions to files under `agent/` and `repo-converter/`.
- Keep helper scripts self-contained and runnable with `node`.
- Update `README.md` when installation or file layout changes.

## Skill Layout

```text
SKILL.md
agent/
repo-converter/
bin/install-skill.mjs
package.json
README.md
SETUP_GUIDE.md
LICENSE
```

The `agent/` workflow covers contract-first coding and file-scoped subagent assignments. The `repo-converter/` workflow covers incremental conversion of existing repositories into openDAG-style contracts and pure nodes.

The npm package exposes one binary, `opendag`, whose only job is to copy this skill into a target skills directory.
