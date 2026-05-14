/**
 * Gemini AI Client — Toxi AI
 * Centralized Gemini API integration using native fetch (no SDK needed).
 * Model: gemini-1.5-flash-latest (stable flash version)
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';
const MODEL = 'gemini-1.5-flash';

export type GeminiMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

// ─────────────────────────────────────────────────────────────
// Core: One-shot text generation (returns plain string)
// ─────────────────────────────────────────────────────────────
export async function geminiGenerate(prompt: string): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─────────────────────────────────────────────────────────────
// Core: JSON output (auto-strips markdown fences)
// ─────────────────────────────────────────────────────────────
export async function geminiGenerateJSON<T = any>(prompt: string): Promise<T> {
  const url = `${GEMINI_BASE_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt + '\n\nTRẢ VỀ JSON THUẦN TÚY, KHÔNG bọc trong markdown code fence.' }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

  // Extract JSON object or array robustly
  const jsonMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const cleaned = jsonMatch ? jsonMatch[0].trim() : raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Last resort: try to fix common issues
    const fixed = cleaned.replace(/,\s*([}\]])/g, '$1').replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    return JSON.parse(fixed) as T;
  }
}

// ─────────────────────────────────────────────────────────────
// Core: Multi-turn chat (for TongxiaoRoom)
// ─────────────────────────────────────────────────────────────
export async function geminiChat(
  systemInstruction: string,
  history: GeminiMessage[],
  userMessage: string
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const contents: GeminiMessage[] = [
    ...history,
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1024,
      },
    }),
  });

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─────────────────────────────────────────────────────────────
// Core: Vision (image-based analysis)
// ─────────────────────────────────────────────────────────────
export async function geminiVision<T = any>(prompt: string, base64Image: string): Promise<T> {
  const url = `${GEMINI_BASE_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Strip base64 prefix if exists
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt + '\n\nTRẢ VỀ JSON THUẦN TÚY, KHÔNG bọc trong markdown code fence.' },
          {
            inline_data: {
              mime_type: 'image/png',
              data: cleanBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Vision API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const jsonMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const cleaned = jsonMatch ? jsonMatch[0].trim() : raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const fixed = cleaned.replace(/,\s*([}\]])/g, '$1').replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    return JSON.parse(fixed) as T;
  }
}

