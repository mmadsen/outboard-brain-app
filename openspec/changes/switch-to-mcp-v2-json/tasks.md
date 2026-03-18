## 1. Confirm V2 Server Details

- [ ] 1.1 Confirm the exact V2 Supabase edge function URL (verify `open-brain-mcp-v2` path)
- [ ] 1.2 Confirm the V2 JSON response schema for write operations (`capture_thought`, `update_thought`, `delete_thought`)

## 2. Update Default Server URL

- [x] 2.1 Update `DEFAULT_BASE_URL` in `lib/api-key-store.ts` to point to the V2 endpoint

## 3. Update MCP Tool Wrappers

- [x] 3.1 Add `args.format = 'json'` to `captureThought` and update return type to `Promise<Thought>`
- [x] 3.2 Add `args.format = 'json'` to `searchThoughts` and update return type to `Promise<Thought[]>`
- [x] 3.3 Add `args.format = 'json'` to `listThoughts` and update return type to `Promise<Thought[]>`
- [x] 3.4 Add `args.format = 'json'` to `getThoughtStats` and update return type to `Promise<ThoughtStats>`
- [x] 3.5 Add `args.format = 'json'` to `updateThought` and update return type to `Promise<Thought>`
- [x] 3.6 Decide whether `deleteThought` needs `format: 'json'`; update accordingly
- [x] 3.7 Wrap JSON.parse in each tool wrapper with try/catch; throw `McpError` on parse failure

## 4. Build ThoughtCard Component

- [x] 4.1 Create `components/ThoughtCard.tsx` rendering content body, type chip, topic tags, and formatted timestamp
- [x] 4.2 Add similarity percentage badge prop to `ThoughtCard` (optional, shown only when provided)

## 5. Refactor Browse Screen

- [x] 5.1 Change `result` state from `string` to `Thought[]`
- [x] 5.2 Update `loadThoughts` to store parsed `Thought[]` response
- [x] 5.3 Replace raw text `ScrollView` with a `FlatList` of `ThoughtCard` components
- [x] 5.4 Add empty state message when result array is empty

## 6. Refactor Search Screen

- [x] 6.1 Change `result` state from `string` to `Thought[]`
- [x] 6.2 Update `handleSearch` to store parsed `Thought[]` response
- [x] 6.3 Replace raw text `ScrollView` with a `FlatList` of `ThoughtCard` components (with similarity badge)
- [x] 6.4 Add empty state message when result array is empty

## 7. Verification

- [ ] 7.1 Run the app on device/simulator and verify Browse screen renders thought cards against V2 server
- [ ] 7.2 Run the app on device/simulator and verify Search screen renders result cards with similarity scores
- [ ] 7.3 Verify a user with a custom server URL stored in Settings is unaffected
- [x] 7.4 Update `AIDEV-NOTE` anchors in `mcp-tools.ts`, `browse.tsx`, `search.tsx` to remove oba-ra4 references
