# Node Subagent Assignment

Role: node subagent

Assigned node:

Goal: implement or test only this node in the single editable file.

## Contract

Input:

Output:

Dependencies:

Invariants:

## Editable File

- TODO

## Read-Only Context Files

- TODO

## Forbidden Edits

- Do not edit any file except the one file listed under Editable File.
- You may read other files for context, including the files listed under Read-Only Context Files, but they are not write targets.
- Do not edit `specs/dag.json`, shared contracts, public I/O, package scripts, verification tools, architecture, or other nodes unless that exact file is the Editable File and the master explicitly approves it.
- Do not weaken tests.
- Do not add hidden filesystem, network, database, clock, randomness, environment, cache, or global-state effects inside pure nodes.

## If Blocked

Write a proposed DAG/contract change for the master. Do not apply it.

## Verification

Run:

```bash
npm run verify:file-scope -- TODO
TODO
```

## Return

- Changed files:
- Behavior summary:
- Verification results:
- Proposed changes:
