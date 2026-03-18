// AIDEV-NOTE: Typed wrappers for each MCP tool. These map 1:1 to the server's tool definitions.
// Currently the server returns human-readable text, not structured JSON.
// When the server adds JSON response mode, refactor per oba-ra4.

import { callTool } from './mcp-client';

// --- Types ---

export type ThoughtType =
  | 'observation'
  | 'task'
  | 'idea'
  | 'reference'
  | 'person_note'
  | 'daily'
  | 'log';

// AIDEV-NOTE: These interfaces represent the *future* structured JSON shape.
// Kept here for oba-ra4 refactor. Currently all tool calls return string.
export interface Thought {
  id: string;
  content: string;
  type?: string;
  topics?: string[];
  people?: string[];
  created_at: string;
  updated_at?: string;
  similarity?: number;
}

export interface ThoughtStats {
  total: number;
  by_type: Record<string, number>;
  top_topics: Array<{ topic: string; count: number }>;
  top_people: Array<{ person: string; count: number }>;
}

// --- Tool Wrappers (all return text for now) ---

export interface CaptureParams {
  content: string;
  type?: ThoughtType;
  topics?: string[];
}

export async function captureThought(params: CaptureParams): Promise<string> {
  const args: Record<string, unknown> = { content: params.content };
  if (params.type) args.type = params.type;
  if (params.topics && params.topics.length > 0) args.topics = params.topics;
  return callTool<string>('capture_thought', args);
}

export interface SearchParams {
  query: string;
  limit?: number;
  threshold?: number;
}

export async function searchThoughts(params: SearchParams): Promise<string> {
  const args: Record<string, unknown> = { query: params.query };
  if (params.limit !== undefined) args.limit = params.limit;
  if (params.threshold !== undefined) args.threshold = params.threshold;
  return callTool<string>('search_thoughts', args);
}

export interface ListParams {
  type?: ThoughtType;
  topic?: string;
  person?: string;
  days?: number;
  limit?: number;
}

export async function listThoughts(params: ListParams = {}): Promise<string> {
  const args: Record<string, unknown> = {};
  if (params.type) args.type = params.type;
  if (params.topic) args.topic = params.topic;
  if (params.person) args.person = params.person;
  if (params.days !== undefined) args.days = params.days;
  if (params.limit !== undefined) args.limit = params.limit;
  return callTool<string>('list_thoughts', args);
}

export async function getThoughtStats(): Promise<string> {
  return callTool<string>('thought_stats', {});
}

export interface UpdateParams {
  id: string;
  content: string;
  type?: ThoughtType;
  topics?: string[];
}

export async function updateThought(params: UpdateParams): Promise<string> {
  const args: Record<string, unknown> = { id: params.id, content: params.content };
  if (params.type) args.type = params.type;
  if (params.topics && params.topics.length > 0) args.topics = params.topics;
  return callTool<string>('update_thought', args);
}

export async function deleteThought(id: string): Promise<string> {
  return callTool<string>('delete_thought', { id });
}
