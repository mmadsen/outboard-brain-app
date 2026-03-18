## ADDED Requirements

### Requirement: All MCP tool calls include format json parameter
Every call to the V2 MCP server SHALL include `format: "json"` in the tool arguments.

#### Scenario: list_thoughts called with json format
- **WHEN** the Browse screen requests a list of thoughts
- **THEN** the `list_thoughts` tool is called with `format: "json"` included in the arguments

#### Scenario: search_thoughts called with json format
- **WHEN** the Search screen submits a query
- **THEN** the `search_thoughts` tool is called with `format: "json"` included in the arguments

#### Scenario: capture_thought called with json format
- **WHEN** the user saves a new thought
- **THEN** the `capture_thought` tool is called with `format: "json"` included in the arguments

#### Scenario: thought_stats called with json format
- **WHEN** the Stats screen loads
- **THEN** the `thought_stats` tool is called with `format: "json"` included in the arguments

### Requirement: MCP tool wrappers return typed structured data
The `listThoughts` and `searchThoughts` wrappers SHALL return `Promise<Thought[]>`. The `getThoughtStats` wrapper SHALL return `Promise<ThoughtStats>`. The `captureThought` and `updateThought` wrappers SHALL return `Promise<Thought>`.

#### Scenario: listThoughts returns an array of Thought objects
- **WHEN** the V2 server responds to a `list_thoughts` call with JSON
- **THEN** `listThoughts()` returns a parsed array of `Thought` objects with `id`, `content`, `type`, `topics`, and `created_at` fields

#### Scenario: searchThoughts returns thoughts with similarity scores
- **WHEN** the V2 server responds to a `search_thoughts` call with JSON
- **THEN** `searchThoughts()` returns a parsed array of `Thought` objects each including a `similarity` numeric field

#### Scenario: JSON parse failure surfaces as a user-facing error
- **WHEN** the V2 server returns a response that cannot be parsed as valid JSON
- **THEN** a `McpError` is thrown with a message indicating an unexpected server response

### Requirement: Default server URL points to V2 endpoint
The app SHALL use the V2 MCP server URL as the default when no custom URL has been stored by the user.

#### Scenario: First-time user connects to V2 by default
- **WHEN** a user opens the app for the first time and has not configured a custom server URL
- **THEN** all MCP calls are routed to the V2 server endpoint

#### Scenario: User with custom URL is unaffected
- **WHEN** a user has previously saved a custom server URL in Settings
- **THEN** that custom URL continues to be used and is not overwritten by the default change

### Requirement: Browse screen renders structured thought cards
The Browse screen SHALL display each thought as a structured card component rather than raw text.

#### Scenario: Thought card displays content and metadata
- **WHEN** the Browse screen receives a `Thought[]` response
- **THEN** each thought is rendered as a card showing the content body, type chip, topic tags, and formatted creation timestamp

#### Scenario: Empty result set shows empty state message
- **WHEN** the Browse screen receives an empty `Thought[]` array
- **THEN** a message is displayed indicating no thoughts match the current filters

### Requirement: Search screen renders structured result cards with similarity
The Search screen SHALL display each search result as a structured card component including a similarity score indicator.

#### Scenario: Search result card shows similarity score
- **WHEN** the Search screen receives a `Thought[]` response with similarity values
- **THEN** each card displays a similarity percentage badge alongside the thought content and metadata

#### Scenario: Empty search result shows empty state message
- **WHEN** the Search screen receives an empty `Thought[]` array
- **THEN** a message is displayed indicating no results were found for the query
