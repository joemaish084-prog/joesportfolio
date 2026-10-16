// Confirms an anonymous visitor can't touch any Client Hub table.
// Uses only the public (publishable) key from .env, exactly what a visitor has.
//   node scripts/check-hub-rls.mjs
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const tables = [
  "user_roles",
  "client_types",
  "clients",
  "client_kpis",
  "onboarding_templates",
  "onboarding_items",
  "documents",
  "work_log",
  "reports",
  "report_metrics",
  "invoices",
  "payments",
  "expenses",
  "leads",
];
let leaks = 0;

for (const table of tables) {
  const read = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
  const write = await fetch(`${url}/rest/v1/${table}`, { method: "POST", headers, body: "{}" });
  const blocked = (r) => r.status === 401 || r.status === 403;
  const ok = blocked(read) && blocked(write);
  if (!ok) leaks++;
  console.log(`${ok ? "BLOCKED" : "OPEN!! "}  ${table.padEnd(22)} read ${read.status}  write ${write.status}`);
}

const rpc = await fetch(`${url}/rest/v1/rpc/is_hub_admin`, { method: "POST", headers, body: "{}" });
console.log(`${rpc.status === 401 || rpc.status === 403 ? "BLOCKED" : "OPEN!! "}  rpc is_hub_admin        ${rpc.status}`);

const file = await fetch(`${url}/storage/v1/object/public/hub-documents/test.pdf`);
console.log(`${file.status >= 400 ? "BLOCKED" : "OPEN!! "}  public file URL        ${file.status}`);

console.log(leaks ? `\n${leaks} table(s) readable or writable anonymously.` : "\nAnonymous access is denied on every hub table.");
process.exit(leaks ? 1 : 0);
