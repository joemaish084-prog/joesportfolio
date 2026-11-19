import type { Database } from "@/integrations/supabase/types";
import { getAttribution, leadSource } from "@/lib/attribution";
import { track } from "@/lib/track";

const EMAILJS_SERVICE_ID = "service_ae81bbn";
const EMAILJS_TEMPLATE_ID = "template_rnofd4m";
const EMAILJS_PUBLIC_KEY = "2H5maWozuCEEd6vtl";

export async function saveAgencyLead(
  lead: Pick<Database["public"]["Tables"]["agency_leads"]["Insert"],
    "name" | "email" | "phone" | "business_name" | "service_interest" | "budget_range" | "goals">,
  location: "agency_brief" | "agency_audit",
) {
  const attribution = getAttribution();
  const source = leadSource(attribution);
  const { supabase } = await import("@/integrations/supabase/client");
  const { error } = await supabase.from("agency_leads").insert({ ...lead, source });
  if (error) throw error;

  track("generate_lead", { form_location: location, service: lead.service_interest });
  try {
    const { default: emailjs } = await import("@emailjs/browser");
    const lines = [
      location === "agency_audit" ? "New Free Audit Request" : "New Agency Brief",
      "",
      `Name: ${lead.name}`,
      ...(lead.email ? [`Email: ${lead.email}`] : []),
      `Phone: ${lead.phone || "Not provided"}`,
      `Brand: ${lead.business_name}`,
      `Service: ${lead.service_interest}`,
      `Budget: ${lead.budget_range}`,
      `Source: ${source}`,
      `First page: ${attribution.landing}`,
      ...(lead.goals ? ["", "Goals:", lead.goals] : []),
    ];
    void emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: lead.name,
      from_email: lead.email ?? "joemaish084@gmail.com",
      message: lines.join("\n"),
      to_name: "Joseph Maina",
    }, EMAILJS_PUBLIC_KEY).catch(error => console.error("Agency notification failed", error));
  } catch (error) {
    console.error("Agency notification failed", error);
  }
}
