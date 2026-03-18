## Why

There is no dedicated UI for interacting with the outboard-brain. Today, thoughts can only be captured and queried through AI assistants (Claude, etc.) or Slack. An iPad app in landscape mode would provide a purpose-built interface for quickly capturing thoughts, searching by meaning, and browsing results — making the brain accessible without needing an AI conversation.

## What Changes

- New Expo React Native app targeting iPad in landscape orientation
- Touch-optimized UI for capturing thoughts (text input with optional type/topic overrides)
- Semantic search interface that queries thoughts by meaning and displays ranked results
- Browse/list view with filtering by type, topic, person, and time range
- Stats dashboard showing thought totals, top topics, and top people
- Communicates with the existing outboard-brain MCP server over HTTP (StreamableHTTPTransport)

## Capabilities

### New Capabilities
- `thought-capture`: UI and logic for composing and submitting new thoughts to the MCP server
- `thought-search`: Semantic search interface — query input, results list with similarity scores
- `thought-browse`: List/filter thoughts by type, topic, person, and recency
- `thought-stats`: Dashboard showing aggregate stats from the brain
- `mcp-transport`: HTTP client layer that speaks MCP protocol to the Supabase edge function

### Modified Capabilities
_(none — this is a new standalone app)_

## Impact

- **New codebase**: Expo React Native project (separate from the existing Supabase backend)
- **Dependencies**: Expo SDK, React Native, `@modelcontextprotocol/sdk` (client), React Navigation
- **API**: Consumes the existing `open-brain-mcp` Supabase edge function — no backend changes needed
- **Auth**: Requires `x-brain-key` header for MCP server access — app will need secure key storage
- **Platform**: iPad-only (landscape), iOS deployment via Expo
