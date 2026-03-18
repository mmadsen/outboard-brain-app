## Context

The app currently calls an MCP server (Supabase edge function) via JSON-RPC 2.0. All tool responses come back as human-readable text strings. A V2 server (`outboard-brain-mcp-v2`) is available that accepts a `format: "json"` argument on every tool call and returns structured JSON instead of prose.

`lib/mcp-tools.ts` already defines typed `Thought` and `ThoughtStats` interfaces annotated with `AIDEV-NOTE: oba-ra4` — these were written in anticipation of this change. The Browse and Search screens likewise carry `AIDEV-NOTE` markers pointing to this refactor.

Current default server URL:
```
https://fgsuhmrdlejsophbumxh.supabase.co/functions/v1/open-brain-mcp
```

V2 server URL (to be confirmed before implementation):
```
https://fgsuhmrdlejsophbumxh.supabase.co/functions/v1/open-brain-mcp-v2
```

## Goals / Non-Goals

**Goals:**
- Switch the default server URL constant to point at the V2 endpoint
- Pass `format: "json"` in every `callTool` argument map
- Update `mcp-tools.ts` wrappers to return typed values (`Thought[]`, `ThoughtStats`, etc.) instead of `string`
- Render structured thought cards on the Browse screen
- Render structured search result cards (with similarity score) on the Search screen
- Preserve existing filter/search UX — only the data layer and card rendering change

**Non-Goals:**
- Redesigning the Capture or Stats screens (they remain text-based for now)
- Adding new filter capabilities beyond what is already implemented
- Migrating user-saved custom server URLs (existing overrides keep working as-is)

## Decisions

### 1. Add `format: "json"` at the tool-wrapper level, not the client level

Options considered:
- **A. Add at `callTool` (client layer)** — automatic for all calls, but the client doesn't know which tools support JSON mode.
- **B. Add at each tool wrapper in `mcp-tools.ts`** — explicit, easy to audit per-tool, and avoids breaking any future tool that doesn't support the flag.

**Decision: B.** Each wrapper in `mcp-tools.ts` adds `args.format = 'json'` before calling `callTool`. This is the minimum-change approach and keeps the client transport layer unchanged.

### 2. Change wrapper return types to typed interfaces

The `Thought` and `ThoughtStats` interfaces already exist in `mcp-tools.ts` (oba-ra4 stubs). Wrappers that return lists change from `Promise<string>` to `Promise<Thought[]>`; `getThoughtStats` changes to `Promise<ThoughtStats>`; `captureThought` and `updateThought` change to `Promise<Thought>` (single object); `deleteThought` stays `Promise<string>` (confirmation message).

### 3. Update Browse and Search screens to render thought cards

Both screens currently store `result: string` and render it in a `<ScrollView>` of raw text. After this change they store `result: Thought[]` and render a list of card components. A minimal `ThoughtCard` component will show: content (body), type chip, topic tags, and timestamp. The Search screen adds a similarity percentage badge.

### 4. Default URL change only — no forced migration

Existing users who have set a custom server URL (stored in Keychain) are unaffected. The default URL constant in `api-key-store.ts` is the only change needed for new installs or users who have never overridden it. Users on the old URL will continue to get text responses; the UI will fall back gracefully (see Risks).

## Risks / Trade-offs

- **V2 URL not yet confirmed** → Verify the exact Supabase function path before changing the constant. Mitigation: confirm with the server team / check the Supabase dashboard before implementing.
- **JSON parse failure on unexpected response** → If V2 returns an error in text format, `JSON.parse` throws. Mitigation: wrap JSON.parse in try/catch in each tool wrapper; on parse failure, surface a user-facing "Unexpected server response" error using `McpError`.
- **Users on old custom URL** → After the default changes, users who manually saved the V1 URL continue using V1. They'll get raw text where the UI now expects JSON, causing empty/broken cards. Mitigation: document in release notes; consider a migration banner in Settings if this becomes an issue.
- **`ThoughtCard` complexity** → Keeping the card simple (text + chips) avoids scope creep. Detailed edit/delete actions are a separate change.

## Migration Plan

1. Confirm V2 server URL.
2. Update `DEFAULT_BASE_URL` in `api-key-store.ts`.
3. Add `format: 'json'` to each tool wrapper in `mcp-tools.ts` and update return types.
4. Implement `ThoughtCard` component.
5. Refactor Browse screen to use `Thought[]` state and render `ThoughtCard` list.
6. Refactor Search screen to use `Thought[]` state and render `ThoughtCard` list with similarity badge.
7. Manual test on device against V2 server.
8. No rollback needed — change is isolated to client code; reverting a single commit restores V1 behaviour.

## Open Questions

- What is the exact V2 Supabase function path? (Assumed `open-brain-mcp-v2` — confirm before implementing.)
- Does `capture_thought` with `format: "json"` return a single `Thought` object, or a confirmation wrapper? Confirm the V2 response schema for write operations.
- Should `deleteThought` also pass `format: "json"`? It may only return a status string regardless of format.
