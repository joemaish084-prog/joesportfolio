import type { PortalBusiness } from "./types";

// Your contact details as the client sees them. The hub's business settings win
// when they're set; otherwise these are the same public details the website uses.

const FALLBACK = {
  name: "Joseph Maina",
  phone: "+254 704 700 160",
  email: "joemaish084@gmail.com",
  location: "Nairobi, Kenya",
};

/** Kenyan numbers in any common spelling (07…, 7…, +254…, 254…) as plain 2547… digits. */
export function whatsappDigits(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  else if (digits.length === 9 && /^[17]/.test(digits)) digits = `254${digits}`;
  return digits;
}

export function contactFor(business: PortalBusiness) {
  const name = business.name?.trim() || FALLBACK.name;
  const phone = business.phone?.trim() || FALLBACK.phone;
  return {
    name,
    firstName: name.split(/\s+/)[0]!,
    phone,
    email: business.email?.trim() || FALLBACK.email,
    location: business.location?.trim() || FALLBACK.location,
    tel: `tel:+${whatsappDigits(phone)}`,
    whatsapp: (text: string) => `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(text)}`,
  };
}
