## Context

The outboard-brain is a Supabase-hosted MCP server (`open-brain-mcp`) that stores and retrieves "thoughts" using PostgreSQL + pgvector for semantic search. It exposes tools via StreamableHTTPTransport over HTTP, authenticated with an `x-brain-key` header. Currently the only interfaces are AI assistants and a Slack integration. There is no dedicated UI.

The goal is a standalone Expo React Native app optimized for iPad landscape that provides direct access to capture, search, browse, and view stats.

## Goals / Non-Goals

**Goals:**
- Provide a fast, touch-friendly iPad interface for the outboard-brain
- Support all core MCP tools: capture_thought, search_thoughts, list_thoughts, thought_stats, update_thought, delete_thought
- Landscape-only layout that uses the wide screen effectively (e.g., sidebar + detail)
- Secure storage of the MCP server API key on-device

**Non-Goals:**
- iPhone or Android support (iPad-only for now)
- Offline mode or local caching of thoughts
- Push notifications
- User authentication beyond the existing API key
- Modifying the MCP server or Supabase backend

## Decisions

### 1. Expo with expo-router for navigation
**Choice:** Expo SDK 53+ with file-based routing via expo-router.
**Rationale:** Expo provides the fastest path to an iPad app with managed builds. expo-router is the standard navigation approach and supports tab-based layouts well.
**Alternative considered:** Bare React Native — rejected because Expo's managed workflow is simpler and sufficient for this app.

### 2. Direct HTTP calls to MCP server (not MCP SDK client)
**Choice:** Use fetch/axios to POST JSON-RPC requests directly to the MCP endpoint.
**Rationale:** The MCP TypeScript SDK client is designed for Node.js environments and has dependencies (like stdio transports) that don't work cleanly in React Native. The StreamableHTTPTransport is just HTTP POST with JSON-RPC payloads — a thin wrapper around fetch is simpler and more reliable on mobile.
**Alternative considered:** `@modelcontextprotocol/sdk` client — rejected due to React Native compatibility concerns and unnecessary complexity for a straightforward HTTP API.

### 3. Tab-based layout with four sections
**Choice:** Bottom tab navigator with four tabs: Capture, Search, Browse, Stats.
**Rationale:** Maps directly to the four core capabilities. Tabs are natural on iPad and provide single-tap access to each function. Landscape mode gives ample horizontal space for content within each tab.
**Alternative considered:** Sidebar navigation — viable but heavier for only four sections; tabs are more familiar on iOS.

### 4. expo-secure-store for API key
**Choice:** Store the `x-brain-key` value in expo-secure-store, prompted on first launch.
**Rationale:** Uses iOS Keychain under the hood — secure and standard. Simple settings screen to update the key.
**Alternative considered:** Hardcoded key — rejected for security reasons. Environment variables — not practical for a mobile app.

### 5. Minimal styling with React Native core components
**Choice:** Use React Native's built-in StyleSheet with a simple custom theme (colors, spacing, typography). No heavy UI library.
**Rationale:** The app is small (4 screens). A UI library like NativeBase or Tamagui would add weight without proportional benefit. Custom styles keep the bundle small and give full control over the landscape layout.

## Risks / Trade-offs

- **MCP protocol changes** → The app uses raw JSON-RPC to the MCP server. If the MCP SDK changes wire format, the app's transport layer needs updating. Mitigation: the transport layer is isolated in a single module, easy to update.
- **API key security** → A single shared key grants full access. Mitigation: expo-secure-store uses iOS Keychain; the key never leaves the device. Future: could add per-device keys on the server side.
- **No offline support** → The app is useless without network. Mitigation: acceptable for v1; the brain is inherently a cloud service. Show clear error states when offline.
- **iPad-only constraint** → Limits audience. Mitigation: intentional scope control for v1. The layout can be adapted to iPhone later with responsive breakpoints.
