## ADDED Requirements

### Requirement: User can view thought statistics
The app SHALL display aggregate statistics from the `thought_stats` tool, including total thought count, breakdown by type, top topics, and top people.

#### Scenario: Stats dashboard loads
- **WHEN** the user navigates to the Stats tab
- **THEN** the app SHALL call `thought_stats` and display the total count, type distribution, top topics list, and top people list

#### Scenario: Stats refresh
- **WHEN** the user pulls to refresh or taps a refresh button on the Stats tab
- **THEN** the app SHALL re-fetch stats from the server and update the display

### Requirement: Stats display is readable at a glance
The stats screen SHALL present data in a clear, scannable layout — using large numbers for totals and simple lists for distributions — optimized for the iPad landscape viewport.

#### Scenario: Type distribution display
- **WHEN** stats are loaded and types are present
- **THEN** each thought type SHALL be displayed with its name and count
