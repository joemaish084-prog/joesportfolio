import { endOfMonth, format } from "date-fns";
import type { PortalSnapshot } from "./types";

// A believable e-commerce client, for previewing the portal without a database.
// Reached only in development, with /portal?demo (see isDemo in api.ts).

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Feb to Oct 2026
const iso = (d: Date) => format(d, "yyyy-MM-dd");

const SERIES = {
  Revenue: [620000, 690000, 760000, 850000, 910000, 1050000, 1180000, 1310000, 1460000],
  Orders: [142, 158, 171, 190, 203, 231, 254, 280, 309],
  ROAS: [2.4, 2.7, 3.0, 3.3, 3.4, 3.9, 4.1, 4.4, 4.8],
  "Cost per purchase": [410, 385, 360, 340, 330, 300, 285, 270, 255],
  "Ad spend": [258000, 255000, 253000, 258000, 268000, 269000, 288000, 298000, 304000],
} as const;

const SUMMARIES = [
  "First full month. Meta and Google campaigns live, tracking verified.",
  "Retargeting added for cart abandoners. Orders up 11%.",
  "Launched the PlayStation bundle creatives, strongest month for ROAS so far.",
  "Moved budget from low-intent audiences to lookalikes of repeat buyers.",
  "Stable month. Holiday-season creative planning started.",
  "New product catalogue ads went live. Cost per purchase dropped below KES 300.",
  "Added Google Performance Max. Revenue passed KES 1.1M for the first time.",
  "Scaled the two best ad sets by 30%. ROAS held above 4.",
  "Best month yet: KES 1.46M revenue at a 4.8 ROAS.",
];

const base = { client_id: "demo-client" };

function build(): PortalSnapshot {
  const kpiNames = Object.keys(SERIES) as (keyof typeof SERIES)[];
  const kpis = kpiNames.map((name, i) => ({
    ...base,
    id: `kpi-${i}`,
    name,
    unit: (name === "Revenue" || name === "Cost per purchase" || name === "Ad spend" ? "kes" : "number") as "kes" | "number",
    target: name === "Revenue" ? 2000000 : name === "ROAS" ? 6 : name === "Cost per purchase" ? 200 : null,
    sort_order: i * 10,
  }));

  const reports = MONTHS.map((m, i) => {
    const start = new Date(2026, m, 1);
    return {
      ...base,
      id: `rep-${i}`,
      title: `${format(start, "MMMM yyyy")} performance report`,
      period_start: iso(start),
      period_end: iso(endOfMonth(start)),
      summary: SUMMARIES[i],
      document_id: i >= 6 ? `doc-rep-${i}` : null,
      created_at: iso(endOfMonth(start)),
    };
  });

  const report_metrics = reports.flatMap((r, i) =>
    kpis.map((k) => ({ id: `${r.id}-${k.id}`, report_id: r.id, client_kpi_id: k.id, value: SERIES[k.name as keyof typeof SERIES][i] })),
  );

  const work: PortalSnapshot["work"] = [
    ["2026-10-24", "Scaled the two best-performing ad sets by 30%", "ads"],
    ["2026-10-20", "Shot and edited 6 short videos for the festive campaign", "content"],
    ["2026-10-14", "Rebuilt the product catalogue feed and fixed 41 disapproved items", "ads"],
    ["2026-10-08", "Monthly strategy call and budget review", "meeting"],
    ["2026-10-03", "September performance report delivered", "reporting"],
    ["2026-09-26", "Launched Performance Max campaign for top 20 products", "ads"],
    ["2026-09-18", "Landing page speed fixes, load time cut from 4.8s to 2.1s", "web"],
    ["2026-09-11", "Designed 12 carousel ads for new arrivals", "design"],
    ["2026-09-04", "Set up conversion tracking for WhatsApp orders", "ads"],
    ["2026-08-27", "Product photography direction for the gaming range", "content"],
    ["2026-08-15", "Audience refresh: lookalikes from 6 months of buyers", "ads"],
    ["2026-08-02", "July performance report delivered", "reporting"],
    ["2026-07-22", "Homepage banner and offer pages redesigned", "design"],
    ["2026-07-09", "Retargeting sequence for abandoned carts, 3 touchpoints", "ads"],
  ].map(([worked_on, title, category], i) => ({
    id: `work-${i}`,
    worked_on,
    title,
    details: null,
    category: category as PortalSnapshot["work"][number]["category"],
  }));

  const milestones: PortalSnapshot["milestones"] = [
    { title: "Tracking and pixels verified", description: "Purchase and add-to-cart events firing correctly.", due: "2026-02-20", status: "done" },
    { title: "First campaigns live", description: "Meta and Google Search launched.", due: "2026-03-05", status: "done" },
    { title: "Catalogue ads", description: "Dynamic product ads from the Shopify catalogue.", due: "2026-06-10", status: "done" },
    { title: "Performance Max rollout", description: "Google PMax for the top 20 products.", due: "2026-09-30", status: "done" },
    { title: "Festive season campaign", description: "Creative, offers and budget plan for Nov to Dec.", due: "2026-11-10", status: "in_progress" },
    { title: "Email and WhatsApp automation", description: "Abandoned cart and win-back flows.", due: "2026-12-05", status: "planned" },
    { title: "Q1 2027 growth plan", description: "Targets and budget for the new year.", due: "2027-01-15", status: "planned" },
  ].map((m, i) => ({
    id: `ms-${i}`,
    title: m.title,
    description: m.description,
    due_date: m.due,
    status: m.status as PortalSnapshot["milestones"][number]["status"],
    completed_at: m.status === "done" ? `${m.due}T09:00:00Z` : null,
    sort_order: i * 10,
  }));

  const updates: PortalSnapshot["updates"] = [
    {
      id: "up-1",
      kind: "action",
      title: "Send your festive-season product photos",
      body: "We need 15 to 20 clean product shots of the gaming range by 5 November so the creatives are ready for launch.",
      link_url: null,
      resolved_at: null,
      created_at: "2026-10-25T08:00:00Z",
    },
    {
      id: "up-2",
      kind: "update",
      title: "October is your best month yet",
      body: "Revenue reached KES 1.46M at a 4.8 ROAS. The scaled ad sets are holding their cost per purchase, so we'll keep pushing in November.",
      link_url: null,
      resolved_at: null,
      created_at: "2026-10-24T08:00:00Z",
    },
    {
      id: "up-3",
      kind: "update",
      title: "Performance Max is learning",
      body: "Google needs about two weeks to settle. Early signals are good, no changes needed from you.",
      link_url: null,
      resolved_at: null,
      created_at: "2026-09-28T08:00:00Z",
    },
  ];

  const invoices: PortalSnapshot["invoices"] = MONTHS.slice(3).map((m, i) => {
    const issue = new Date(2026, m, 1);
    return {
      ...base,
      id: `inv-${i}`,
      number: `INV-2026-${String(i + 4).padStart(3, "0")}`,
      title: `${format(issue, "MMMM")} retainer`,
      issue_date: iso(issue),
      due_date: iso(new Date(2026, m, 15)),
      line_items: [
        { description: "Ad management and optimisation", quantity: 1, unit_price: 45000 },
        { description: "Creative and reporting", quantity: 1, unit_price: 15000 },
      ],
      amount: 60000,
      currency: "KES",
      status: "sent" as const,
      document_id: null,
    };
  });

  const payments: PortalSnapshot["payments"] = invoices.slice(0, -1).map((inv, i) => ({
    ...base,
    id: `pay-${i}`,
    invoice_id: inv.id,
    amount: 60000,
    paid_on: iso(new Date(2026, MONTHS[i + 3], 12)),
    method: "mpesa" as const,
    reference: `SGK${4200 + i}XYZ`,
  }));

  const documents: PortalSnapshot["documents"] = [
    ["Service agreement 2026", "contract", "signed", "2026-02-01"],
    ["Growth proposal", "proposal", "approved", "2026-01-20"],
    ["Brand guidelines and brief", "brief", "final", "2026-02-03"],
    ["Q4 media plan", "proposal", "sent", "2026-10-02"],
    ["October performance report", "report", "final", "2026-10-31"],
  ].map(([title, kind, status, created], i) => ({
    ...base,
    id: `doc-${i}`,
    kind: kind as PortalSnapshot["documents"][number]["kind"],
    title,
    status: status as PortalSnapshot["documents"][number]["status"],
    storage_path: `demo/${i}.pdf`,
    file_name: `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    mime_type: "application/pdf",
    size_bytes: 180000 + i * 40000,
    created_at: `${created}T09:00:00Z`,
  }));

  // The PDFs behind the three most recent reports.
  reports.slice(6).forEach((r) =>
    documents.push({
      ...base,
      id: r.document_id as string,
      kind: "report",
      title: r.title,
      status: "final",
      storage_path: `demo/${r.id}.pdf`,
      file_name: `${r.id}.pdf`,
      mime_type: "application/pdf",
      size_bytes: 420000,
      created_at: `${r.period_end}T09:00:00Z`,
    }),
  );

  return {
    client: {
      id: "demo-client",
      name: "Select Gadgets",
      business_name: "Select Gadgets Ltd",
      contact_person: "Amina Wanjiru",
      website: "https://selectgadgets.example",
      industry: "Consumer electronics",
      status: "active",
      start_date: "2026-02-01",
      services: ["Meta Ads", "Google Ads", "Content"],
      main_goal: "sales",
      currency: "KES",
      engagement_type: "retainer",
      end_date: null,
      monthly_fee: 60000,
      project_fee: null,
    },
    business: {
      name: "Joseph Maina",
      tagline: "Digital Marketing",
      location: "Nairobi, Kenya",
      phone: "+254 704 700 160",
      email: "joemaish084@gmail.com",
      website: "josephmaina.co.ke",
      kra_pin: "A000000000Z",
      mpesa_till: "123456",
      mpesa_paybill: "400200",
      mpesa_account: "SELECTGADGETS",
      bank_name: "Equity Bank",
      bank_account_name: "Joseph Maina",
      bank_account_number: "0100000000000",
    },
    settings: {
      modules: ["overview", "results", "reports", "work", "roadmap", "billing", "documents", "book", "help"],
      welcome_message: "Welcome to your growth dashboard. Everything we do together lives here, updated as it happens.",
      call_link: null,
    },
    me: { email: "amina@selectgadgets.example", full_name: "Amina Wanjiru", preview: false },
    kpis,
    reports,
    report_metrics,
    work,
    milestones,
    updates,
    invoices,
    payments,
    documents,
    messages: [],
  };
}

export const demoSnapshot = build();
