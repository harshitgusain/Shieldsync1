const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
  
    try {
      const { messages } = await req.json();
  
      if (!messages || !Array.isArray(messages)) {
        throw new Error('Invalid messages format');
      }
  
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.content) {
        throw new Error('No message content provided');
      }
  
      // Use the built-in Supabase.ai API
      const model = new Supabase.ai.Session('gte-small');
  
      // Generate response
      const response = await model.chat({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: 0.7,
        max_tokens: 500
      });
  
      return new Response(
        JSON.stringify({ response: response.content }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  });