# tests/<node-id>.test.<ext>

Create one separate test file for each DAG node. Put it under `tests/`, not beside the implementation.

Derive tests from the node contract:

- Purpose: assert the observable behavior the node is supposed to provide.
- Input schema: include valid inputs and invalid/boundary inputs.
- Output schema: assert returned shape, important values, and parse/validation behavior.
- Invariants: one test per invariant where feasible.
- Dependencies: use fakes or fixtures; do not call unrelated real services.

Pure/helper/orphan node tests should call the function directly and verify deterministic behavior. Re-run the same input twice when useful.

Imperative node tests should isolate the side effect boundary with fakes/mocks and assert that the shell passes plain data into pure nodes. Do not hit real filesystem, network, database, time, or randomness unless the node contract explicitly declares that boundary and the test uses a controlled fixture.

Minimum cases:

1. Happy path from the spec.
2. Boundary or empty input.
3. Invalid input/schema rejection.
4. Each invariant that can be checked locally.
5. Dependency interaction, if the node depends on another node.
