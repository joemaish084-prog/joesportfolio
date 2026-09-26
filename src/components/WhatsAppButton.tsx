import { motion } from "framer-motion";
import { trackConversion } from "@/lib/analytics";

const WHATSAPP_NUMBER = "254704700160";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi Joseph! I visited josephmaina.co.ke and I'd like to chat."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.352.615 4.646 1.783 6.666L2.667 29.333l6.83-1.756a13.27 13.27 0 0 0 6.507 1.756h.006c7.362 0 13.333-5.97 13.333-13.333 0-3.562-1.387-6.912-3.905-9.43a13.246 13.246 0 0 0-9.434-3.903Zm0 24.4h-.005a11.07 11.07 0 0 1-5.64-1.545l-.405-.24-4.053 1.042 1.082-3.951-.264-.406a11.04 11.04 0 0 1-1.69-5.892c0-6.114 4.977-11.09 11.093-11.09a11.02 11.02 0 0 1 7.844 3.25 11.02 11.02 0 0 1 3.248 7.847c-.002 6.114-4.98 11.985-11.21 11.985Zm6.09-8.302c-.334-.167-1.974-.974-2.28-1.085-.306-.112-.528-.167-.75.167-.223.334-.862 1.085-1.057 1.307-.194.223-.389.25-.723.084-.334-.167-1.409-.52-2.684-1.657-.992-.885-1.663-1.978-1.858-2.312-.194-.334-.02-.514.147-.68.15-.15.334-.39.5-.585.167-.195.223-.334.334-.557.111-.223.056-.418-.028-.585-.083-.167-.75-1.807-1.028-2.474-.271-.65-.546-.562-.75-.573l-.64-.011a1.226 1.226 0 0 0-.889.417c-.306.334-1.167 1.14-1.167 2.78 0 1.64 1.195 3.226 1.362 3.448.167.223 2.352 3.593 5.698 5.038.796.344 1.418.55 1.902.703.799.254 1.527.218 2.102.132.641-.096 1.974-.807 2.252-1.586.278-.78.278-1.447.195-1.586-.083-.14-.306-.223-.64-.39Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackConversion("Contact")}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-elegant flex items-center justify-center hover:shadow-lg transition-shadow"
      aria-label="Message me on WhatsApp"
    >
      <WhatsAppIcon />
    </motion.a>
  );
}
