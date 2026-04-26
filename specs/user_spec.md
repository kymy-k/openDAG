# User Spec

Build a TypeScript framework that converts a software task into a typed functional DAG. Each node is implemented as a pure function with explicit schemas, invariants, tests, and verification.

The MVP includes a pure functional core for DAG validation, node scaffold planning, node verification planning, DAG visualisation model building, HTML visualisation rendering, and the example `normalizeText` node. CLI tools are imperative shells around that pure core: they may read files, write files, open generated files, and run processes, but pure DAG nodes must remain deterministic and side-effect free.

The DAG is function-level. Every named function in repository-owned source, tool, template, and skill code must be represented in `specs/dag.json`. Non-pure entries must be classified with `kind`: `imperative`, `helper`, `orphan`, `template`, or `skill`.

Subagent delegation is file-scoped. A master agent may let a subagent read any relevant context, but each spawned subagent must receive exactly one editable file and is only allowed to modify that file's contents. The verification workflow must include a file-scope check that rejects patches touching any other file.
