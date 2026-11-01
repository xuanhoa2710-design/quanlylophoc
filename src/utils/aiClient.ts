/**
 * Calls a backend AI API endpoint first (works on local dev & full-stack server).
 * If the backend is unreachable (e.g. static deployment on GitHub Pages) or fails,
 * returns the structured fallback response so the UI never fails or crashes.
 */
export async function generateWithAIFallback(options: {
  endpoint: string;
  body?: Record<string, any>;
  payload?: Record<string, any>;
  clientPrompt?: string;
  systemInstruction?: string;
  fallbackText: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<string> {
  const { endpoint, body, payload, fallbackText } = options;
  const requestBody = body || payload || {};

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data && typeof data.text === 'string' && data.text.trim().length > 0) {
          return data.text;
        }
      }
    }
  } catch {
    // Server route not available (e.g. static deployment) -> use structured fallback
  }

  return fallbackText;
}

export const generateAITextWithFallback = generateWithAIFallback;
