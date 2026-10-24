import { whatsappNumber } from "./normalize";

// Hand-off links. Each one opens the normal app with the message filled in;
// you still press Send yourself, so none of these count as a delivery.

/** Gmail's compose screen in the browser, signed in as whoever is signed in. */
export function gmailComposeUrl(to: string, subject: string, body: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function mailtoUrl(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** wa.me chat link with the text prefilled, or null if the number can't take WhatsApp. */
export function whatsappUrl(phone: string | null | undefined, text: string) {
  const number = whatsappNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

/** "@dealer", "dealer" or a full URL → the profile URL, or null if it isn't a handle. */
export function instagramUrl(handle: string | null | undefined) {
  const h = (handle ?? "").trim();
  if (!h) return null;
  if (/^https?:\/\/(www\.)?instagram\.com\//i.test(h)) return h;
  const user = h.replace(/^@/, "").replace(/^(www\.)?instagram\.com\//i, "").split(/[/?#]/)[0];
  return /^[A-Za-z0-9._]{1,30}$/.test(user) ? `https://www.instagram.com/${user}/` : null;
}

/** Makes "dealer.co.ke" clickable without trusting odd schemes like javascript:. */
export function externalUrl(value: string | null | undefined) {
  const v = (value ?? "").trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : /^[a-z][a-z0-9+.-]*:/i.test(v) ? null : `https://${v}`;
  if (!withScheme) return null;
  try {
    const url = new URL(withScheme);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
