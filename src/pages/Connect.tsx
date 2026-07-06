import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const mcpUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mcp`;

export default function Connect() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-orange text-white">
            <Bot className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Agent integrations
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
          Connect your AI assistant
        </h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Add this site to ChatGPT or Claude so your AI assistant can answer
          questions about Joseph's services, bio, and how to get in touch.
        </p>

        {/* MCP URL */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
            Server URL
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <code className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm font-mono break-all">
              {mcpUrl}
            </code>
            <Button onClick={copy} variant="gradient" size="lg" className="shrink-0">
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy URL
                </>
              )}
            </Button>
          </div>
        </section>

        {/* ChatGPT */}
        <section className="mb-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">
            Connect from ChatGPT
          </h2>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
            <li>
              Open{" "}
              <a
                href="https://chatgpt.com/#settings/Connectors/Advanced"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                chatgpt.com/#settings/Connectors/Advanced
              </a>{" "}
              and turn on Developer mode (read the risk notice shown there).
            </li>
            <li>In the chat composer, open the "+" menu and enable Developer mode.</li>
            <li>Click <span className="text-foreground">Add sources</span>, then <span className="text-foreground">Connect more</span>.</li>
            <li>Give the connector a name and paste the server URL above.</li>
            <li>Start a new chat and ask ChatGPT to use it.</li>
          </ol>
        </section>

        {/* Claude */}
        <section className="mb-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">
            Connect from Claude
          </h2>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
            <li>
              Open{" "}
              <a
                href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                claude.ai/customize/connectors
              </a>
              .
            </li>
            <li>Give the connector a name and paste the server URL above.</li>
            <li>Enable the connector from the chat composer, then ask Claude to use it.</li>
          </ol>
        </section>

        <p className="text-sm text-muted-foreground">
          Once connected, your assistant can look up Joseph's bio, list of
          services, and public contact info on demand.
        </p>
      </div>
    </main>
  );
}
