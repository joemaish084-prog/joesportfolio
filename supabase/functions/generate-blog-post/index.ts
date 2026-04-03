import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOPICS = [
  "Digital Marketing Nairobi",
  "SEO Tips Kenya",
  "Social Media Strategy Kenya",
  "Content Marketing Tips",
  "Meta Ads Kenya",
  "TikTok Marketing Nairobi",
  "Google Analytics Tips",
  "Brand Strategy Kenya",
];

const SYSTEM_PROMPT = `You are an SEO content writer for Joseph Maina, a Digital Marketing Specialist in Nairobi, Kenya. Write blog posts that:
1. Are 300-500 words
2. Include the topic keyword naturally 5-8 times
3. Mention Nairobi or Kenya at least 3 times
4. End with a CTA linking to Joseph's services
5. Are written in simple, engaging English
6. Include a meta description under 155 chars

Return response in JSON format only, no markdown fences:
{
  "title": "",
  "metaDescription": "",
  "content": "",
  "topic": ""
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
