import { InputSchema, OutputSchema, type Input, type Output } from "./contract.js";

function normalizeRepoPath(filePath: string): string | null {
  const normalized = filePath.replaceAll("\\", "/").split("/").filter(Boolean).join("/");

  if (
    filePath.startsWith("/") ||
    /^[A-Za-z]:\//u.test(filePath) ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized === ".." ||
    normalized.length === 0
  ) {
    return null;
  }

  return normalized;
}

export function run(input: Input): Output {
  const parsedInput = InputSchema.parse(input);
  const editableFile = normalizeRepoPath(parsedInput.editableFile);

  if (!editableFile) {
    return OutputSchema.parse({
      ok: false,
      errors: [`editableFile "${parsedInput.editableFile}" must be a relative path inside the repo`]
    });
  }

  const errors: string[] = [];
  const changedFiles = [...new Set(parsedInput.changedFiles.map((file) => normalizeRepoPath(file)))];

  for (const changedFile of changedFiles) {
    if (!changedFile) {
      errors.push("changedFiles must contain only relative paths inside the repo");
      continue;
    }

    if (changedFile !== editableFile) {
      errors.push(
        `file-scoped subagent may edit only "${editableFile}", but changed "${changedFile}"`
      );
    }
  }

  return OutputSchema.parse({
    ok: errors.length === 0,
    errors,
    editableFile,
    changedFiles: changedFiles.filter((file): file is string => file !== null)
  });
}
