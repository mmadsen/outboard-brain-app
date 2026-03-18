## 1. Project Setup

- [ ] 1.1 Initialize Expo project with expo-router and TypeScript template
- [ ] 1.2 Configure app.json for iPad-only, landscape orientation, and app metadata
- [ ] 1.3 Install dependencies: expo-secure-store, expo-router
- [ ] 1.4 Set up file-based routing with tab layout (Capture, Search, Browse, Stats)
- [ ] 1.5 Create shared theme constants (colors, spacing, typography)

## 2. MCP Transport Layer

- [ ] 2.1 Create MCP client module that sends JSON-RPC 2.0 POST requests to the configured endpoint
- [ ] 2.2 Implement API key management with expo-secure-store (read, write, delete)
- [ ] 2.3 Add typed wrapper functions for each MCP tool (capture_thought, search_thoughts, list_thoughts, thought_stats, update_thought, delete_thought)
- [ ] 2.4 Implement error handling for auth failures, network errors, and server errors
- [ ] 2.5 Create settings screen for API key entry and base URL configuration
- [ ] 2.6 Add first-launch setup flow that requires API key before accessing main tabs

## 3. Capture Screen

- [ ] 3.1 Build capture form with multiline text input for thought content
- [ ] 3.2 Add optional type selector dropdown (observation, task, idea, reference, person_note, daily, log)
- [ ] 3.3 Add optional topics text input (comma-separated)
- [ ] 3.4 Implement Save button with disabled state when content is empty
- [ ] 3.5 Wire form submission to capture_thought MCP call
- [ ] 3.6 Show success confirmation and clear form on successful capture

## 4. Search Screen

- [ ] 4.1 Build search input with Search button
- [ ] 4.2 Add optional controls for limit and similarity threshold
- [ ] 4.3 Wire search submission to search_thoughts MCP call
- [ ] 4.4 Display results list with content preview, type, topics, and similarity score
- [ ] 4.5 Show "No matching thoughts found" state for empty results
- [ ] 4.6 Implement tap-to-expand detail view showing full thought content and metadata

## 5. Browse Screen

- [ ] 5.1 Build browse list view that loads recent thoughts on mount via list_thoughts
- [ ] 5.2 Add filter controls: type dropdown, topic input, person input, recency (days) picker
- [ ] 5.3 Wire filters to list_thoughts parameters and reload on filter change
- [ ] 5.4 Display thought items with content preview, type, topics, and creation date
- [ ] 5.5 Implement tap-to-view detail showing full thought content and metadata

## 6. Stats Screen

- [ ] 6.1 Build stats dashboard that loads data via thought_stats on mount
- [ ] 6.2 Display total thought count prominently
- [ ] 6.3 Display type distribution as a list with counts
- [ ] 6.4 Display top topics and top people lists
- [ ] 6.5 Add pull-to-refresh to reload stats

## 7. Polish and Testing

- [ ] 7.1 Verify landscape layout works correctly on iPad simulator
- [ ] 7.2 Add loading spinners for all async operations
- [ ] 7.3 Add error state displays for network/auth failures across all screens
- [ ] 7.4 Test full flow: setup key → capture → search → browse → stats
