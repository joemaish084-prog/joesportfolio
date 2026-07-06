import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_bio",
  title: "Get Joseph Maina's bio",
  description: "Returns a short professional bio for Joseph Maina, Digital Marketing Specialist & Agency Owner based in Nairobi, Kenya.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "Joseph Maina — Digital Marketing Specialist & Agency Owner based in Nairobi, Kenya.",
          "Services: Meta Ads, Google Ads, TikTok Ads, SEO, Social Media Management, Media Buying.",
          "Focus: Kenyan and African brands — restaurants, e-commerce, real estate, startups, SMEs.",
          "Website: https://josephmaina.co.ke",
        ].join("\n"),
      },
    ],
  }),
});
