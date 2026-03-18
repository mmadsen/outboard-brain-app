## Why

The outboard-brain MCP server has a V2 version (`outboard-brain-mcp-v2`) that returns structured JSON output, whereas the current V1 server returns unstructured text. Structured JSON responses enable richer, more precise UI rendering on the Browse and Search screens.

## What Changes

- Switch the default MCP server from `outboard-brain` to `outboard-brain-v2`
- Add `format: "json"` parameter to all MCP tool calls (capture, search, list, update, delete, stats)
- Update Browse screen to parse and render structured JSON thought data
- Update Search screen to parse and render structured JSON search results

## Capabilities

### New Capabilities

- `mcp-v2-json-queries`: All MCP tool calls use the V2 server with JSON output format, returning structured thought data instead of plain text

### Modified Capabilities

<!-- No existing spec-level requirement changes -->

## Impact

- MCP server dependency: `outboard-brain` → `outboard-brain-v2`
- All MCP tool call sites in the app must pass `format: "json"` and handle parsed JSON responses
- Browse screen: response parsing and rendering logic updated for structured data
- Search screen: response parsing and rendering logic updated for structured data
- No API contract changes visible to end users — behavior improves, not changes
