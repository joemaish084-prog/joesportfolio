import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Not a real secret in the cryptographic sense (IPv4 space is small enough to
// brute-force regardless of salt) — this only stops raw IPs sitting in the
// database in plaintext and blocks trivial precomputed rainbow-table lookups.
const IP_SALT = "99c74631d5f2fa7cd709a6d957d440ae36da8b874c7f07d6e45198383243badd";

const BOT_UA_REGEX =
  /bot|crawl|slurp|spider|mediapartners|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|redditbot|applebot|petalbot|semrushbot|ahrefsbot|mj12bot|dotbot|blexbot|bingpreview|yandexbot|baiduspider|duckduckbot|curl|wget|python-requests|python-urllib|go-http-client|okhttp|libwww-perl|scrapy|httpclient|headlesschrome|phantomjs|node-fetch|axios|postmanruntime/i;

const VALID_EVENT_TYPES = new Set(["page_view", "click", "heartbeat", "page_exit", "server_hit"]);

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseUserAgent(ua: string) {
  let browser = "Unknown";
  let os = "Unknown";
  let deviceType = "desktop";

  if (/Tablet|iPad/i.test(ua)) deviceType = "tablet";
  else if (/Mobi|Android/i.test(ua)) deviceType = "mobile";

  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";
  else if (/MSIE|Trident/.test(ua)) browser = "IE";

  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, os, deviceType };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      device_id = null,
      session_id,
      event_type,
      page_path,
      page_title = null,
      element_selector = null,
      element_text = null,
      duration_ms = null,
      referrer = null,
    } = body as Record<string, unknown>;

    if (
      typeof session_id !== "string" || !session_id ||
      typeof event_type !== "string" || !VALID_EVENT_TYPES.has(event_type) ||
      typeof page_path !== "string" || !page_path
    ) {
      return new Response(JSON.stringify({ error: "Invalid event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim() || "unknown";
    const ua = req.headers.get("user-agent") || "";
    const ipHash = await sha256Hex(IP_SALT + ip);
    const isBot = BOT_UA_REGEX.test(ua);
    const { browser, os, deviceType } = parseUserAgent(ua);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let visitorId: string | null = null;
    const hasDeviceId = typeof device_id === "string" && device_id.length > 0;

    if (hasDeviceId) {
      const { data } = await supabase.from("visitors").select("id").eq("device_id", device_id).maybeSingle();
      if (data) visitorId = data.id;
    } else {
      // No client-side device id (e.g. a bot that never runs JS) — group purely by
      // hashed IP among other device-less rows, so we don't merge a bot's traffic
      // into a real visitor's history just because they share a network.
      const { data } = await supabase.from("visitors").select("id").eq("ip_hash", ipHash).is("device_id", null).maybeSingle();
      if (data) visitorId = data.id;
    }

    if (visitorId) {
      if (event_type === "page_view") {
        await supabase.rpc("touch_visitor", { p_visitor_id: visitorId });
      } else {
        await supabase.from("visitors").update({ last_seen: new Date().toISOString() }).eq("id", visitorId);
      }
    } else {
      const { data } = await supabase
        .from("visitors")
        .insert({
          device_id: typeof device_id === "string" ? device_id : null,
          ip_hash: ipHash,
          user_agent: ua,
          browser,
          os,
          device_type: deviceType,
          is_bot: isBot,
        })
        .select("id")
        .single();
      visitorId = data?.id ?? null;
    }

    await supabase.from("pulses").insert({
      visitor_id: visitorId,
      session_id,
      event_type,
      page_path,
      page_title,
      element_selector,
      element_text,
      duration_ms: typeof duration_ms === "number" ? Math.round(duration_ms) : null,
      referrer,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pulse error:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
