// AIDEV-NOTE: Core MCP client — sends JSON-RPC 2.0 POST requests to the Supabase edge function.
// All MCP tool calls go through callTool(). Error handling covers auth, network, and server errors.

import { getApiKey, getBaseUrl } from './api-key-store';

let requestId = 0;

export class McpError extends Error {
  constructor(
    message: string,
    public readonly code: 'AUTH_FAILED' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'NO_API_KEY',
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'McpError';
  }
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: {
    content?: Array<{ type: string; text: string }>;
    [key: string]: unknown;
  };
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// AIDEV-NOTE: Parses an SSE response body to extract the JSON-RPC message.
// SSE format: blocks separated by blank lines, each with optional "event:" and "data:" lines.
// We look for the JSON-RPC response matching our request id.
function parseSSEResponse(text: string, expectedId: number): JsonRpcResponse {
  const lines = text.split('\n');
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      dataLines.push(line.slice(6));
    }
  }

  // Try each data line to find a valid JSON-RPC response
  for (const data of dataLines) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.jsonrpc === '2.0') {
        return parsed as JsonRpcResponse;
      }
    } catch {
      // Not JSON, skip
    }
  }

  throw new McpError('No valid JSON-RPC response found in server stream.', 'SERVER_ERROR');
}

// AIDEV-NOTE: callTool is the single entry point for all MCP interactions.
// It builds a JSON-RPC 2.0 payload with method "tools/call" per the MCP spec.
export async function callTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new McpError('No API key configured. Please set your API key in Settings.', 'NO_API_KEY');
  }

  const baseUrl = await getBaseUrl();
  const id = ++requestId;

  const payload = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args,
    },
    id,
  };

  let response: Response;
  try {
    response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'x-brain-key': apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new McpError(
      'Unable to reach the server. Check your network connection.',
      'NETWORK_ERROR',
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new McpError(
      'Authentication failed. Please check your API key in Settings.',
      'AUTH_FAILED',
      response.status,
    );
  }

  if (!response.ok) {
    throw new McpError(
      `Server error (${response.status}). Please try again later.`,
      'SERVER_ERROR',
      response.status,
    );
  }

  // AIDEV-NOTE: The MCP StreamableHTTP transport may respond with either
  // application/json (single JSON-RPC response) or text/event-stream (SSE).
  // When SSE, we read the full stream and extract JSON-RPC messages from
  // "data:" lines within "event: message" blocks.
  let body: JsonRpcResponse;
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('text/event-stream')) {
      const text = await response.text();
      body = parseSSEResponse(text, id);
    } else {
      body = await response.json();
    }
  } catch (err) {
    if (err instanceof McpError) throw err;
    throw new McpError('Invalid response from server.', 'SERVER_ERROR');
  }

  if (body.error) {
    // Check for auth-related JSON-RPC errors
    if (body.error.message?.toLowerCase().includes('auth') ||
        body.error.message?.toLowerCase().includes('key') ||
        body.error.code === -32000) {
      throw new McpError(
        body.error.message || 'Authentication failed.',
        'AUTH_FAILED',
      );
    }
    throw new McpError(
      body.error.message || 'Server returned an error.',
      'SERVER_ERROR',
    );
  }

  // MCP tool results come wrapped in content[].text — parse the first text block
  if (body.result?.content && Array.isArray(body.result.content)) {
    const textBlock = body.result.content.find((c) => c.type === 'text');
    if (textBlock) {
      try {
        return JSON.parse(textBlock.text) as T;
      } catch {
        return textBlock.text as unknown as T;
      }
    }
  }

  return body.result as unknown as T;
}
