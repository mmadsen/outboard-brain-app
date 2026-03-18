## ADDED Requirements

### Requirement: MCP client sends JSON-RPC requests over HTTP
The app SHALL send MCP tool calls as JSON-RPC 2.0 POST requests to the configured Supabase edge function URL. Each request SHALL include the `x-brain-key` header for authentication.

#### Scenario: Successful tool call
- **WHEN** the app invokes an MCP tool (e.g., `search_thoughts`) with valid parameters
- **THEN** the client sends a POST request with JSON-RPC payload `{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "<tool>", "arguments": {...}}, "id": <n>}` and returns the parsed result

#### Scenario: Authentication failure
- **WHEN** the API key is missing or invalid
- **THEN** the client SHALL return a clear error indicating authentication failed and prompt the user to check their API key in settings

#### Scenario: Network error
- **WHEN** the device has no network connectivity or the server is unreachable
- **THEN** the client SHALL return a descriptive error without crashing, and the UI SHALL display an appropriate offline/error state

### Requirement: API key stored securely on device
The app SHALL store the MCP server API key using expo-secure-store (iOS Keychain). The key SHALL never be logged, included in error reports, or stored in plain text.

#### Scenario: First launch without key
- **WHEN** the user opens the app for the first time and no API key is stored
- **THEN** the app SHALL present a setup screen asking the user to enter their API key before accessing any features

#### Scenario: Key update
- **WHEN** the user navigates to settings and enters a new API key
- **THEN** the app SHALL save the new key to secure storage and use it for all subsequent requests

### Requirement: Base URL is configurable
The app SHALL allow the MCP server base URL to be configured in settings, defaulting to the production Supabase edge function URL.

#### Scenario: Custom server URL
- **WHEN** the user sets a custom base URL in settings
- **THEN** all MCP requests SHALL be sent to the custom URL instead of the default
