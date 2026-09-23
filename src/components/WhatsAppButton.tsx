import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "254704700160";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi Joseph! I visited josephmaina.co.ke and I'd like to chat."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export function WhatsAppButton() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-elegant flex items-center justify-center hover:shadow-lg transition-shadow"
      aria-label="Message me on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" fill="currentColor" strokeWidth={0} />
    </motion.a>
  );
}
