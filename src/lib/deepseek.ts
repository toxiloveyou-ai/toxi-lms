/**
 * DeepSeek AI Client — Toxi AI
 * Integrated using OpenAI-compatible API format.
 * Model: deepseek-chat (V3) or deepseek-reasoner (R1)
 */

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export const DEEPSEEK_MODELS = {
  V3: 'deepseek-chat',
  R1: 'deepseek-reasoner'
} as const;

export type DeepSeekModel = typeof DEEPSEEK_MODELS[keyof typeof DEEPSEEK_MODELS];

export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// ─────────────────────────────────────────────────────────────
// Core: One-shot text generation
// ─────────────────────────────────────────────────────────────
export async function deepseekGenerate(
  prompt: string, 
  systemPrompt?: string, 
  model: DeepSeekModel = DEEPSEEK_MODELS.V3
): Promise<string> {
  const messages: DeepSeekMessage[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature: model === DEEPSEEK_MODELS.R1 ? undefined : 0.7, // R1 doesn't support temp 0.7 sometimes or behaves differently
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

// ─────────────────────────────────────────────────────────────
// Core: JSON output
// ─────────────────────────────────────────────────────────────
export async function deepseekGenerateJSON<T = any>(
  prompt: string, 
  systemPrompt?: string,
  model: DeepSeekModel = DEEPSEEK_MODELS.V3
): Promise<T> {
  const messages: DeepSeekMessage[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt + '\n\nTRẢ VỀ JSON THUẦN TÚY, KHÔNG bọc trong markdown code fence.' });

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages,
      response_format: model === DEEPSEEK_MODELS.R1 ? undefined : { type: 'json_object' }, // R1 doesn't support json_object yet
      temperature: model === DEEPSEEK_MODELS.R1 ? undefined : 0.3,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${errText}`);
  }

  const text = await res.text();
  if (!text) throw new Error('DeepSeek returned an empty response.');
  
  let json: any;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error('[DeepSeek] Raw response was not JSON:', text);
    throw new Error('DeepSeek response is not valid JSON.');
  }

  let raw = json.choices?.[0]?.message?.content ?? '';
  if (!raw) throw new Error('DeepSeek returned no content in choices.');

  // [TOXI AI Update] Strip <thought> tags from R1 model to prevent JSON parsing errors
  raw = raw.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();

  try {
    // Attempt direct parse first
    return JSON.parse(raw) as T;
  } catch {
    // Robust cleaning if not pure JSON
    const jsonMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0].trim()) as T;
      } catch (innerErr) {
        console.error('[DeepSeek] Failed to parse extracted JSON:', innerErr);
      }
    }
    
    // Last ditch effort: strip markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch (finalErr) {
      console.error('[DeepSeek] Final JSON parse failed:', finalErr, 'Raw content:', raw);
      throw new Error('Failed to parse DeepSeek response as JSON.');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Core: Multi-turn chat
// ─────────────────────────────────────────────────────────────
export async function deepseekChat(
  systemInstruction: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string,
  model: DeepSeekModel = DEEPSEEK_MODELS.V3
): Promise<string> {
  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemInstruction },
    ...history,
    { role: 'user', content: userMessage }
  ];

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature: model === DEEPSEEK_MODELS.R1 ? undefined : 0.85,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}
