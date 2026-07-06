import { defineMcp } from "@lovable.dev/mcp-js";
import getBio from "./tools/get-bio";
import listServices from "./tools/list-services";
import getContact from "./tools/get-contact";

export default defineMcp({
  name: "joseph-maina-mcp",
  title: "Joseph Maina Portfolio MCP",
  version: "0.1.0",
  instructions:
    "Tools for Joseph Maina's digital marketing portfolio. Use `get_bio` for a short bio, `list_services` for the services offered, and `get_contact` for public contact info.",
  tools: [getBio, listServices, getContact],
});
