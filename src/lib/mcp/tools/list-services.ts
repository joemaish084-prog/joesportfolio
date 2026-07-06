import { defineTool } from "@lovable.dev/mcp-js";

const SERVICES = [
  { name: "Meta Ads", description: "Facebook & Instagram advertising campaigns with a focus on ROAS." },
  { name: "Google Ads", description: "Search, Display, YouTube and Performance Max campaigns." },
  { name: "TikTok Ads", description: "TikTok advertising and creator-led performance campaigns." },
  { name: "SEO", description: "Local and technical SEO for Kenyan and African brands." },
  { name: "Social Media Management", description: "Content strategy, community management, and organic growth." },
  { name: "Media Buying", description: "Cross-platform paid media planning and buying." },
];

export default defineTool({
  name: "list_services",
  title: "List services",
  description: "Returns the list of digital marketing services Joseph offers.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(SERVICES, null, 2) }],
    structuredContent: { services: SERVICES },
  }),
});
