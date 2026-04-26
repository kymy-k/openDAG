# openDAG

`openDAG` is an MVP TypeScript framework for forcing coding-agent work through a functional, DAG-based, contract-first workflow.

The workflow is:

```text
user_spec.md -> dag.json -> contracts -> tests -> implementation -> generated docs -> verification
```

Each DAG node is a typed function or tracked workflow artifact with explicit input/output schemas, invariants, dependencies, tests or verification, kind classification, and allowed file boundaries. The imperative CLI wraps the pure functional core and is responsible for filesystem/process side effects.

The agent model is master/subagent by default. The master agent owns DAG decomposition, contracts, public I/O, architecture, node assignment, patch review, and full verification. Node subagents are zero-trust implementers: each subagent gets exactly one node and may only modify that node's `allowedFiles`.

The DAG is intentionally function-level. Every named function in repository-owned source, tools, templates, and skill scripts should appear in `specs/dag.json`, even if it is a helper, orphan, template, skill helper, or imperative shell function.

The generated node catalog is [specs/node_catalog.md](specs/node_catalog.md). It is generated from `specs/dag.json` and records what every node does, what input it expects, and what output it gives. Do not edit it by hand.

## Install

Use Node.js 18 or newer. This repo includes `.nvmrc` for Node 23.7.0.

```bash
nvm use
npm install
```

After the package is published, you can also install the CLI package from npm:

```bash
npm install -D @themifaso/opendag
npx opendag-validate-dag
npx opendag-visualise
```

## Commands

```bash
npm run validate:dag
npm run generate:docs
npm run check:docs
npm run visualise
npm run create:node -- extractFacts
npm run verify:node -- normalizeText
npm run verify:all
```

## Setup In Another Project

Use [SETUP_GUIDE.md](SETUP_GUIDE.md) to adapt this workflow to an existing codebase. The short version:

1. Add `specs/user_spec.md` and `specs/dag.json`.
2. Add shared contract types for your stack.
3. Define one or two pure DAG nodes around real code.
4. Write contracts and tests before implementation.
5. Keep CLIs, servers, databases, filesystems, clocks, and networks outside the pure nodes.
6. Add verification commands for DAG validation, node tests, typecheck, and full verification.

## Node Shape

Each node exposes:

- `kind` as `pure`, `imperative`, `helper`, `orphan`, `template`, or `skill`
- `InputSchema` as a Zod schema
- `OutputSchema` as a Zod schema
- `Input` and `Output` TypeScript types
- `metadata` with id, purpose, dependencies, and invariants
- `run(input: Input): Output`

Nodes should be pure and deterministic. Side effects belong in tools or shell code around the DAG, not inside node implementations.

Imperative and non-core functions still belong in the DAG. Mark them with the correct `kind` so validation and visualisation can show that they are shell or support code rather than pure DAG core.

Each DAG entry must have clear documentation fields:

- `purpose`: what the node does
- `inputSchema`: what input the node expects
- `outputSchema`: what output the node gives

After changing `specs/dag.json`, run:

```bash
npm run generate:docs
```

`npm run verify:all` runs the generated-docs freshness check, so stale node documentation fails verification.

## Current DAG Nodes

- Pure core functions such as `validateDag`, `planNodeScaffold`, `planNodeVerification`, `buildDagVisualisationModel`, `renderDagVisualisationHtml`, and `normalizeText`.
- Helper functions such as `validateDag.validateAllowedFiles` and `buildDagVisualisationModel.depthForNode`.
- Imperative shell functions such as `tools.validateDag.readDag` and `tools.verifyNode.runCommand`.
- Template/client functions such as `visualClient.renderGraph`.
- Skill artifacts such as `skill.functionalDagAgentSkill` and `skill.functionalDagRepoConverterSkill`.

The CLI scripts in `tools/` should stay thin. Put deterministic decisions in DAG nodes and keep filesystem, process execution, and other side effects at the shell boundary.

## Agent Workflow

For a new feature, the master agent:

1. Reads `specs/dag.json`.
2. Updates the DAG, contracts, I/O, dependencies, and tests.
3. Creates one node assignment per implementation unit.
4. Gives each subagent only the assigned node contract, dependencies, exact `allowedFiles`, and verification command.
5. Rejects any subagent patch that edits outside the assignment.
6. Regenerates docs and runs full verification.

If no subagent runtime is available, the master still uses the same assignment boundaries while implementing locally.

## Visualisation

Generate and open an interactive DAG page:

```bash
npm run visualise
```

The command writes `.openDAG/dag-visualisation.html`. Use search, status filtering, and node selection to inspect kind, dependencies, dependents, invariants, schemas, and allowed files. Imperative, helper, template, and skill nodes have distinct visual styling.

To skip opening the file automatically:

```bash
npm run visualise -- --no-open
```

## Skills

This repo includes two reusable Codex skills:

- [functional-dag-agent-skill](functional-dag-agent-skill/SKILL.md): use this workflow while implementing DAG-based tasks.
- [functional-dag-repo-converter-skill](functional-dag-repo-converter-skill/SKILL.md): convert an existing repo toward the pure functional contract-based paradigm.

The converter skill includes a scanner goal check:

```bash
node functional-dag-repo-converter-skill/scripts/repo-scan.mjs --fail-on-uncovered /path/to/repo
```

For a full conversion, that command should pass before the agent declares the conversion complete, unless every remaining generated/vendor exclusion is documented.

To install either skill for Codex discovery:

```bash
mkdir -p ~/.codex/skills
cp -R functional-dag-agent-skill ~/.codex/skills/
cp -R functional-dag-repo-converter-skill ~/.codex/skills/
```
