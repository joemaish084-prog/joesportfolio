import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CVViewerProps {
  open: boolean;
  onClose: () => void;
}

const experience = [
  {
    company: "iClear Welllife Service Limited",
    role: "Assistant Marketing Supervisor / Digital Marketing Specialist",
    period: "May 2025 – Present",
    location: "Nairobi, Kenya",
    bullets: [
      "Co-led end-to-end marketing strategy and execution across social and digital, contributing to 80% growth in brand visibility and engagement.",
      "Owned planning, execution, and optimization of 12+ integrated promotional campaigns, driving a 25% increase in brand reach and measurable ROI.",
      "Managed Meta and TikTok ad campaigns from creative brief to performance reporting.",
      "Built and managed paid and organic experimentation across creative assets, ASO, and landing pages.",
      "Introduced AI-powered marketing workflows (ChatGPT, Gemini) to streamline ideation and content production.",
      "Directed end-to-end content production (video, graphics, copy), ensuring brand alignment with business objectives.",
    ],
  },
  {
    company: "Convey Communications",
    role: "Digital Creative Lead",
    period: "Jan 2025 – Present",
    location: "Nairobi, Kenya",
    bullets: [
      "Led creative direction and digital strategy for the 'Convey with Caroline' podcast — brand identity, tone, audience growth, and platform expansion.",
      "Designed and executed multi-platform promotional campaigns including reels, teasers, thumbnails, and branded content.",
      "Owned full multimedia production lifecycle: concept, filming, editing, sound design, and post-production.",
    ],
  },
  {
    company: "Convey Communications",
    role: "Creative Digital Officer",
    period: "Feb 2024 – May 2025",
    location: "Nairobi, Kenya",
    bullets: [
      "Delivered 30+ multimedia assets across internal brand initiatives and client campaigns.",
      "Achieved 15% increase in engagement and brand visibility through analytics-led content improvements.",
      "Supported senior leadership in campaign ideation, execution, and optimization across digital and social channels.",
    ],
  },
  {
    company: "County Government of Nyeri",
    role: "Communications Intern",
    period: "May 2023 – Aug 2023",
    location: "Nyeri, Kenya",
    bullets: [
      "Supported public communications through content creation, field interviews, digital storytelling, and social strategy.",
      "Assisted in script development, live broadcast setup, and multimedia production for community engagement.",
    ],
  },
];

const skills = [
  { name: "SEO Optimization", value: 90 },
  { name: "Meta Ads", value: 88 },
  { name: "TikTok Ads", value: 85 },
  { name: "Content Strategy", value: 87 },
  { name: "Social Media Management", value: 88 },
  { name: "Brand Strategy", value: 85 },
  { name: "Google Analytics", value: 85 },
  { name: "Video Production", value: 80 },
];

const education = [
  {
    school: "Multimedia University of Kenya",
    degree: "Bachelor's Degree, Journalism & Digital Media",
    period: "2020 – 2024",
  },
];

const certifications = [
  "Google Digital Marketing & E-commerce — Coursera",
  "Meta Certified Digital Marketing Associate",
  "HubSpot Content Marketing Certification",
  "Google Analytics (GA4) Certification",
];

export function CVViewer({ open, onClose }: CVViewerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handlePrint = () => window.print();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm overflow-y-auto print:bg-white print:static print:overflow-visible"
          role="dialog"
          aria-modal="true"
          aria-label="Resume viewer"
        >
          {/* Top toolbar */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border print:hidden">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-display font-bold">
                <span className="text-foreground">Joseph</span>
                <span className="text-primary"> Maina</span>
                <span className="text-muted-foreground hidden sm:inline"> · Resume</span>
              </h2>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="bg-primary text-primary-foreground">
                  <a href="/Joseph_Isaac_Maina_Resume.pdf" download="Joseph Isaac Maina Resume.pdf">
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close resume">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="container mx-auto max-w-4xl px-4 sm:px-8 py-8 sm:py-12 print:max-w-none print:py-4"
          >
            <article className="bg-card border border-border rounded-2xl shadow-elegant p-6 sm:p-10 print:shadow-none print:border-0 print:rounded-none print:bg-white print:text-black">
              {/* Header */}
              <header className="border-b border-border pb-6 mb-6">
                <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
                  Joseph Maina
                </h1>
                <p className="text-lg sm:text-xl text-primary font-medium mt-1">
                  Digital Marketing Specialist
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground print:text-gray-700">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Nairobi, Kenya</span>
                  <a href="mailto:hello@josephmaina.co.ke" className="inline-flex items-center gap-1.5 hover:text-primary"><Mail className="h-4 w-4" /> hello@josephmaina.co.ke</a>
                  <a href="tel:+254700000000" className="inline-flex items-center gap-1.5 hover:text-primary"><Phone className="h-4 w-4" /> +254 700 000 000</a>
                  <a href="https://joesportfolio.lovable.app" className="inline-flex items-center gap-1.5 hover:text-primary"><Globe className="h-4 w-4" /> joesportfolio.lovable.app</a>
                </div>
              </header>

              {/* Summary */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                  Professional Summary
                </h2>
                <p className="text-base leading-relaxed text-foreground/90 print:text-black">
                  Results-driven Digital Marketing Specialist with hands-on experience in SEO,
                  Meta Ads, TikTok advertising, content strategy, and brand storytelling.
                  Proven track record of managing campaigns that deliver measurable growth
                  for brands in Kenya — blending data, creativity, and AI-powered workflows.
                </p>
              </section>

              {/* Experience */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4 inline-flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Work Experience
                </h2>
                <div className="space-y-6 relative">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-border print:hidden" aria-hidden />
                  {experience.map((job, i) => (
                    <div key={i} className="relative pl-8 print:pl-0">
                      <span className="absolute left-1 top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-background print:hidden" aria-hidden />
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <h3 className="text-base font-semibold">{job.role}</h3>
                        <span className="text-xs text-muted-foreground print:text-gray-600">{job.period}</span>
                      </div>
                      <p className="text-sm text-primary mt-0.5">{job.company} · <span className="text-muted-foreground">{job.location}</span></p>
                      <ul className="mt-3 space-y-1.5 text-sm text-foreground/85 print:text-black list-disc pl-5">
                        {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Skills */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                  Core Skills
                </h2>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {skills.map((s) => (
                    <div key={s.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground print:text-gray-600">{s.value}%</span>
                      </div>
                      <Progress value={s.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3 inline-flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Education
                </h2>
                {education.map((e, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div>
                      <h3 className="font-semibold">{e.school}</h3>
                      <p className="text-sm text-muted-foreground print:text-gray-700">{e.degree}</p>
                    </div>
                    <span className="text-xs text-muted-foreground print:text-gray-600">{e.period}</span>
                  </div>
                ))}
              </section>

              {/* Certifications */}
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3 inline-flex items-center gap-2">
                  <Award className="h-4 w-4" /> Certifications
                </h2>
                <ul className="grid sm:grid-cols-2 gap-y-1.5 gap-x-8 text-sm list-disc pl-5">
                  {certifications.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </section>
            </article>

            <p className="text-center text-xs text-muted-foreground mt-6 print:hidden">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted">Esc</kbd> to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
