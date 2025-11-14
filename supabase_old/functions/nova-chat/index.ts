import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  agent?: string
  model?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, agent = 'nova-assistant', model = 'llama-3.3-70b-versatile' }: ChatRequest = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format')
    }

    // Agent-specific system prompts
    const agentPrompts = {
      'nova-assistant': 'You are Nova Assistant, a helpful AI assistant. Provide clear, accurate, and friendly responses.',
      'researcher': 'You are Nova Researcher, an expert researcher. Provide detailed, well-researched information with citations when possible.',
      'developer': 'You are Nova Developer, an expert programmer. Provide clean, efficient code solutions with explanations.',
      'navigator': 'You are Nova Navigator, an expert at finding and organizing information. Provide structured, navigable responses.',
      'creator': 'You are Nova Creator, a creative AI. Generate innovative, creative content and ideas.'
    }

    const systemPrompt = agentPrompts[agent] || agentPrompts['nova-assistant']
    
    // Prepare messages for GroqCloud API
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    console.log('Calling GroqCloud API with model:', model)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GroqCloud API Error:', errorText)
      throw new Error(`GroqCloud API error: ${response.status} - ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    async function* streamGenerator() {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                yield `data: ${JSON.stringify({ done: true })}\n\n`
                return
              }

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  yield `data: ${JSON.stringify({ content, agent, model })}\n\n`
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error)
        yield `data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGenerator()) {
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to process chat request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})