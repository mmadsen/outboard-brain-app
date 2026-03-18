# CLAUDE.md

## Golden Rule
When unsure about implementation details, stop and ask the developer.

## Hard Rules — Never Violate These
- Never modify test files after they are written — tests encode developer intent
- Never change API contracts (signatures, names, paths with `api` or `openapi` in them) without explicit permission
- Never alter migration files
- Never commit secrets — use environment variables or Secrets Manager
- Never remove `AIDEV-*` anchor comments
- Never touch code marked `SECURITY CRITICAL - HUMAN ONLY`

## Issue Tracking

This project uses **bd (beads)** for issue tracking.
Run `bd prime` for workflow context, or install hooks (`bd hooks install`) for auto-injection.

**Quick reference:**
- `bd ready` - Find unblocked work
- `bd create "Title" --type task --priority 2` - Create issue
- `bd close <id>` - Complete work
- `bd dolt push` - Push beads to remote

For full workflow details: `bd prime`

## Testing
- Use Red/Green test-driven development: write failing tests first, then implement to pass
- You MAY write or suggest tests when asked by the developer

## Anchor Comments
Add `AIDEV-NOTE:`, `AIDEV-TODO:`, or `AIDEV-QUESTION:` comments to code that is complex, important, confusing, or potentially buggy. Before modifying files, grep for existing `AIDEV-*` anchors in the relevant directories. Update anchors when modifying associated code. Never remove anchors without explicit instruction.

## Coding Standards
- Simplicity and readability over cleverness
- Start minimal, verify it works, then iterate
- Descriptive names for variables, functions, and classes
- Consistent style (indentation, naming, patterns) throughout the codebase
- Organize files appropriate to project size — don't over-structure small projects
- Semantic versioning in a dedicated version file; only bump when asked or preparing a release
- Bug fixes: verify the fix end-to-end (run tests or the application) before marking complete

## Data Handling
Never double-convert timezones. Check whether a timestamp already has `tzinfo` before applying timezone conversion.

## Language-Specific Guidelines
See `guidelines-python.md` (and other `guidelines-*.md` files) for language-specific conventions.
