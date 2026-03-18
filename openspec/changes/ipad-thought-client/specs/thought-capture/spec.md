## ADDED Requirements

### Requirement: User can compose and submit a thought
The app SHALL provide a text input area for composing thought content (plain text or Markdown). The user SHALL be able to submit the thought to the MCP server via the `capture_thought` tool.

#### Scenario: Submit a simple thought
- **WHEN** the user types content into the thought input and taps "Save"
- **THEN** the app SHALL call `capture_thought` with the content and display a success confirmation

#### Scenario: Empty submission prevented
- **WHEN** the user taps "Save" with no content entered
- **THEN** the Save button SHALL be disabled or the app SHALL show a validation message

### Requirement: User can optionally set type and topics
The app SHALL provide optional fields to override the auto-detected type (dropdown: observation, task, idea, reference, person_note, daily, log) and topics (comma-separated text input).

#### Scenario: Submit with type override
- **WHEN** the user selects a type from the dropdown and submits
- **THEN** the `capture_thought` call SHALL include the `type` parameter with the selected value

#### Scenario: Submit with topics override
- **WHEN** the user enters comma-separated topics and submits
- **THEN** the `capture_thought` call SHALL include the `topics` parameter as an array

#### Scenario: Submit without overrides
- **WHEN** the user submits without selecting type or topics
- **THEN** the `capture_thought` call SHALL omit type and topics, letting the server auto-detect

### Requirement: Input clears after successful capture
After a successful capture, the app SHALL clear all input fields and show a brief success indicator, ready for the next thought.

#### Scenario: Successful capture resets form
- **WHEN** the server confirms the thought was captured
- **THEN** the content field, type selector, and topics field SHALL reset to their default/empty state
