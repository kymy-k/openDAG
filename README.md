# openDAG

`openDAG` is an MVP TypeScript framework for forcing coding-agent work through a functional, DAG-based, contract-first workflow.

The workflow is:

```text
user_spec.md -> dag.json -> contracts -> tests -> implementation -> generated docs -> verification
```

Each DAG node is a typed function or tracked workflow artifact with explicit input/output schemas, invariants, dependencies, tests or verification, kind classification, and allowed file boundaries. The imperative CLI wraps the pure functional core and is responsible for filesystem/process side effects.

The agent model is master/subagent by default. The master agent owns DAG decomposition, contracts, public I/O, architecture, node assignment, patch review, and full verification. Node subagents are zero-trust implementers: each spawned subagent gets exactly one node and exactly one editable file selected from that node's `allowedFiles`. It may read other files for context, but it may only edit that one file's contents.

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
npx opendag-install-skills
npx opendag-validate-dag
npx opendag-visualise
```

`npm install` makes the openDAG CLI available to the project. `npx opendag-install-skills` copies the bundled `opendag` Codex skill into `~/.codex/skills` or `$CODEX_HOME/skills`; start a new Codex session after running it.

## Commands

```bash
npm run validate:dag
npm run generate:docs
npm run check:docs
npm run visualise
npm run create:node -- extractFacts
npm run verify:file-scope -- src/nodes/extractFacts/implementation.ts
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
- Skill artifacts such as `skill.opendag`, `skill.opendagAgentWorkflow`, and `skill.opendagRepoConverterWorkflow`.

The CLI scripts in `tools/` should stay thin. Put deterministic decisions in DAG nodes and keep filesystem, process execution, and other side effects at the shell boundary.

## Agent Workflow

For a new feature, the master agent:

1. Reads `specs/dag.json`.
2. Updates the DAG, contracts, I/O, dependencies, and tests.
3. Creates one file-scoped assignment per implementation unit.
4. Gives each subagent only the assigned node contract, dependencies, one editable file, read-only context files, and verification commands.
5. Rejects any subagent patch that edits outside the one editable file, using `npm run verify:file-scope -- <editableFile>`.
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

This repo includes one reusable Codex skill:

- [opendag](opendag/SKILL.md): use the contract-first implementation workflow and the repo-converter workflow from one installable skill.

The skill includes detailed internal references:

- [agent workflow](opendag/agent/functional-dag-agent.md): use this workflow while implementing DAG-based tasks.
- [repo-converter workflow](opendag/repo-converter/functional-dag-repo-converter.md): convert an existing repo toward the pure functional contract-first paradigm.

The converter skill includes a scanner goal check:

```bash
node opendag/repo-converter/scripts/repo-scan.mjs --fail-on-uncovered --fail-on-missing-tests /path/to/repo
```

For a full conversion, that command should pass before the agent declares the conversion complete, unless every remaining generated/vendor exclusion is documented.
For a scoped conversion, pass one or more `--scope` paths and treat completion as limited to those paths:

```bash
node opendag/repo-converter/scripts/repo-scan.mjs --fail-on-uncovered --fail-on-missing-tests /path/to/repo --scope src/payments
```

After installing `@themifaso/opendag`, install the bundled Codex skill into Codex's skill discovery folder:

```bash
npx opendag-install-skills
```

Start a new Codex session after running the installer. npm makes the CLI available, but Codex only discovers skills from its skills directory.
