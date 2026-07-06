import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_contact",
  title: "Get contact info",
  description: "Returns Joseph Maina's public contact information and links to book a free audit.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "Website: https://josephmaina.co.ke",
          "Location: Nairobi, Kenya",
          "Book a free audit via the contact form on the website.",
        ].join("\n"),
      },
    ],
  }),
});
