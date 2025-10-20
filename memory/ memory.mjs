// memory.js (The Durable Object)

export class ChatDurableObject {
  constructor(state, env) {
    this.state = state;
    this.storage = this.state.storage;
    // Initialize messages to an empty array. The constructor runs only once.
    this.messages = [];
    
    // Asynchronously load the history when the object is first awakened
    this.storage.get("messages").then(m => {
        this.messages = m || [];
    });
  }

  // The fetch handler is the ONLY way to interact with a Durable Object
  async fetch(request) {
    const url = new URL(request.url);
    
    // API to get history (replaces getSession)
    if (url.pathname === "/history") {
      // Use structuredClone to return a copy, preventing modification outside the DO
      return new Response(JSON.stringify(structuredClone(this.messages)), { headers: { "Content-Type": "application/json" } });
    }
    
    // API to add a message (replaces saveMessage)
    if (url.pathname === "/add" && request.method === "POST") {
      const { role, content } = await request.json();
      
      // Enforce a max history length to save storage/token usage
      if (this.messages.length > 20) {
          this.messages.shift(); // Remove the oldest message
      }
      
      this.messages.push({ role, content });
      await this.storage.put("messages", this.messages);
      return new Response(JSON.stringify({ status: "ok" }));
    }
    
    return new Response("Not Found", { status: 404 });
  }
}