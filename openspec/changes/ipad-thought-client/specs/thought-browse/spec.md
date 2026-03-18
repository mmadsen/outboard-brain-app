## ADDED Requirements

### Requirement: User can browse recent thoughts
The app SHALL display a list of recent thoughts using the `list_thoughts` tool, showing content preview, type, topics, and creation date.

#### Scenario: Default browse view
- **WHEN** the user navigates to the Browse tab
- **THEN** the app SHALL load and display the 10 most recent thoughts

### Requirement: User can filter thoughts
The app SHALL provide filter controls for type (dropdown), topic (text input), person (text input), and recency (last N days).

#### Scenario: Filter by type
- **WHEN** the user selects "idea" from the type filter
- **THEN** the app SHALL call `list_thoughts` with `type: "idea"` and display only idea-type thoughts

#### Scenario: Filter by topic
- **WHEN** the user enters a topic string and applies the filter
- **THEN** the app SHALL call `list_thoughts` with the `topic` parameter

#### Scenario: Filter by recency
- **WHEN** the user sets "Last 7 days" in the recency filter
- **THEN** the app SHALL call `list_thoughts` with `days: 7`

#### Scenario: Combined filters
- **WHEN** the user sets multiple filters (e.g., type + topic)
- **THEN** the app SHALL include all selected filter parameters in the `list_thoughts` call

### Requirement: User can view full thought from browse list
The app SHALL allow the user to tap a thought in the browse list to view full details.

#### Scenario: Tap to view detail
- **WHEN** the user taps a thought in the browse list
- **THEN** the app SHALL display the full thought content and all metadata
