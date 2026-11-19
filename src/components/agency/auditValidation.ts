import { z } from "zod";
import { auditBudgets } from "@/data/agencyHome";

export function normalizeKenyanPhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  const match = /^(?:0|(?:\+|00)?254)([17]\d{8})$/.exec(compact);
  return match ? `+254${match[1]}` : null;
}

export const auditSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  phone: z.string().refine(value => normalizeKenyanPhone(value) !== null, {
    message: "Enter a Kenyan mobile number such as 0712 345 678 or +254 712 345 678.",
  }),
  business: z.string().trim().min(1, "Enter your business name.").max(120),
  budget: z.string().refine(value => auditBudgets.some(budget => budget === value), "Select a budget range."),
  website: z.string().optional(),
});

export type AuditFields = z.infer<typeof auditSchema>;
