# AGENTS.md

This repository is now a Codex skill repository. The root `SKILL.md` is the skill entrypoint.

## Editing Rules

- Keep the repository installable as a skill directly from its root.
- Do not reintroduce npm package or TypeScript framework files unless explicitly requested.
- Keep `SKILL.md` concise and route detailed workflow instructions to files under `agent/` and `repo-converter/`.
- Keep helper scripts self-contained and runnable with `node`.
- Update `README.md` when installation or file layout changes.

## Skill Layout

```text
SKILL.md
agent/
repo-converter/
README.md
SETUP_GUIDE.md
LICENSE
```

The `agent/` workflow covers contract-first coding and file-scoped subagent assignments. The `repo-converter/` workflow covers incremental conversion of existing repositories into openDAG-style contracts and pure nodes.
