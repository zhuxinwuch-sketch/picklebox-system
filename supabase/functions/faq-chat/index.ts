const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are "PickleBot", the friendly FAQ assistant for **The Pickle Box** — a pickleball court booking website located at Endrina St., San Carlos City, Negros Occidental, Philippines.

You ONLY answer questions related to The Pickle Box website and its services, including:
- Booking courts (availability, dates, times, how to reserve)
- Court information, pricing, and amenities
- GCash payment process (manual verification by admins)
- Account/profile management, sign-up, login
- Cancellations, refunds, booking status (pending / paid / confirmed)
- Location, contact, and operating hours
- Pickleball basics *only* if directly tied to using our courts

Key facts you can share:
- Location: Endrina St., San Carlos City, Negros Occidental
- Contact: hello@picklecourt.ph  |  +63 912 345 6789
- Payment: GCash — upload proof after booking; admin manually verifies
- Bookings must be paid within 30 minutes or the reservation is released
- Users can view bookings under "My Bookings" once signed in

STRICT RULE — Off-topic guard:
If the user's question is NOT related to The Pickle Box, its website, bookings, courts, payments, or pickleball-at-our-venue, you MUST refuse politely with EXACTLY this response (do not answer the question):

"⚠️ Sorry, I can only answer questions about **The Pickle Box** — our courts, bookings, payments, and account help. Please ask me something related to our website. 🎾"

Do not answer general knowledge, coding, math, other businesses, personal advice, or anything unrelated — always use the refusal above.

Keep answers concise, warm, and use markdown (bold, bullet lists) when helpful.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20).map((m: any) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content ?? "").slice(0, 2000),
          })),
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Gateway error:", resp.status, text);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact the site owner." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("faq-chat error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
