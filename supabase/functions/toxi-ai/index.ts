import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, provider, useReasoner, payload } = await req.json()

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

    if (!GEMINI_API_KEY && provider === 'gemini') {
      throw new Error("Chưa cấu hình GEMINI_API_KEY trên Edge Functions.")
    }
    if (!DEEPSEEK_API_KEY && (provider === 'deepseek' || provider === 'tongxiao')) {
      throw new Error("Chưa cấu hình DEEPSEEK_API_KEY trên Edge Functions.")
    }

    let responseData = ""
    const rawHistory = payload.history || []

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
      
      let body = {}
      if (action === 'chat') {
        // Robust history mapping for Gemini format
        const contents = [
          ...rawHistory.map((h: any) => {
            let role = 'user';
            if (h.role === 'model' || h.role === 'assistant') {
              role = 'model';
            }
            
            let text = '';
            if (typeof h.content === 'string') {
              text = h.content;
            } else if (typeof h.parts === 'string') {
              text = h.parts;
            } else if (Array.isArray(h.parts)) {
              text = h.parts[0]?.text || '';
            }
            
            return { role, parts: [{ text }] };
          }),
          { role: 'user', parts: [{ text: payload.userMessage }] }
        ]

        body = {
          system_instruction: { parts: [{ text: payload.systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 1024,
          }
        }
      } else if (action === 'vision') {
        body = {
          contents: [{
            parts: [
              { text: payload.prompt },
              { inline_data: { mime_type: 'image/png', data: payload.base64Image } }
            ]
          }]
        }
      } else {
        body = {
          contents: [{ role: 'user', parts: [{ text: payload.prompt }] }]
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(`Gemini API error: ${await res.text()}`)
      const json = await res.json()
      responseData = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    } else if (provider === 'deepseek' || provider === 'tongxiao') {
      const model = useReasoner ? 'deepseek-reasoner' : 'deepseek-chat'
      const url = 'https://api.deepseek.com/v1/chat/completions'

      let messages = []
      if (action === 'chat') {
        // Robust history mapping for DeepSeek format
        messages = [
          { role: 'system', content: payload.systemInstruction },
          ...rawHistory.map((h: any) => {
            let role = 'user';
            if (h.role === 'model' || h.role === 'assistant') {
              role = 'assistant';
            }
            
            let content = '';
            if (typeof h.content === 'string') {
              content = h.content;
            } else if (typeof h.parts === 'string') {
              content = h.parts;
            } else if (Array.isArray(h.parts)) {
              content = h.parts[0]?.text || '';
            }
            
            return { role, content };
          }),
          { role: 'user', content: payload.userMessage }
        ]
      } else {
        messages = [{ role: 'user', content: payload.prompt }]
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: useReasoner ? undefined : 0.7,
        }),
      })

      if (!res.ok) throw new Error(`DeepSeek API error: ${await res.text()}`)
      const json = await res.json()
      responseData = json.choices?.[0]?.message?.content ?? ""
    }

    return new Response(JSON.stringify({ text: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
