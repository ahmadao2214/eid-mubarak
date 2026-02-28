Implement the plan described in: $ARGUMENTS

## Rules

- Implement ALL tasks and phases end-to-end. Do not stop until every task and phase is completed.
- When you finish a task or phase, mark it as completed in the plan document (e.g. add a checkmark ✅ or strikethrough).
- Do not add unnecessary comments, jsdocs, or documentation to the code you write.
- Do not use `any` or `unknown` types — use proper, specific types everywhere.
- After each significant change, run the project's typecheck command (e.g. `npx tsc --noEmit` or the equivalent configured in package.json) and fix any type errors before moving on.
- If a typecheck or test fails, fix it immediately before continuing to the next task.
- Follow existing code style, patterns, and conventions in the project.
- Prefer editing existing files over creating new ones unless the plan explicitly requires new files.
- Keep implementations minimal and focused — do exactly what the plan says, nothing more.
- Run tests after implementing each testable piece to catch regressions early.
- If the plan specifies a test-driven approach, write tests first, then implement.
- Use the project's existing dependencies and utilities — don't introduce new ones unless the plan requires it.
