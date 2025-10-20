import { ChatDurableObject } from "../memory/ memory.mjs";

export { ChatDurableObject };

export default {
  async fetch(request, env) {
    try {
      // Allow OPTIONS for CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        });
      }

      if (request.method !== 'POST') {
        return new Response("Method Not Allowed. This Worker expects a POST request.", {
          status: 405,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      let input, sessionId;
      try {
        const body = await request.json();
        input = body.input;
        sessionId = body.sessionId;
      } catch (parseError) {
        return new Response("Invalid JSON in request body.", {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      if (!input || !sessionId) {
        return new Response("Missing 'input' or 'sessionId' in request body.", {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // Validate sessionId format (basic check)
      if (typeof sessionId !== 'string' || sessionId.length === 0) {
        return new Response("Invalid 'sessionId' format.", {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // --- Durable Object Interaction ---

      // Get the Durable Object stub using the sessionId
      const id = env['chat-session'].idFromName(sessionId);
      const stub = env['chat-session'].get(id);

      // Load previous messages
      const historyResponse = await stub.fetch("http://do/history");
      if (!historyResponse.ok) {
        throw new Error(`Failed to load history: ${historyResponse.status}`);
      }
     
      const previousMessages = await historyResponse.json();

      // --- AI Call ---
     
      // Prepare message list for LLM
      const messages = [
        {
          role: "system",
          content: "Welcome to LeanMind, an AI coach for fitness, focus, and self-improvement. Keep your answers concise and actionable."
        },
        ...previousMessages,
        { role: "user", content: input }
      ];

      // Call Llama on Cloudflare Workers AI
      const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: messages,
        max_tokens: 500 // Add token limit for safety
      });
     
      if (!aiResponse || !aiResponse.response) {
        throw new Error("Invalid response from AI service");
      }
     
      const assistantResponse = aiResponse.response;

      // Save user input and AI response
      const saveUserMessage = await stub.fetch("http://do/add", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: "user", content: input }),
      });

      const saveAssistantMessage = await stub.fetch("http://do/add", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: "assistant", content: assistantResponse }),
      });

      if (!saveUserMessage.ok || !saveAssistantMessage.ok) {
        console.warn("Failed to save one or more messages to Durable Object");
      }

      // --- Response ---

      return new Response(JSON.stringify({
        output: assistantResponse,
        sessionId: sessionId
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
      });
    } catch (err) {
      console.error("Worker Error:", err.stack);
     
      return new Response(JSON.stringify({
        error: "Internal Server Error",
        message: err.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  },
};