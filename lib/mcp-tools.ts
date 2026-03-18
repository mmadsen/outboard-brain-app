// AIDEV-NOTE: Typed wrappers for each MCP tool. These map 1:1 to the V2 server's tool definitions.
// list_thoughts and search_thoughts support output_format: 'json' for structured responses (oba-71d).
// capture, update, delete, and stats do not support output_format and return text.

import { callTool, McpError } from './mcp-client';

// --- Types ---

export type ThoughtType =
  | 'observation'
  | 'task'
  | 'idea'
  | 'reference'
  | 'person_note'
  | 'daily'
  | 'log';

// AIDEV-NOTE: Matches the V2 server's JSON response shape for list/search tools.
export interface Thought {
  id: string;
  type?: string;
  tags?: string[];
  created: string;
  content_raw: string;
  content_parsed?: {
    format: string;
    text?: string;
    items?: Array<{ checked: boolean; text: string }>;
  };
  people?: string[];
  action_items?: string[];
  similarity?: number;
}

export interface ThoughtStats {
  total: number;
  date_range: { earliest: string; latest: string };
  types: Record<string, number>;
  top_topics: Record<string, number>;
  people: Record<string, number>;
}

// --- Helpers ---

function parseJsonResponse<T>(raw: unknown, fallback?: T): T {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Server returned text instead of JSON (e.g. "No thoughts found").
      // If a fallback was provided, use it; otherwise throw.
      if (fallback !== undefined) return fallback;
      throw new McpError('Unexpected server response: could not parse JSON.', 'SERVER_ERROR');
    }
  }
  return raw as T;
}

// --- Tool Wrappers ---

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

export async function searchThoughts(params: SearchParams): Promise<Thought[]> {
  const args: Record<string, unknown> = { query: params.query, output_format: 'json' };
  if (params.limit !== undefined) args.limit = params.limit;
  if (params.threshold !== undefined) args.threshold = params.threshold;
  const raw = await callTool<unknown>('search_thoughts', args);
  return parseJsonResponse<Thought[]>(raw, [] as Thought[]);
}

export interface ListParams {
  type?: ThoughtType;
  topic?: string;
  person?: string;
  days?: number;
  limit?: number;
}

export async function listThoughts(params: ListParams = {}): Promise<Thought[]> {
  const args: Record<string, unknown> = { output_format: 'json' };
  if (params.type) args.type = params.type;
  if (params.topic) args.topic = params.topic;
  if (params.person) args.person = params.person;
  if (params.days !== undefined) args.days = params.days;
  if (params.limit !== undefined) args.limit = params.limit;
  const raw = await callTool<unknown>('list_thoughts', args);
  return parseJsonResponse<Thought[]>(raw, [] as Thought[]);
}

export async function getThoughtStats(): Promise<ThoughtStats> {
  const raw = await callTool<unknown>('thought_stats', { output_format: 'json' });
  return parseJsonResponse<ThoughtStats>(raw);
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
