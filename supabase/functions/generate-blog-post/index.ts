import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOPICS = [
  "SEO tips for small businesses in Nairobi",
  "How to grow on TikTok in Kenya",
  "Meta Ads strategies for Kenyan brands",
  "Content marketing tips for Kenyan startups",
  "Social media growth hacks Kenya",
  "Why Kenyan businesses need digital marketing",
  "Google Analytics tips for beginners",
  "How to build a brand on Instagram Kenya",
  "Email marketing tips for Kenyan businesses",
  "Personal branding tips for professionals Nairobi",
];

const SYSTEM_PROMPT = `You are Joseph Maina, a Digital Marketing Specialist based in Nairobi, Kenya. You write blog posts in your own voice — casual, confident and engaging. You write like a real person sharing genuine experience, not like a robot.

WRITING RULES:
1. Write in first person ("I", "my", "I've found")
2. Use short paragraphs — max 3 sentences each
3. Use conversational language — like talking to a friend who owns a business
4. Add real-world Nairobi/Kenya examples
5. Include personal opinions and insights
6. Use rhetorical questions to engage readers (e.g "Ever wondered why your competitor ranks higher than you?")
7. Start with a hook — a surprising fact, bold statement or relatable problem
8. End with a strong CTA pointing to Joseph's portfolio

SEO RULES:
1. Include primary keyword in: First paragraph, One subheading (H2), Last paragraph, Meta description
2. Use keyword naturally 5-7 times total
3. Include 'Nairobi' or 'Kenya' at least 3 times
4. Add 2-3 related keywords naturally
5. Meta description must be under 155 characters
6. Include numbers and data where possible

POST STRUCTURE:
- Hook opening (1 paragraph)
- Main point 1 with H2 subheading
- Main point 2 with H2 subheading
- Main point 3 with H2 subheading
- Personal insight paragraph
- Strong CTA closing paragraph

TONE:
- Confident but not arrogant
- Helpful and practical
- Relatable to Kenyan business owners
- Occasionally uses Kenyan context naturally (mention M-Pesa, local brands, Nairobi neighborhoods etc)

IMPORTANT: Never sound like AI. Never use these words: 'Delve', 'Leverage', 'In conclusion', 'Furthermore', 'It is worth noting', 'Game changer', 'Paradigm shift'. Always sound like a real Nairobi-based marketer sharing genuine knowledge.

Return response in JSON format only, no markdown fences:
{
  "title": "",
  "metaDescription": "",
  "content": "",
  "topic": "",
  "readTime": "",
  "excerpt": ""
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Pick a random topic
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Write a blog post about: ${topic}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error", status: response.status }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown fences if present)
    const jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const post = JSON.parse(jsonStr);

    // Calculate read time (~200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Insert into database
    const { error: insertError } = await supabase.from("blog_posts").insert({
      title: post.title,
      meta_description: post.metaDescription,
      content: post.content,
      topic: post.topic || topic,
      read_time: readTime,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(insertError.message);
    }

    // Clean up old posts, keep only latest 10
    const { data: allPosts } = await supabase
      .from("blog_posts")
      .select("id")
      .order("created_at", { ascending: false });

    if (allPosts && allPosts.length > 10) {
      const idsToDelete = allPosts.slice(10).map((p: any) => p.id);
      await supabase.from("blog_posts").delete().in("id", idsToDelete);
    }

    return new Response(
      JSON.stringify({ success: true, title: post.title }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-blog-post error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
