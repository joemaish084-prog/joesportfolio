import { useState } from "react";
import { Mail, Phone, Linkedin, Twitter, Instagram, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_ae81bbn";
const EMAILJS_TEMPLATE_ID = "template_rnofd4m";
const EMAILJS_PUBLIC_KEY = "2H5maWozuCEEd6vtl";

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSending, setIsSending] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name.trim(),
          from_email: formData.email.trim(),
          message: formData.message.trim(),
          to_name: "Joseph Maina",
        },
        EMAILJS_PUBLIC_KEY
      );

      toast({
        title: "✅ Message sent!",
        description: "I'll reply within 24 hours.",
      });
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    } catch (error) {
      console.error("EmailJS error:", error);
      toast({
        title: "❌ Something went wrong",
        description: "Please email me directly at joemaish084@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
              Let's <span className="text-gradient">Connect</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Have a project in mind? Let's discuss how we can work together
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-display font-semibold mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:joemaish084@gmail.com"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span>joemaish084@gmail.com</span>
                  </a>
                  <a
                    href="tel:0704700160"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <span>0704 700 160</span>
                  </a>
                  <a
                    href="https://wa.me/254704700160"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span>WhatsApp Me</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-display font-semibold mb-6">Follow Me</h3>
                <div className="flex gap-3">
                  <a
                    href="https://www.behance.net/joemaish"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Behance"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/joseph-isaac-m-33a9a611b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://x.com/Joemkush15"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="X"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/m_k_ush_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`h-12 ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`h-12 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: undefined });
                  }}
                  rows={6}
                  className={`resize-none ${errors.message ? "border-destructive" : ""}`}
                />
                {errors.message && (
                  <p className="text-sm text-destructive mt-1">{errors.message}</p>
                )}
              </div>
              <Button type="submit" size="lg" className="w-full shadow-elegant" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
