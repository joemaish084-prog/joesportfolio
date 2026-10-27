import Cal from "@calcom/embed-react";

// Loaded on demand (React.lazy) so the Cal.com embed never touches other pages.
export default function CalEmbed({
  calLink,
  theme,
  name,
  email,
}: {
  calLink: string;
  theme: "light" | "dark";
  name?: string;
  email?: string;
}) {
  return (
    <Cal
      namespace="portal"
      calLink={calLink}
      style={{ width: "100%", height: "100%", overflow: "auto" }}
      config={{ layout: "month_view", theme, ...(name ? { name } : {}), ...(email ? { email } : {}) }}
    />
  );
}
