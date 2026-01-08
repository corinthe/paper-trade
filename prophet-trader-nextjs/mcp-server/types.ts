/**
 * Common types for MCP tools
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: Record<string, any>, apiBaseUrl: string) => Promise<any>;
}

/**
 * Helper function to make API calls to Next.js backend
 */
export async function callAPI(
  apiBaseUrl: string,
  path: string,
  options: {
    method?: string;
    body?: any;
    query?: Record<string, string>;
  } = {}
): Promise<any> {
  const { method = 'GET', body, query } = options;

  // Build URL with query params
  let url = `${apiBaseUrl}${path}`;
  if (query) {
    const params = new URLSearchParams(query);
    url += `?${params.toString()}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}
