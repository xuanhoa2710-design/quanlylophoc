import { GoogleGenAI } from '@google/genai';

/**
 * Safely retrieve GEMINI_API_KEY from process.env or import.meta.env
 * Never throws ReferenceError or TypeError even if process or import.meta.env is undefined.
 */
export const getSafeGeminiApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process && process.env && process.env.GEMINI_API_KEY) {
      const key = String(process.env.GEMINI_API_KEY).trim();
      if (key && key !== 'undefined' && key !== 'null') {
        return key;
      }
    }
  } catch {
    // Ignore ReferenceError if process is not defined in browser
  }

  try {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
    if (metaEnv) {
      const rawKey = metaEnv.VITE_GEMINI_API_KEY || metaEnv.GEMINI_API_KEY;
      if (rawKey) {
        const key = String(rawKey).trim();
        if (key && key !== 'undefined' && key !== 'null') {
          return key;
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return '';
};

/**
 * Lazily create a GoogleGenAI client only when needed and only if an API key is present.
 */
export const getSafeAIClient = (): GoogleGenAI | null => {
  const apiKey = getSafeGeminiApiKey();
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
    return null;
  }
};

/**
 * Safely post to a backend /api/ai/* route.
 * If the app is deployed as a static site (e.g., GitHub Pages) where /api/ai/* returns 404,
 * or if the backend has no key, it attempts client-side Gemini generation if a key exists,
 * and otherwise returns the provided fallback text without ever crashing.
 */
export const generateAITextWithFallback = async (options: {
  endpoint: string;
  payload: Record<string, any>;
  clientPrompt?: string;
  fallbackText: string;
}): Promise<string> => {
  const { endpoint, payload, clientPrompt, fallbackText } = options;

  // 1. Try server-side API route first (works in AI Studio & full-stack deployments)
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && typeof data.text === 'string' && data.text.trim()) {
        return data.text;
      }
    }
  } catch {
    // Static host or network error - proceed to client fallback
  }

  // 2. If running on static host (e.g. GitHub Pages) and GEMINI_API_KEY is available, call Gemini lazily
  if (clientPrompt) {
    const ai = getSafeAIClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: clientPrompt,
          config: { temperature: 0.7 },
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        console.warn('Client Gemini fallback call failed:', err);
      }
    }
  }

  // 3. Guaranteed safe fallback text
  return fallbackText;
};
