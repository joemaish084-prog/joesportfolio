import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CVViewerProps {
  open: boolean;
  onClose: () => void;
}

const experience = [
  {
    company: "iClear Welllife Service Limited",
    role: "Digital Marketing Specialist / Asst. Marketing Supervisor",
    period: "May 2025 – Present",
    location: "Nairobi, Kenya",
    bullets: [
      "Planned and executed a full-year integrated digital marketing campaign across TikTok, Instagram, LinkedIn, Facebook, and YouTube — producing 336 pieces of content (142 videos + 194 static posts).",
      "Generated 4M+ total TikTok video views and 2.5M+ Instagram video views through a video-first content strategy, with top single videos reaching 104K views on TikTok.",
      "Achieved 704K Instagram reach and 103% growth in Instagram video views, with link clicks growing 179% — directly supporting lead and traffic objectives.",
      "Led 12+ integrated campaigns including a TECNO co-brand promotion and Kilimall e-commerce activation, contributing to 80% brand visibility growth and 25% increase in brand reach.",
      "Built and managed organic and paid experimentation frameworks, refining campaigns in real time based on performance data.",
      "Introduced AI-powered content workflows (ChatGPT, Gemini, n8n) to accelerate ideation and production pipelines while maintaining brand consistency.",
      "Reported campaign effectiveness with data-driven insights translated into clear recommendations for leadership.",
    ],
  },
  {
    company: "Convey Communications",
    role: "Digital Creative Lead",
    period: "Jan 2025 – May 2025",
    location: "Nairobi, Kenya",
    bullets: [
      "Led complete brand identity, digital strategy, and multi-platform content distribution for the 'Convey with Caroline' podcast — building audience engagement from zero through community-first storytelling.",
      "Designed and executed multi-platform campaigns (reels, teasers, branded content) with consistent visual identity across Instagram, LinkedIn, TikTok, and YouTube.",
      "Owned influencer and media outreach strategy to amplify reach and build collaborative content opportunities.",
      "Managed full production lifecycle: concept development, filming, editing, sound design, and post-production.",
    ],
  },
  {
    company: "Convey Communications",
    role: "Creative Digital Officer",
    period: "Feb 2024 – Jan 2025",
    location: "Nairobi, Kenya",
    bullets: [
      "Delivered 30+ multimedia assets across internal brand initiatives and client campaigns, achieving a 15% uplift in engagement through data-informed content improvements.",
      "Supported campaign ideation, execution, and optimization across digital and social channels for multiple brand clients.",
      "Translated performance analytics into actionable content strategy adjustments, iterating rapidly based on audience insights.",
    ],
  },
  {
    company: "County Government of Nyeri",
    role: "Communications Intern",
    period: "May 2023 – Aug 2023",
    location: "Nyeri, Kenya",
    bullets: [
      "Produced digital content, conducted field interviews, and ran social media campaigns for large-scale public engagement initiatives.",
      "Built early experience in reputation management and community communication.",
    ],
  },
];

const keyProject = {
  title: "Convey with Caroline Podcast — Brand & Growth Lead",
  period: "Jan 2025 – Present",
  bullets: [
    "Built the brand's entire digital identity and content ecosystem from scratch: visual language, tone of voice, platform strategy, and community engagement model.",
    "Grew audience engagement through consistent, high-quality storytelling and platform-optimized content distribution across Instagram, YouTube, and TikTok.",
    "Demonstrated core digital marketing skills: narrative framing, audience building, and growth through owned and earned channels.",
  ],
};

const coreSkills = [
  "Digital Marketing Strategy",
  "Social Media Management (LinkedIn, Instagram, TikTok, Facebook, YouTube, X)",
  "Content Calendar Development",
  "Platform-Specific Copywriting",
  "Influencer Briefing & Management",
  "Earned & Owned Channel Strategy",
  "Community Building",
  "Campaign Analytics & Reporting",
  "Video Production & Editing",
  "AI-Powered Content Workflows (ChatGPT, Gemini, n8n)",
  "Crisis Communications Support",
  "Adobe Creative Suite",
  "Canva",
  "Meta Ads Manager",
  "Google Analytics",
];

const tools = [
  "Adobe Premiere", "Adobe Photoshop", "Canva", "Meta Ads Manager", "Google Ads",
  "Google Analytics", "Buffer", "Later", "ChatGPT", "Gemini", "n8n",
  "Instagram", "LinkedIn", "TikTok", "Facebook", "YouTube", "X (Twitter)",
  "Video Production & Editing", "Press Release Writing", "Campaign Analytics", "Workflow Automation",
];

const education = [
  {
    school: "The Technical University of Kenya",
    degree: "Diploma in Journalism & Mass Communication (Broadcast)",
    period: "Dec 2023",
    extras: "Multimedia Storytelling · Digital Production · Broadcast Journalism",
  },
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
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col print:bg-white print:static print:block"
          role="dialog"
          aria-modal="true"
          aria-label="Resume viewer"
        >
          {/* Top toolbar */}
          <div className="shrink-0 bg-background/90 backdrop-blur border-b border-border print:hidden">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-display font-bold truncate">
                <span className="text-foreground">Joseph Isaac</span>
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
            className="container mx-auto max-w-4xl px-4 sm:px-8 py-6 sm:py-12 print:max-w-none print:py-4"
          >
            <article className="bg-card border border-border rounded-2xl shadow-elegant p-6 sm:p-10 print:shadow-none print:border-0 print:rounded-none print:bg-white print:text-black">
              {/* Header */}
              <header className="border-b border-border pb-6 mb-6">
                <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
                  Joseph Isaac Maina
                </h1>
                <p className="text-base sm:text-lg text-primary font-medium mt-1 italic">
                  Digital Marketing &amp; Growth · Content Strategy · Brand Storytelling
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground print:text-gray-700">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Nairobi, Kenya</span>
                  <a href="tel:+254704700160" className="inline-flex items-center gap-1.5 hover:text-primary"><Phone className="h-4 w-4" /> 0704 700 160</a>
                  <a href="mailto:joemaish084@gmail.com" className="inline-flex items-center gap-1.5 hover:text-primary"><Mail className="h-4 w-4" /> joemaish084@gmail.com</a>
                  <a href="https://joesportfolio.lovable.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary"><Globe className="h-4 w-4" /> joesportfolio.lovable.app</a>
                </div>
              </header>

              {/* Summary */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                  Professional Profile
                </h2>
                <p className="text-base leading-relaxed text-foreground/90 print:text-black">
                  Results-driven digital marketing and communications professional with 3+ years of hands-on experience
                  building integrated campaigns across social media, content strategy, and community-driven storytelling.
                  Proven ability to develop platform-specific content, manage multi-channel distribution at scale, and
                  translate brand narratives into measurable digital impact. Experienced in agency-adjacent environments
                  supporting brands across multiple sectors. Strong writing skills, deep platform fluency, and a data-first
                  approach to campaign optimization.
                </p>
              </section>

              {/* Core Skills */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                  Core Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {coreSkills.map((s) => (
                    <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-foreground/90 border border-primary/20 print:bg-gray-100 print:text-black print:border-gray-300">
                      {s}
                    </span>
                  ))}
                </div>
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

              {/* Key Project */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3 inline-flex items-center gap-2">
                  <Star className="h-4 w-4" /> Key Project
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h3 className="text-base font-semibold">{keyProject.title}</h3>
                  <span className="text-xs text-muted-foreground print:text-gray-600">{keyProject.period}</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground/85 print:text-black list-disc pl-5">
                  {keyProject.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </section>

              {/* Education */}
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3 inline-flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Education
                </h2>
                {education.map((e, i) => (
                  <div key={i}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <div>
                        <h3 className="font-semibold">{e.school}</h3>
                        <p className="text-sm text-muted-foreground print:text-gray-700">{e.degree}</p>
                      </div>
                      <span className="text-xs text-muted-foreground print:text-gray-600">{e.period}</span>
                    </div>
                    {e.extras && (
                      <p className="text-xs text-muted-foreground mt-1 print:text-gray-600">{e.extras}</p>
                    )}
                  </div>
                ))}
              </section>

              {/* Tools */}
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3 inline-flex items-center gap-2">
                  <Award className="h-4 w-4" /> Tools &amp; Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tools.map((t) => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-md bg-muted text-foreground/85 print:bg-gray-100 print:text-black">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs italic text-muted-foreground mt-6 print:text-gray-600">
                  References available upon request.
                </p>
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
