## ADDED Requirements

### Requirement: User can search thoughts by meaning
The app SHALL provide a search input where the user types a natural-language query. On submission, the app SHALL call `search_thoughts` and display results ranked by similarity.

#### Scenario: Search with results
- **WHEN** the user enters a query and taps "Search"
- **THEN** the app SHALL display a list of matching thoughts with their content (truncated if long), type, topics, and similarity score

#### Scenario: Search with no results
- **WHEN** the search returns zero matches
- **THEN** the app SHALL display a "No matching thoughts found" message

#### Scenario: Empty search prevented
- **WHEN** the user taps "Search" with no query entered
- **THEN** the Search button SHALL be disabled or the app SHALL show a validation message

### Requirement: User can adjust search parameters
The app SHALL allow the user to optionally set the result limit (default 10) and similarity threshold (default 0.5).

#### Scenario: Custom limit
- **WHEN** the user sets the limit to 5 and searches
- **THEN** the `search_thoughts` call SHALL include `limit: 5` and return at most 5 results

### Requirement: User can view full thought detail
The app SHALL allow the user to tap a search result to view the full thought content, metadata, and timestamps.

#### Scenario: Tap to expand
- **WHEN** the user taps a thought in the search results
- **THEN** the app SHALL display the full thought content, type, topics, people, created date, and updated date
