import { ChatDurableObject } from "../memory/ memory.mjs";
export { ChatDurableObject };
export default {
  async fetch(request, env) {
    try {
      if (request.method !== 'POST') {
        return new Response("Method Not Allowed. This Worker expects a POST request.", { status: 405 });
      }

      const { input, sessionId } = await request.json();
      if (!input || !sessionId) {
         return new Response("Missing 'input' or 'sessionId' in request body.", { status: 400 });
      }

      // --- Durable Object Interaction ---

      // 2. Get the Durable Object stub using the sessionId
      const id = env['chat-session'].idFromName(sessionId);
      const stub = env['chat-session'].get(id);

      // 3. Load previous messages (replaces getSession())
      const historyResponse = await stub.fetch("http://do/history"); // Use a placeholder URL, the path matters
      const previousMessages = await historyResponse.json();

      // --- AI Call ---
      
      // 4. Prepare message list for LLM (Llama 3.3)
      const messages = [
        { role: "system", content: "Welcome to LeanMind, an AI coach for fitness, focus, and self-improvement. Keep your answers concise and actionable." },
        ...previousMessages,
        { role: "user", content: input }
        
      ];

      // Call Llama 3.3 on Cloudflare Workers AI
      const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { // Use 3.1 for stability
        messages: messages,
      });
      const assistantResponse = aiResponse.response;

      // 5. Save user input and AI response (replaces saveMessage())
      
      // Save user message
      await stub.fetch("http://do/add", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: "user", content: input }),
      });
      
      // Save assistant message
      await stub.fetch("http://do/add", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: "assistant", content: assistantResponse }),
      });

      // --- Response ---

      return new Response(JSON.stringify({ output: assistantResponse, sessionId: sessionId }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      // Log the error for better debugging
      console.error("Worker Error:", err.stack); 
      return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
    }
  },
  
  ChatDurableObject: ChatDurableObject,
};