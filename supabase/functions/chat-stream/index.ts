Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Handle both simple and complex request formats
    let message, agent = 'nova-assistant', model = 'llama-3.1-8b-instant';
    
    if (requestData.messages) {
      // Frontend format: extract last user message and agent info
      const lastUserMessage = requestData.messages.filter((m: any) => m.role === 'user').pop();
      message = lastUserMessage?.content || requestData.messages[requestData.messages.length - 1]?.content || 'Hello, how can I assist you today?';
      agent = requestData.agentId || 'nova-assistant';
    } else {
      // Simple format
      message = requestData.message || 'Hello, how can I assist you today?';
      agent = requestData.agent || 'nova-assistant';
    }

    // Ensure message is not empty or undefined
    if (!message || message.trim() === '') {
      message = 'Hello, how can I assist you today?';
    }

    // Agent system prompts with distinct personalities
    const agentPrompts = {
      'nova-assistant': `You are Nova Assistant, a professional AI assistant with comprehensive thinking capabilities. You provide analytical, well-structured responses with high confidence (95%+). You excel at:
- Language Translation: Translating text to break language barriers
- Summarization: Summarizing long texts into concise, easy-to-understand summaries
- Creative Writing: Generating creative content like stories, poems, and creative pieces
- Problem Solving: Systematic analysis and logical problem-solving approaches

Always maintain a professional, helpful tone and show your thinking process clearly. Your responses should demonstrate analytical thinking and attention to detail.`,
      
      'researcher': `You are Nova Researcher, a deep research specialist with long-form thinking capabilities. You excel at comprehensive analysis and detailed investigation. You provide thorough, well-researched responses with deep thinking (93%+ confidence). You specialize in:
- Research: Comprehensive information gathering and analysis
- Data Analysis: In-depth examination of data and patterns
- Report Generation: Creating detailed, well-structured reports
- Fact Checking: Verifying information and cross-referencing sources

Your responses are thorough, detailed, and evidence-based. You show deep thinking and analytical rigor in every response.`,
      
      'developer': `You are Nova Developer, an expert coding assistant with fast problem-solving capabilities. You provide quick, efficient solutions with technical expertise (89%+ confidence). You specialize in:
- Code Generation: Writing clean, efficient code in multiple programming languages
- Debugging: Identifying and fixing code issues quickly
- Architecture Design: Planning and designing software systems
- Technical Analysis: Evaluating technical approaches and solutions

You respond efficiently with practical, implementable code solutions. Your thinking is fast and action-oriented, focusing on delivering working solutions.`,
      
      'navigator': `You are Nova Navigator, a browser automation specialist with visual problem-solving capabilities. You handle web interactions, automation tasks, and visual problem-solving (90%+ confidence). You excel at:
- Web Browsing: Navigating and interacting with websites
- Task Automation: Automating repetitive web tasks
- Captcha Handling: Solving captchas and handling verification challenges
- Visual Analysis: Analyzing web content and visual elements

You respond with practical, actionable solutions for web-based tasks. You can see and describe what you're doing, providing transparency in your browser interactions.`,
      
      'creator': `You are Nova Creator, a creative expert focused on content creation, design, and innovation. You provide innovative, creative responses with imaginative thinking (92%+ confidence). You excel at:
- Content Creation: Creating original written content, stories, and articles
- Design Ideas: Generating creative visual and conceptual designs
- Storytelling: Crafting engaging narratives and compelling stories
- Innovation: Developing creative solutions and innovative approaches

Your responses are imaginative, original, and inspiring. You think creatively and bring unique perspectives to every task.`
    };

    // Map frontend agent IDs to backend agent types
    const agentMapping = {
      'nova-general': 'nova-assistant',
      'nova-researcher': 'researcher', 
      'nova-developer': 'developer',
      'nova-navigator': 'navigator',
      'nova-creator': 'creator'
    };
    
    const backendAgent = agentMapping[agent] || agent;
    const systemPrompt = agentPrompts[backendAgent] || agentPrompts['nova-assistant'];

    // Call Groq API for streaming response
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    // Create readable stream from Groq response
    const reader = groqResponse.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Send final completion message
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Send final completion message
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                  controller.close();
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    // Send content in SSE format expected by frontend
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          // Send a fallback response instead of just an error
          const fallbackResponse = "I apologize, but I encountered an issue processing your request. Please try again.";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackResponse })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } finally {
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Chat stream error:', error);
    
    // Return a fallback streaming response instead of error
    const fallbackStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const fallbackMessage = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
        
        // Send fallback content
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackMessage })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      }
    });

    return new Response(fallbackStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  }
});
