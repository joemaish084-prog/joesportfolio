import csrBaobabGroupPhoto from "@/assets/csr-baobab-group-photo.jpg";
import csrBaobabInstalledUnits from "@/assets/csr-baobab-installed-units.jpg";
import csrBaobabHandover from "@/assets/csr-baobab-handover.jpg";
import csrBaobabTeamHoodie from "@/assets/csr-baobab-team-hoodie.jpg";

export interface BlogSectionImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface BlogSection {
  id: string;
  heading: string;
  paragraphs: string[];
  image?: BlogSectionImage;
}

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  dateLabel: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: BlogSection[];
  thumbnail: string;
  thumbnailAlt: string;
}

export const AUTHOR = "Joseph Maina";

export const blogPosts: BlogPost[] = [
  {
    slug: "why-your-nairobi-business-isnt-showing-up-on-google-2026",
    category: "SEO",
    title: "Why Your Nairobi Business Isn't Showing Up on Google in 2026",
    excerpt: "Most Nairobi businesses are invisible on Google and don't know it.",
    date: "2026-06-10",
    dateLabel: "June 2026",
    readTime: "5 min read",
    metaTitle: "Why Your Nairobi Business Isn't Showing Up on Google in 2026",
    metaDescription:
      "The real reasons Nairobi businesses stay invisible on Google search, and the practical SEO fixes that get you ranking locally in 2026.",
    intro:
      "If customers in Nairobi search for what you sell and your business never appears, the problem is rarely the product. It is almost always a handful of technical and local search gaps that are cheap to fix once you know where to look.",
    thumbnail: "https://images.unsplash.com/photo-1741991110666-88115e724741?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Nairobi city skyline with modern high-rise buildings under a bright sky",

    sections: [
      {
        id: "google-business-profile",
        heading: "Your Google Business Profile is incomplete",
        paragraphs: [
          "Local search in Kenya is dominated by the map pack. If your profile is missing categories, service areas, working hours, or photos, Google has no reason to surface you above a competitor who filled everything in.",
          "Claim the profile, choose one precise primary category, add every service you actually deliver, and post at least twice a month. Reviews matter too: businesses with steady, recent reviews consistently outrank dormant listings.",
        ],
      },
      {
        id: "keywords",
        heading: "You are targeting the wrong keywords",
        paragraphs: [
          "Most sites optimise for how the business describes itself, not how customers search. Nobody in Westlands types 'integrated brand solutions'. They type 'branding company in Westlands' or 'company logo design Nairobi price'.",
          "Build your pages around the phrases customers actually use, including the neighbourhood or estate names where you operate.",
        ],
      },
      {
        id: "speed",
        heading: "Your site is too slow for Kenyan mobile networks",
        paragraphs: [
          "The majority of your traffic is mobile, often on inconsistent connections. A page that takes six seconds to load loses most of its visitors before they see anything.",
          "Compress images to modern formats, lazy load anything below the first screen, and keep third party scripts to a minimum. Speed is both a ranking factor and a conversion factor.",
        ],
      },
      {
        id: "content",
        heading: "You have no content answering real questions",
        paragraphs: [
          "Search engines reward sites that answer specific questions. Pricing guides, comparisons, and how-to articles built around genuine customer questions pull in traffic long after they are published.",
          "One well researched article per month beats a burst of thin pages published and abandoned.",
        ],
      },
    ],
  },
  {
    slug: "how-much-should-a-kenyan-sme-spend-on-meta-ads",
    category: "Meta Ads",
    title: "How Much Should a Kenyan SME Spend on Meta Ads?",
    excerpt: "My honest breakdown with real numbers from real campaigns.",
    date: "2026-06-24",
    dateLabel: "June 2026",
    readTime: "4 min read",
    metaTitle: "How Much Should a Kenyan SME Spend on Meta Ads?",
    metaDescription:
      "A practical Meta Ads budget guide for Kenyan SMEs, with realistic daily spend, testing budgets and the numbers to watch before scaling.",
    intro:
      "The honest answer is that there is no universal number, but there is a floor below which Meta cannot learn fast enough to be useful. Here is how I set budgets for small and medium businesses in Kenya.",
    thumbnail: "https://images.unsplash.com/photo-1675352162363-ac40c3bb8265?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Close-up of a smartphone screen showing the Facebook app",

    sections: [
      {
        id: "floor",
        heading: "Start with a learning floor, not a wish",
        paragraphs: [
          "For most Kenyan SMEs a workable starting point is KES 700 to KES 1,500 per day per ad set. Below that, the algorithm gathers data too slowly and you end up paying for a permanent testing phase.",
          "Run that for at least fourteen days before judging results. Weekly budget changes reset learning and waste money.",
        ],
      },
      {
        id: "split",
        heading: "Split testing and scaling budgets",
        paragraphs: [
          "I typically allocate seventy percent of the monthly budget to what is already working and thirty percent to testing new creative and audiences.",
          "Creative fatigue is the biggest hidden cost in this market. Plan for fresh creative every three to four weeks.",
        ],
      },
      {
        id: "numbers",
        heading: "The numbers that actually matter",
        paragraphs: [
          "Ignore vanity reach. Track cost per qualified lead, cost per purchase, and the ratio of ad spend to revenue.",
          "If a lead costs KES 250 and one in five converts to a KES 8,000 sale, you can afford to scale aggressively. If you do not know those numbers, no budget is the right budget.",
        ],
      },
    ],
  },
  {
    slug: "tiktok-vs-instagram-for-kenyan-brands-2026",
    category: "TikTok",
    title: "TikTok vs Instagram for Kenyan Brands in 2026",
    excerpt: "I've run campaigns on both. Here's what the data actually shows.",
    date: "2026-07-08",
    dateLabel: "July 2026",
    readTime: "6 min read",
    metaTitle: "TikTok vs Instagram for Kenyan Brands in 2026",
    metaDescription:
      "A data-backed comparison of TikTok and Instagram for Kenyan brands in 2026: reach, cost per result, audience intent and where to invest.",
    intro:
      "Brands keep asking which platform to choose. After running paid and organic campaigns on both across Kenyan audiences, the difference is less about which is better and more about what each one is for.",
    thumbnail: "https://images.unsplash.com/photo-1745848413099-13adc3aaf308?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Smartphone screen showing a folder of social media apps including Instagram and TikTok icons",

    sections: [
      {
        id: "reach",
        heading: "Reach and cost",
        paragraphs: [
          "TikTok still delivers cheaper reach in Kenya, often at a fraction of Instagram's cost per thousand impressions. For awareness campaigns it is difficult to beat.",
          "Instagram costs more per impression but reaches an audience with more purchase intent, especially for higher priced products and services.",
        ],
      },
      {
        id: "content",
        heading: "The content each platform rewards",
        paragraphs: [
          "TikTok rewards native, unpolished, fast-hook video. Anything that looks like a television advert gets scrolled past.",
          "Instagram tolerates polish and rewards consistency across Reels, carousels and stories. Carousels remain one of the most underrated formats for service businesses.",
        ],
      },
      {
        id: "verdict",
        heading: "What I recommend",
        paragraphs: [
          "Use TikTok to create demand and Instagram to convert it. Run discovery content on TikTok, then retarget engaged viewers on Instagram where the buying decision happens.",
          "For most Kenyan brands a sixty-forty split favouring TikTok in the awareness phase works well, shifting toward Instagram as the funnel matures.",
        ],
      },
    ],
  },
  {
    slug: "0-to-4-million-tiktok-views-behind-the-campaign",
    category: "Case Study",
    title: "From 0 to 4 Million TikTok Views — Behind the Campaign",
    excerpt: "The content strategy that drove 4M views for a Kenyan brand.",
    date: "2026-07-22",
    dateLabel: "July 2026",
    readTime: "7 min read",
    metaTitle: "From 0 to 4 Million TikTok Views — Behind the Campaign",
    metaDescription:
      "A behind-the-scenes breakdown of the content strategy, posting cadence and creative decisions that took a Kenyan brand to 4 million TikTok views.",
    intro:
      "This account started from zero. No following, no existing content library, no influencer budget. Four million views later, here is exactly what the strategy looked like.",
    thumbnail: "https://images.unsplash.com/photo-1744135995241-3afc337786fd?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Smartphone mounted on a tripod filming a short-form video",

    sections: [
      {
        id: "foundation",
        heading: "Foundation: one clear content pillar",
        paragraphs: [
          "Instead of posting everything, we committed to a single recognisable format and repeated it. Repetition is what trains the algorithm and the audience at the same time.",
          "Every video opened with a visual hook in the first second and delivered its payoff within twelve seconds.",
        ],
      },
      {
        id: "cadence",
        heading: "Cadence and testing",
        paragraphs: [
          "We published five times a week for the first eight weeks. Volume is not optional early on: you are buying data.",
          "Each week we reviewed retention graphs, kept the hooks that held attention past three seconds, and discarded the rest.",
        ],
      },
      {
        id: "breakout",
        heading: "The breakout moment",
        paragraphs: [
          "Video nineteen crossed one million views on its own. It was not luck. It was the same format refined eighteen times.",
          "Once it broke out, we produced four variations of that exact video within seventy-two hours to ride the momentum.",
        ],
      },
      {
        id: "results",
        heading: "Results and takeaways",
        paragraphs: [
          "Four million cumulative views, a substantial follower base built from zero, and a measurable lift in branded search and direct enquiries.",
          "The lesson: consistency in one format beats creativity spread across ten.",
        ],
      },
    ],
  },
  {
    slug: "ad-mistakes-nairobi-smes-keep-making-2026",
    category: "Paid Ads",
    title: "5 Ad Mistakes Nairobi SMEs Keep Making on Google and Meta",
    excerpt: "Chasing clicks and reach while sales stay flat. Here's what's actually going wrong.",
    date: "2026-08-19",
    dateLabel: "August 2026",
    readTime: "5 min read",
    metaTitle: "5 Ad Mistakes Nairobi SMEs Keep Making on Google and Meta",
    metaDescription:
      "The most common Google and Meta Ads mistakes I see Nairobi SMEs make, and the fixes that actually move sales instead of vanity metrics.",
    intro:
      "I look at a lot of ad accounts for Nairobi businesses, and the same five mistakes show up almost every time. None of them are complicated to fix. Most cost the business money every single day they go unnoticed.",
    thumbnail: "https://images.unsplash.com/photo-1683721003111-070bcc053d8b?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Social media platform logos representing brand awareness and digital marketing strategies",

    sections: [
      {
        id: "wrong-metric",
        heading: "Judging the campaign by reach and clicks",
        paragraphs: [
          "A campaign with a low cost per click and huge reach can still be losing money. Reach and clicks tell you an ad was shown and tapped, not that it made anyone buy anything.",
          "Before judging a campaign, look at cost per lead or cost per sale, and compare that number to what the sale is actually worth. If a KES 300 lead turns into a KES 5,000 sale one time in ten, the account is healthy even if the click through rate looks unremarkable.",
        ],
      },
      {
        id: "no-tracking",
        heading: "Running ads with no real conversion tracking",
        paragraphs: [
          "Many accounts I audit have a pixel installed but nothing configured to track an actual purchase, lead form, or WhatsApp click. Meta and Google are then optimising blind, spending money to show ads to whoever is cheapest to reach rather than whoever is likely to buy.",
          "Set up proper event tracking before spending a shilling on scaling. Without it you are guessing, and the platforms are guessing along with you.",
        ],
      },
      {
        id: "broad-targeting",
        heading: "Targeting too broad or too narrow, with no in-between",
        paragraphs: [
          "Some businesses target all of Nairobi with no interest or behaviour layer, which burns budget on people who will never buy. Others narrow so hard the algorithm cannot find enough people to learn from, and the account never leaves the learning phase.",
          "Start with a defined but not tiny audience, let the algorithm run for at least a week without interference, then narrow based on what the data actually shows rather than a guess.",
        ],
      },
      {
        id: "creative-fatigue",
        heading: "Using the same three creatives for months",
        paragraphs: [
          "Frequency creeps up, cost per result climbs, and the business assumes the platform stopped working. Usually the real problem is that the same audience has seen the same three images sixty times.",
          "Budget for fresh creative every three to four weeks. This matters more in a small market like Nairobi, where the addressable audience for a niche product is smaller than businesses assume.",
        ],
      },
      {
        id: "no-followup",
        heading: "Treating the ad as the whole funnel",
        paragraphs: [
          "An ad that gets someone to comment 'price' or fill a form is only the first step. If nobody replies for six hours, or the WhatsApp number goes unanswered on weekends, the ad spend was wasted regardless of how well the ad performed.",
          "The businesses getting the best return from ads in this market are the ones treating reply speed and the sales conversation as part of the campaign, not as a separate department's problem.",
        ],
      },
    ],
  },
  {
    slug: "ai-marketing-honest-take-2026",
    category: "AI & Marketing",
    title: "AI Is Not a Marketing Strategy: My Honest Take After a Year Using It Daily",
    excerpt: "I use AI tools every day. Here's where they actually help and where they quietly cost you clients.",
    date: "2026-09-05",
    dateLabel: "September 2026",
    readTime: "5 min read",
    metaTitle: "AI Is Not a Marketing Strategy: My Honest Take After a Year Using It Daily",
    metaDescription:
      "A Nairobi digital marketer's honest breakdown of where AI tools genuinely help marketing work, and where relying on them quietly hurts results.",
    intro:
      "I use AI tools every day of my working life, for content, research, and even parts of this website. After a year of that, I have a clear view on what they are actually good for, and where I see brands quietly hurting themselves by leaning on AI for things it was never built to do.",
    thumbnail: "https://images.unsplash.com/photo-1642543348791-b1cc1b07e756?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Sole proprietor working on a laptop with AI marketing concepts in the background",

    sections: [
      {
        id: "good-at",
        heading: "Where AI genuinely earns its place",
        paragraphs: [
          "Drafting, summarising, and speeding up production are where these tools shine. A first draft of an ad script, a content calendar skeleton, or a quick summary of a messy client brief takes minutes instead of an afternoon.",
          "I use it daily for exactly this kind of work, and it has made me faster without making the work worse, as long as I am the one editing what comes out before a client or an ad platform ever sees it.",
        ],
      },
      {
        id: "bad-at",
        heading: "Where it quietly hurts brands",
        paragraphs: [
          "Strategy is the biggest one. AI can describe a strategy convincingly without knowing your margins, your actual customers, or what your competitors are doing right now in Nairobi this month. It will confidently give you a plan that sounds right and is wrong for your business.",
          "Voice is the second one. Unedited AI copy has a recognisable rhythm, and Kenyan audiences notice when a brand's Instagram caption suddenly stops sounding like a person. That gap in authenticity costs more trust than most business owners realise.",
        ],
      },
      {
        id: "own-work",
        heading: "How I actually use it on this website",
        paragraphs: [
          "This site's blog section runs on AI-assisted drafting with a system prompt built around Nairobi and Kenyan context, but every post gets a real edit pass before it is published. The AI writes a first draft, not the final version.",
          "That split, AI for speed and a human for judgement and voice, is the same one I recommend to every client who asks whether they should just let a tool run their content.",
        ],
      },
      {
        id: "advice",
        heading: "My advice if you're deciding how much to lean on it",
        paragraphs: [
          "Use it for volume: first drafts, variations, research summaries, and repetitive formatting work. Do not use it to decide your budget, your targeting, or your brand's voice without a person who knows the business checking the output first.",
          "The businesses getting real value from AI right now are not the ones using it the most. They are the ones being precise about which five percent of the work they still refuse to hand over.",
        ],
      },
    ],
  },
  {
    slug: "how-i-landed-national-press-coverage-for-iclear",
    category: "Case Study",
    title: "My Playbook for Turning a Campaign Into National Press Coverage",
    excerpt: "How a clean-water brand's anniversary campaign turned into features in Daily Nation, Capital FM and Kenya Engineer.",
    date: "2026-09-13",
    dateLabel: "September 2026",
    readTime: "6 min read",
    metaTitle: "My Playbook for Turning a Campaign Into National Press Coverage",
    metaDescription: "The PR playbook I used as Marketing Lead at iClear to land features in Daily Nation, Capital FM and Kenya Engineer for a Kenyan water brand.",
    intro: "As Marketing Lead at iClear, a Kenyan water purification company (a past employer, not a client), I ran the brand's 4th anniversary campaign from May to July 2026. The goal wasn't just a sale, it was a story worth writing about. Here's how proactive press outreach, a real CSR initiative, and a multi-platform push turned into national media coverage.",
    thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Magnifying glass over a newspaper article, symbolizing press and media coverage",

    sections: [
      {
        id: "reason-to-care",
        heading: "Give journalists a reason to care",
        paragraphs: [
          "Nobody writes a story about a discount code. What we built the campaign around instead was the 4th anniversary itself, paired with a genuine give-back: donating water purifiers to a school. That combination, a milestone plus a community impact angle, is what makes a pitch worth a journalist's time.",
          "So before any outreach went out, we lined up the story: what iClear does, why clean water access still matters in Kenya, and the concrete difference the campaign would make for one specific school.",
        ],
      },
      {
        id: "press-placements",
        heading: "The outreach: three real placements",
        paragraphs: [
          "We reached out to journalists directly rather than waiting to be discovered, and it landed real coverage: Daily Nation ran a feature titled \"The Business of Water,\" Capital FM covered the story, and so did Kenya Engineer. In the Daily Nation piece I'm quoted by name as iClear's Marketing Lead, explaining how the brand's water purification technology works.",
          "That kind of earned media does something paid ads can't: it puts an independent, national outlet's credibility behind the brand, for free, because the story was genuinely worth telling.",
        ],
      },
      {
        id: "csr-baobab-school",
        heading: "The CSR piece: Baobab School",
        paragraphs: [
          "On July 8, 2026, the team donated and installed 3 water purifiers at Baobab School, reaching 90 students and 8 teachers and staff with clean water access. Five iClear team members were on-site for the handover, and we documented the day in photos and video.",
          "This wasn't a photo-op tacked on after the fact, it was planned in from the start as the story's emotional core, and it's the piece that made the press pitch land.",
        ],
        image: {
          src: csrBaobabGroupPhoto,
          alt: "The iClear team with students and staff at Baobab School on the day of the water purifier handover",
          caption: "The iClear team with Baobab School students and staff, July 8, 2026.",
        },
      },
      {
        id: "wider-push",
        heading: "What the wider push looked like",
        paragraphs: [
          "Alongside the press and CSR work, the campaign ran across TikTok, Instagram and Facebook, with TikTok alone pulling in over a million views a quarter. Instagram was the strongest channel for turning attention into sales, driving 28 units through direct messages.",
          "We also showed up in person: an activation at the Nairobi City Marathon generated over 500 inquiries and 15 high-potential leads. Two monthly lucky draws, giving away a water dispensing unit each in May and June, kept the audience engaged between the bigger moments. Across the anniversary window, the campaign moved 120 units.",
        ],
      },
      {
        id: "takeaway",
        heading: "The takeaway",
        paragraphs: [
          "National press coverage rarely happens because a brand asks for it. It happens because there's a real story, told to the right people, backed by something a brand actually did. The anniversary gave us the timing, the school donation gave us the substance, and direct journalist outreach did the rest.",
          "This is the same approach I bring to my agency's client work now: pair a genuine story with the outreach to get it seen, rather than treating press coverage as something separate from the marketing plan.",
        ],
      },
    ],
  },
  {
    slug: "iclear-water-initiative-baobab-school",
    category: "CSR",
    title: "Inside iClear's Water Initiative at Baobab School",
    excerpt: "A closer look at the day iClear donated and installed 3 water purifiers at Baobab School — and what changed for 90 students and 8 staff.",
    date: "2026-09-15",
    dateLabel: "September 2026",
    readTime: "4 min read",
    metaTitle: "Inside iClear's Water Initiative at Baobab School",
    metaDescription: "How iClear donated and installed 3 water purifiers at Baobab School, reaching 90 students and 8 staff — the story behind the CSR initiative that anchored the brand's anniversary campaign.",
    intro: "As Marketing Lead at iClear, I helped plan and run the school donation at the centre of our 4th anniversary campaign. The press coverage told the headline version of that story. This is the fuller one — what the day at Baobab School actually looked like, and why we built the campaign around it in the first place.",
    thumbnail: "https://images.unsplash.com/photo-1747330665987-78cec08c8ec9?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Children drinking clean water from a public fountain",

    sections: [
      {
        id: "why-a-school",
        heading: "Why a school",
        paragraphs: [
          "Clean water access is the actual problem iClear exists to solve, so when we planned the anniversary campaign, giving back had to mean more than a discount. We picked a school because the impact is immediate and shared: one installation, dozens of kids and staff drinking clean water every day from that point on, not just for one afternoon.",
        ],
        image: {
          src: csrBaobabTeamHoodie,
          alt: "iClear team members on-site at Baobab School, wearing branded hoodies reading 'Water is Sweet'",
          caption: "On-site at Baobab School for the installation.",
        },
      },
      {
        id: "the-day",
        heading: "The day at Baobab School",
        paragraphs: [
          "On July 8, 2026, the iClear team installed 3 Premier purifier units at Baobab School, giving 90 students and 8 teachers and staff clean drinking water. Five of us were on-site for the handover.",
          "What stuck with the team wasn't the installation itself, it was watching the kids try the water and react to it. They were genuinely amazed at how it tasted — for a lot of them, it was the first time water from a tap had tasted like that. That reaction is the reason this kind of work is worth doing beyond the campaign calendar.",
        ],
        image: {
          src: csrBaobabGroupPhoto,
          alt: "The iClear team with students and staff at Baobab School on the day of the water purifier handover",
          caption: "The team with Baobab School's students and staff after the handover.",
        },
      },
      {
        id: "why-it-matters",
        heading: "Why it matters beyond one day",
        paragraphs: [
          "Access to safe drinking water is still inconsistent in a lot of Kenyan schools, and it affects everything from attendance to health. iClear's whole pitch is built around making that access affordable — the brand's standard message puts clean water at around KES 3 a litre — which is part of why a school donation fit so naturally: it's the same promise, just given instead of sold.",
        ],
        image: {
          src: csrBaobabInstalledUnits,
          alt: "Three iClear Premier water purifier units installed and running at Baobab School",
          caption: "The 3 Premier purifier units, installed and running.",
        },
      },
      {
        id: "closing",
        heading: "Closing",
        paragraphs: [
          "This is the same instinct I bring into agency work now: don't treat CSR or community impact as a marketing bolt-on. Build it in as something real, and let the story follow from what actually happened.",
        ],
        image: {
          src: csrBaobabHandover,
          alt: "iClear team members handing over water purifier units at Baobab School",
          caption: "Handing over the units on-site at Baobab School.",
        },
      },
    ],
  },
  {
    slug: "seo-pricing-for-kenyan-smes-2026",
    category: "SEO",
    title: "How Much Does SEO Cost for a Kenyan SME in 2026?",
    excerpt: "Real Kenyan market pricing, what actually goes into it, and the red flags that mean you're being overcharged or short-changed.",
    date: "2026-10-06",
    dateLabel: "October 2026",
    readTime: "5 min read",
    metaTitle: "How Much Does SEO Cost for a Kenyan SME in 2026?",
    metaDescription: "A practical breakdown of SEO pricing in Kenya: what a retainer actually covers, typical price ranges, what moves the price, and red flags to avoid.",
    intro: "SEO pricing in Kenya swings wildly, from freelancers charging KES 10,000 a month to agencies quoting six figures for the same scope of work. Here's what you're actually paying for, and how to tell if a quote makes sense.",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Laptop screen showing statistics and charts on a glass-top table",

    sections: [
      {
        id: "whats-included",
        heading: "What an SEO retainer actually covers",
        paragraphs: [
          "A proper SEO engagement is not just 'keywords.' It typically covers technical fixes (site speed, indexing, structured data), on-page work (titles, content, internal links), local SEO (Google Business Profile, citations, reviews), and ongoing content production.",
          "If a quote does not tell you which of these it covers, ask. A KES 15,000 a month package that only touches meta tags is a different product from a KES 60,000 package that includes monthly content and technical audits.",
        ],
      },
      {
        id: "price-ranges",
        heading: "What SEO actually costs in the Kenyan market",
        paragraphs: [
          "One-off technical and on-page audits are a good starting point if you are not ready for a retainer. Mine runs at KES 40,000 and gives you a full picture of what is broken before you commit to ongoing work.",
          "Ongoing monthly SEO retainers in Kenya commonly range from the low tens of thousands for a single small site up to six figures a month for competitive, content-heavy niches. My own SEO Optimization retainer starts from KES 45,000 a month, covering on-page, technical and local SEO. (See full pricing at /agency#services.)",
        ],
      },
      {
        id: "price-drivers",
        heading: "What actually moves the price up or down",
        paragraphs: [
          "How competitive your niche is matters more than how big your business is. A single-location car wash competes for far less contested keywords than a Nairobi law firm or a skincare e-commerce store.",
          "The state of your existing site also matters. A site with years of technical debt costs more to fix in month one than a clean site that just needs consistent content and links.",
        ],
      },
      {
        id: "red-flags",
        heading: "Red flags that mean you're being sold the wrong thing",
        paragraphs: [
          "Guaranteed 'page one in 30 days' promises are the clearest warning sign in this market. Nobody, including Google itself, can guarantee a ranking position on a timeline that short.",
          "So is a monthly report that only shows keyword rankings with no mention of actual traffic, leads, or sales. Rankings are a means, not the result you are paying for.",
        ],
      },
      {
        id: "getting-started",
        heading: "Where to start if your budget is tight",
        paragraphs: [
          "If a full retainer is out of reach right now, start with an audit. It tells you exactly what is broken and gives you a prioritized list you, or whoever you hire next, can work through.",
          "From there, Google Business Profile optimisation and basic technical fixes usually deliver the fastest visible movement for the least spend, before you invest in ongoing content.",
        ],
      },
    ],
  },
  {
    slug: "lead-generation-campaigns-kenya-2026",
    category: "Paid Ads",
    title: "Lead Generation Campaigns That Actually Work for Kenyan Businesses",
    excerpt: "Most lead-gen campaigns in this market fail after the ad, not because of it. Here's the full picture.",
    date: "2026-10-20",
    dateLabel: "October 2026",
    readTime: "5 min read",
    metaTitle: "Lead Generation Campaigns That Actually Work for Kenyan Businesses",
    metaDescription: "A practical guide to running lead-generation campaigns in Kenya: defining a real lead, choosing the right format, landing pages, follow-up speed, and realistic cost per lead.",
    intro: "A lead-generation campaign is not just an ad with a form attached. In this market, most of what determines whether a campaign works happens after someone clicks, not in the ad itself.",
    thumbnail: "https://images.unsplash.com/photo-1558731991-cb3430a08bb7?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Person holding a smartphone mid-call against a grey city window",

    sections: [
      {
        id: "real-lead",
        heading: "Define what a real lead looks like before you launch",
        paragraphs: [
          "A lead is not the same as a form submission. Someone typing a fake number to see your promo code is a submission, not a lead. Decide upfront what a qualified lead looks like: budget range, intent signal, or a specific question asked.",
          "Without that definition, you cannot judge whether a campaign is actually working, only whether it is generating volume.",
        ],
      },
      {
        id: "choosing-format",
        heading: "Choose the lead format your audience will actually use",
        paragraphs: [
          "Meta's native lead forms get more submissions because they are frictionless, but the quality is often lower since people fill them from inside the app without much thought.",
          "In Kenya, a WhatsApp click-to-chat button frequently outperforms both a lead form and a landing page for service businesses, because it matches how people already prefer to inquire and negotiate. (My Meta Ads and Google Ads management pricing is at /agency#services.)",
        ],
      },
      {
        id: "landing-basics",
        heading: "If you're sending traffic to a landing page, keep it simple",
        paragraphs: [
          "One offer, one form, one call to action. A landing page trying to explain your entire business while also capturing a lead usually does neither well.",
          "Load speed on a Kenyan mobile connection matters as much as the design. A beautiful page that takes eight seconds to load loses leads before they see the offer.",
        ],
      },
      {
        id: "followup-speed",
        heading: "Follow-up speed decides more than the ad does",
        paragraphs: [
          "The single biggest lead-gen killer I see is slow response time. A lead that goes cold after six unanswered hours was, for practical purposes, never a lead at all — the same idea I cover in '5 Ad Mistakes Nairobi SMEs Keep Making on Google and Meta.'",
          "Businesses that reply within minutes convert a noticeably higher share of the same leads than businesses replying the next day, with the exact same ad and audience.",
        ],
      },
      {
        id: "cost-expectations",
        heading: "What a realistic cost per lead looks like",
        paragraphs: [
          "Cost per lead varies enormously by industry, but a useful sanity check is comparing it against the value of a converted customer, not against what feels like a 'good' number in isolation.",
          "If your cost per lead is KES 400 and one in eight leads converts to a KES 10,000 sale, the campaign is working even though KES 400 sounds high on its own. Judge the campaign by what it returns, not by the size of the number.",
        ],
      },
    ],
  },
  {
    slug: "how-to-choose-a-digital-marketing-agency-nairobi-2026",
    category: "Agency",
    title: "How to Choose a Digital Marketing Agency in Nairobi (2026 Checklist)",
    excerpt: "Most agency pitches sound identical. Here's what actually separates a good one from a bad one before you sign anything.",
    date: "2026-11-03",
    dateLabel: "November 2026",
    readTime: "6 min read",
    metaTitle: "How to Choose a Digital Marketing Agency in Nairobi (2026 Checklist)",
    metaDescription: "A practical checklist for picking a digital marketing agency in Nairobi: what to ask, what pricing structure to expect, and the warning signs to walk away from.",
    intro: "Every agency pitch in Nairobi sounds similar: 'data-driven,' 'results-focused,' 'ROI-obsessed.' The words don't tell you anything. Here's what actually separates a good agency from one that will waste your budget for six months before you notice.",
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Two people shaking hands across a table during a business meeting",

    sections: [
      {
        id: "ask-for-proof",
        heading: "Ask for numbers, not case study language",
        paragraphs: [
          "'We grew their engagement' means nothing without a baseline. Ask for the actual before-and-after figures: leads per month, cost per result, revenue attributed to the channel. An agency that has real results will show you real numbers without hesitation.",
          "If every case study on their site is vague adjectives with no figures attached, that is the figure.",
        ],
      },
      {
        id: "pricing-structure",
        heading: "Understand how they actually get paid",
        paragraphs: [
          "A flat monthly retainer is the most common structure in Kenya and the easiest to budget against. Expect Meta, Google or TikTok Ads management to start somewhere around KES 40,000 to 45,000 a month for a single platform, on top of the actual ad spend, which is a separate cost the agency should never absorb into their fee without saying so clearly.",
          "Be wary of a percentage-of-ad-spend model with no cap in a small market like Kenya. It quietly rewards the agency for you spending more, not for you converting better.",
        ],
      },
      {
        id: "communication",
        heading: "How they communicate before you sign tells you how they'll communicate after",
        paragraphs: [
          "If a discovery call feels rushed or the proposal takes two weeks to arrive, that is the actual pace you should expect once you are a paying client, not an exception caused by a busy month.",
          "A proposal delivered within 24 to 48 hours of a discovery call, with clear services, pricing and a timeline attached, is a reasonable standard to hold any Nairobi agency to.",
        ],
      },
      {
        id: "scope-clarity",
        heading: "Get the scope in writing before the deposit",
        paragraphs: [
          "'Social media management' can mean three posts a month or a full content calendar with paid boosting. 'SEO' can mean a monthly blog post or a full technical and local SEO program. Ask exactly what is included, and get it in writing before paying a deposit.",
          "In Kenya, a 50% deposit via M-Pesa to start work is standard practice. What is not standard, and should be a red flag, is an agency unwilling to put deliverables in writing before taking that deposit.",
        ],
      },
      {
        id: "fit-check",
        heading: "The real question: do they understand your market",
        paragraphs: [
          "An agency that has only run campaigns for e-commerce brands in Europe will not automatically understand why a WhatsApp click-to-chat button outperforms a lead form for a Nairobi service business, or why M-Pesa payment friction matters in your funnel.",
          "Ask what they know about your specific customer in Kenya, not just their marketing platform of choice. The right answer is usually a specific insight about local behaviour, not a generic platform pitch.",
        ],
      },
    ],
  },
  {
    slug: "google-ads-vs-meta-ads-kenya-2026",
    category: "Paid Ads",
    title: "Google Ads vs Meta Ads for Kenyan Businesses: Which Should You Start With?",
    excerpt: "Both work. Almost nobody should run both on day one. Here's how to pick the right first platform for your business.",
    date: "2026-11-10",
    dateLabel: "November 2026",
    readTime: "5 min read",
    metaTitle: "Google Ads vs Meta Ads for Kenyan Businesses: Which Should You Start With?",
    metaDescription: "A practical comparison of Google Ads and Meta Ads for Kenyan SMEs: how buyer intent, budget size and business type should decide which platform you start with.",
    intro: "This is the single most common question I get from Kenyan business owners with a first marketing budget. The honest answer depends less on which platform is 'better' and more on how your specific customer actually shops.",
    thumbnail: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Person comparing two mobile app icons on a smartphone screen",

    sections: [
      {
        id: "intent-vs-interruption",
        heading: "The core difference: intent versus interruption",
        paragraphs: [
          "Google Ads shows up when someone is already searching for what you sell. They have a problem and are actively looking for a solution, which means the intent is already there before your ad appears.",
          "Meta Ads interrupts someone scrolling who was not looking for you at all. It has to create the want, not just capture it. That difference changes everything about which businesses should start where.",
        ],
      },
      {
        id: "when-google-wins",
        heading: "When Google Ads is the better starting point",
        paragraphs: [
          "If your service is something people actively search for when they need it, plumbers, lawyers, clinics, movers, laptop repair, Google Ads usually wins because you are capturing demand that already exists rather than creating it from nothing.",
          "It also tends to produce a shorter path to a first sale, since the person clicking is often close to a buying decision already. Google Ads management typically starts from around KES 45,000 a month on top of ad spend.",
        ],
      },
      {
        id: "when-meta-wins",
        heading: "When Meta Ads is the better starting point",
        paragraphs: [
          "If your product is something people don't know they want until they see it, fashion, food brands, new services, visually driven products, Meta Ads is usually stronger because it can build desire through creative rather than waiting for a search to exist.",
          "It also tends to be cheaper to test with early on, which matters if your first budget is small and you need to learn quickly without burning through it on a handful of expensive clicks.",
        ],
      },
      {
        id: "budget-reality",
        heading: "What budget size actually changes",
        paragraphs: [
          "Below roughly KES 50,000 a month in total ad spend, running both platforms at once usually means neither gets enough budget to leave the learning phase. Pick one, run it properly for at least a month, then expand.",
          "Once ad spend is comfortably above KES 200,000 a month, running both in parallel starts to make sense, since each platform can get enough budget to actually optimise.",
        ],
      },
      {
        id: "verdict",
        heading: "How I'd decide for your business",
        paragraphs: [
          "Ask yourself one question: does my ideal customer already know they need this and search for it, or do I need to show them why they want it? The first answer points to Google, the second points to Meta.",
          "Most Kenyan SMEs I work with start on whichever platform matches that answer, prove it works for two to three months, then add the second platform once there is a working budget and a working process behind it.",
        ],
      },
    ],
  },
  {
    slug: "google-ads-cost-kenya-2026",
    category: "Paid Ads",
    title: "How Much Does Google Ads Management Cost in Kenya?",
    excerpt: "Management fees, actual ad spend, and the numbers that decide whether a Google Ads account is worth running at all.",
    date: "2026-11-17",
    dateLabel: "November 2026",
    readTime: "5 min read",
    metaTitle: "How Much Does Google Ads Management Cost in Kenya?",
    metaDescription: "A breakdown of Google Ads costs in Kenya: management fees versus ad spend, typical cost-per-click by industry, and the minimum budget needed to get real data.",
    intro: "Google Ads pricing confuses people because it has two completely separate costs: what you pay an agency to manage the account, and what you pay Google for the clicks themselves. Conflating the two is where most budget conversations go wrong.",
    thumbnail: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Person reviewing charts and figures on a laptop with a calculator nearby",

    sections: [
      {
        id: "two-costs",
        heading: "Two separate costs: management fee and ad spend",
        paragraphs: [
          "The management fee pays for strategy, setup, keyword research, ongoing optimisation and reporting. Ad spend is what you pay Google directly for the clicks, and it should always be transparent and separate from the management fee.",
          "In Kenya, Google Ads management typically starts from around KES 45,000 a month. Ad spend on top of that is set by you based on budget, not bundled invisibly into the management fee.",
        ],
      },
      {
        id: "cpc-by-industry",
        heading: "What clicks actually cost by industry",
        paragraphs: [
          "Cost per click in Kenya varies enormously by how competitive the keyword is. Local service searches, plumbers, electricians, movers, tend to be cheaper per click than legal, financial or medical keywords, which are contested by bigger budgets nationally.",
          "A niche local service might see clicks in the tens of shillings, while a competitive commercial keyword in law or finance can run several times that. This is why the same monthly ad budget produces wildly different click volumes across industries.",
        ],
      },
      {
        id: "minimum-budget",
        heading: "The minimum ad budget for the platform to actually learn",
        paragraphs: [
          "Below a certain spend, Google's algorithm simply does not get enough conversion data per week to optimise the account intelligently, regardless of how well it is built. As a rough floor, an ad budget under KES 15,000 to 20,000 a month rarely produces enough clicks or conversions to judge performance fairly.",
          "If your total budget, management fee plus ad spend, is tight, it is usually better to run a smaller, tightly targeted campaign for a full month than to spread a thin budget across many keywords and campaigns at once.",
        ],
      },
      {
        id: "what-drives-price-up",
        heading: "What actually drives the total cost up or down",
        paragraphs: [
          "How competitive your industry is matters more than your business size, the same pattern as SEO pricing. A single clinic in a less contested niche can get real results on a modest budget where a Nairobi law firm competing nationally cannot.",
          "How well your website converts also matters. A site that turns ten clicks into one enquiry needs a smaller ad budget to hit a target than a site that turns fifty clicks into the same enquiry, because the account is not fighting a leaky landing page on top of the platform's own learning curve.",
        ],
      },
      {
        id: "sensible-start",
        heading: "A sensible way to start if you're unsure",
        paragraphs: [
          "If you are not sure whether Google Ads fits your business at all, a one-off Digital Marketing Audit (from KES 40,000) can tell you whether your site and offer are even ready for paid traffic before you commit to a monthly retainer.",
          "From there, start with one focused campaign, one clear offer, and a full month of data before deciding whether to scale the budget up.",
        ],
      },
    ],
  },
  {
    slug: "convey-communications-case-study-10x-leads",
    category: "Case Study",
    title: "Convey Communications: 10x Qualified Leads in 6 Months",
    excerpt: "Low organic reach and stagnant lead flow, turned into a 10x increase in qualified leads and 300%+ engagement growth across IG and TikTok.",
    date: "2026-11-24",
    dateLabel: "November 2026",
    readTime: "5 min read",
    metaTitle: "Convey Communications: 10x Qualified Leads in 6 Months",
    metaDescription: "How a combination of Meta Ads, TikTok strategy and content production took Convey Communications from stagnant lead flow to a 10x increase in qualified leads.",
    intro: "Convey Communications came to me with a familiar problem: decent brand recognition, but organic reach had flatlined and the lead pipeline had gone quiet. Six months later, qualified leads were up 10x and engagement across Instagram and TikTok had grown more than 300%. Here's what changed.",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Team reviewing marketing performance charts on a screen in an office",

    sections: [
      {
        id: "the-problem",
        heading: "The starting problem",
        paragraphs: [
          "Convey's organic content was going out consistently, but reach and engagement had been declining for months, and the leads that did come in were inconsistent and hard to attribute to any specific effort. Nobody could say with confidence what was actually working.",
          "Before touching a single ad account, the first step was figuring out which content formats and topics still had any organic pull left, and which had simply worn out with the existing audience.",
        ],
      },
      {
        id: "the-fix",
        heading: "What we changed: Meta Ads, TikTok strategy, and content production",
        paragraphs: [
          "We layered targeted Meta Ads on top of the organic content that was still performing, rather than starting from zero with untested creative. That let the ad budget amplify what the audience had already shown interest in.",
          "On TikTok, we rebuilt the content strategy around native, fast-hook formats instead of repurposed Instagram content, which is a mistake I see constantly in this market, treating TikTok like a second Instagram feed instead of its own platform with its own rules.",
        ],
      },
      {
        id: "the-results",
        heading: "The results over six months",
        paragraphs: [
          "Qualified leads increased tenfold, and engagement across Instagram and TikTok combined grew more than 300%. Neither number moved in isolation, the paid and organic work reinforced each other throughout the six months.",
          "The lead increase mattered more than the engagement number, since engagement without a lead increase is a vanity metric. In this case both moved together, which is the actual sign a strategy is working rather than just performing.",
        ],
      },
      {
        id: "takeaway",
        heading: "The takeaway",
        paragraphs: [
          "The biggest lever wasn't a bigger budget, it was refusing to treat every platform the same way and building paid spend around organic signals instead of guessing at new creative from a blank page.",
          "That combination, test organically first, then put paid budget behind what already resonates, is the same approach I bring to every new client account.",
        ],
      },
    ],
  },
  {
    slug: "nyeri-county-campaign-hyper-local-marketing",
    category: "Case Study",
    title: "Nyeri County Campaign: Reaching a Hyper-Local Audience on a Small Budget",
    excerpt: "500K+ video views and 22 community events filled to capacity, without a national ad budget behind it.",
    date: "2026-12-01",
    dateLabel: "December 2026",
    readTime: "5 min read",
    metaTitle: "Nyeri County Campaign: Reaching a Hyper-Local Audience on a Small Budget",
    metaDescription: "How a hyper-local video production and Meta Ads strategy generated over 500,000 views and filled 22 community events to capacity in Nyeri County on a limited budget.",
    intro: "Hyper-local campaigns get a fraction of the budget national campaigns do, but they need to move a very specific, geographically concentrated audience to actually show up somewhere. Here's how a limited budget turned into 500,000+ video views and 22 fully booked community events in Nyeri County.",
    thumbnail: "https://images.unsplash.com/photo-1516382799247-87df95d790b7?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Rural Kenyan town street with local shops and community activity",

    sections: [
      {
        id: "the-challenge",
        heading: "The challenge: hyper-local reach on a limited budget",
        paragraphs: [
          "A national brand campaign can afford to be broad and still find its audience through sheer volume. A county-level campaign cannot. Every shilling had to reach someone who could plausibly attend an event in Nyeri specifically, not just someone generally interested in the brand.",
          "That meant location targeting had to be precise from day one, down to specific towns and trading centres rather than the county as a whole, and the content had to feel local rather than like a national ad dropped into a regional feed.",
        ],
      },
      {
        id: "the-approach",
        heading: "Video production and hyper-local Meta targeting",
        paragraphs: [
          "The content leaned heavily on local video production, filmed on location, using local landmarks and community language rather than generic stock-style branding. That authenticity is what made people trust an event invitation from a brand they hadn't necessarily heard of.",
          "On Meta, targeting was layered tightly around geography combined with interest signals relevant to each event, rather than one broad campaign covering the whole county. Local SEO also played a role, making sure each event page could be found by anyone searching for it directly.",
        ],
      },
      {
        id: "the-results",
        heading: "The results: 500K+ views, 22 events at capacity",
        paragraphs: [
          "The video content crossed 500,000 views across the campaign, a strong number for content built around a single county rather than a national audience. More importantly, all 22 community events booked to full capacity.",
          "View count was never the actual goal here, filled events were. The views mattered only because they were the mechanism that got people to actually show up.",
        ],
      },
      {
        id: "takeaway",
        heading: "The takeaway",
        paragraphs: [
          "Hyper-local campaigns succeed or fail on precision, not budget size. Tight geographic targeting and content that visibly belongs to the specific place you're targeting will consistently outperform a bigger, broader budget aimed at the same region.",
          "This is the same principle behind the Google Business Profile and local SEO advice I give Nairobi businesses: specificity beats scale when your customer is defined by where they physically are.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-as-a-sales-channel-kenya-2026",
    category: "Marketing",
    title: "WhatsApp as a Sales Channel: What Kenyan Businesses Get Wrong",
    excerpt: "It's the highest-intent channel most Kenyan businesses have, and most of them still run it like an afterthought.",
    date: "2026-12-08",
    dateLabel: "December 2026",
    readTime: "5 min read",
    metaTitle: "WhatsApp as a Sales Channel: What Kenyan Businesses Get Wrong",
    metaDescription: "Why WhatsApp outperforms lead forms and DMs for Kenyan businesses, and the common mistakes, from slow replies to no catalog, that quietly cost sales.",
    intro: "For a huge share of Kenyan businesses, WhatsApp is already the real sales floor, whether the business treats it that way or not. Ask, quote, negotiate, pay, it all happens there. Most businesses still run it like a side channel instead of the primary one it actually is.",
    thumbnail: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Hands typing a message on a smartphone chat app",

    sections: [
      {
        id: "why-it-wins",
        heading: "Why WhatsApp outperforms forms and DMs in this market",
        paragraphs: [
          "A WhatsApp click-to-chat button removes almost all the friction between interest and a conversation. There is no form to fill, no app switch, and the person is already in the exact app they use daily to talk to people they trust.",
          "It also matches how buying actually happens in Kenya for a lot of products and services: a real back-and-forth negotiation and clarification, not a one-way form submission that a business replies to hours later.",
        ],
      },
      {
        id: "mistake-slow-replies",
        heading: "Mistake one: treating it like email",
        paragraphs: [
          "The single biggest failure is response time. A WhatsApp enquiry that sits unanswered for hours has effectively expired, the same person has usually already messaged a competitor and moved on by the time a reply arrives the next morning.",
          "If WhatsApp is a real sales channel for your business, it needs a real response-time standard, ideally minutes during business hours, not whenever someone gets around to checking the phone.",
        ],
      },
      {
        id: "mistake-no-catalog",
        heading: "Mistake two: no catalog, no saved replies, no structure",
        paragraphs: [
          "WhatsApp Business supports a proper product catalog, quick replies for common questions, and labels to track where a conversation is in the sales process. Most small businesses never turn any of it on and end up retyping the same price list by hand every day.",
          "Setting this up once removes most of the daily friction and makes it possible for more than one person to handle enquiries consistently, instead of everything bottlenecking through whoever's phone the number lives on.",
        ],
      },
      {
        id: "mistake-personal-number",
        heading: "Mistake three: running the business off a personal number with no backup",
        paragraphs: [
          "A single personal number with no second admin, no backup access, and no separation from the owner's personal chats is a fragile way to run a sales channel. If that phone is lost, stolen, or the owner is simply unavailable for a day, the business loses its main sales line entirely.",
          "A dedicated WhatsApp Business number with more than one person able to respond is a small operational change that removes a genuinely large risk.",
        ],
      },
      {
        id: "how-it-fits",
        heading: "How WhatsApp fits into a paid campaign",
        paragraphs: [
          "Sending Meta or Google traffic to a WhatsApp click-to-chat link instead of a form or landing page consistently produces higher-quality leads for service businesses in this market, a pattern I cover in more detail in my piece on lead generation campaigns that actually work.",
          "The ad's job is just to start the conversation. Everything that decides whether it becomes a sale happens in the chat that follows, which is exactly why the mistakes above cost more than a slightly worse ad ever could.",
        ],
      },
    ],
  },
  {
    slug: "what-a-digital-marketing-audit-finds-kenya-2026",
    category: "Agency",
    title: "What a Digital Marketing Audit Actually Finds (and Why It's Worth KES 40,000)",
    excerpt: "Before you spend another shilling on ads or SEO, an audit tells you exactly what's broken and what to fix first.",
    date: "2026-12-15",
    dateLabel: "December 2026",
    readTime: "5 min read",
    metaTitle: "What a Digital Marketing Audit Actually Finds (and Why It's Worth KES 40,000)",
    metaDescription: "What's inside a full-channel digital marketing audit for a Kenyan business: what gets checked, what usually turns up, and why it's worth doing before spending on ads or SEO.",
    intro: "Most businesses come to me wanting to spend money on ads or SEO before anyone has checked whether the site, the tracking, or the offer can actually support that spend. An audit is the KES 40,000 conversation that prevents a much more expensive mistake.",
    thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Person annotating a printed report with a red pen next to a laptop",

    sections: [
      {
        id: "what-gets-checked",
        heading: "What actually gets checked",
        paragraphs: [
          "A proper full-channel audit covers technical site health, on-page and local SEO, existing ad account setup if any exists, conversion tracking, and a review of what content and social presence is already in place. It is a snapshot of the entire digital footprint, not just one channel.",
          "The point is to see the business the way a customer and a search engine both see it, which is often very different from how the business sees itself.",
        ],
      },
      {
        id: "common-findings",
        heading: "What usually turns up",
        paragraphs: [
          "The most common finding by far is broken or missing conversion tracking, businesses that have been running ads for months with no reliable way to tell which campaigns actually produced a sale.",
          "Close behind that is a Google Business Profile left half-filled, no structured data on the site, and a mobile experience that quietly loses visitors before they ever see the offer. None of these are expensive to fix once they are found, they are just invisible until someone looks.",
        ],
      },
      {
        id: "why-before-spend",
        heading: "Why this comes before ad spend, not after",
        paragraphs: [
          "Running ads to a site with no tracking means you cannot tell Google or Meta what a good customer looks like, so the platform cannot optimise toward one. You end up paying to learn things the audit would have told you for free.",
          "The same logic applies to SEO. Publishing content on a site with a serious technical problem is like decorating a room with a leaking roof, the content will not perform until the underlying issue is fixed.",
        ],
      },
      {
        id: "what-you-get",
        heading: "What you actually walk away with",
        paragraphs: [
          "A prioritised list, not a wall of jargon. Every audit I run ends with what to fix first, what can wait, and a rough sense of what each fix is likely to be worth, so a business owner with a small budget knows exactly where to spend it first.",
          "Whether you fix it yourself, hand it to your existing team, or come back to me for the retainer work, the audit is designed to be useful on its own, not just a sales pitch for more work.",
        ],
      },
    ],
  },
  {
    slug: "peak-season-marketing-kenya-2026",
    category: "Paid Ads",
    title: "Peak Season Marketing in Kenya: Black Friday, Festive and Back-to-School",
    excerpt: "Three completely different shopping moods, three completely different campaigns. Treating them the same is why most seasonal pushes underperform.",
    date: "2026-12-22",
    dateLabel: "December 2026",
    readTime: "6 min read",
    metaTitle: "Peak Season Marketing in Kenya: Black Friday, Festive and Back-to-School",
    metaDescription: "How to plan Black Friday, festive season and back-to-school marketing campaigns in Kenya: timing, budget shifts, and the mistakes that waste seasonal ad spend.",
    intro: "Kenya has three real peak shopping windows a year, Black Friday, the festive season, and back-to-school in January. Each one has a different buyer mindset, and running the same campaign structure across all three is the fastest way to waste a seasonal budget.",
    thumbnail: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Shopping bags and gift boxes arranged on a table",

    sections: [
      {
        id: "black-friday",
        heading: "Black Friday: price is the entire message",
        paragraphs: [
          "Black Friday shoppers in Kenya are already comparing prices across multiple brands before they open your ad. The offer needs to be clear in the first second, not buried under brand messaging, and the discount needs to be real enough to survive a direct comparison.",
          "Budgets should shift heavily toward the week itself rather than being spread evenly through November. Start warming up the audience a week or two out, then commit most of the spend to the 48 to 72 hours around the day itself.",
        ],
      },
      {
        id: "festive",
        heading: "Festive season: it's a gifting and family mindset, not a discount mindset",
        paragraphs: [
          "Unlike Black Friday, festive season buying is driven more by occasion and relationship than by finding the lowest price. Creative that leans into family, celebration and gifting typically outperforms a pure discount message during this window.",
          "This is also the period where WhatsApp click-to-chat tends to spike in importance, since a lot of festive purchasing involves a conversation, checking sizes, availability, or delivery timing, before someone commits.",
        ],
      },
      {
        id: "back-to-school",
        heading: "Back-to-school: practical, urgent, and price-sensitive again",
        paragraphs: [
          "January's back-to-school window is short and driven by a hard deadline, school opening day. Messaging should be practical and direct: what it is, what it costs, and that it will arrive in time. This is not the moment for brand-building creative.",
          "Businesses selling anything remotely related to school, uniforms, stationery, electronics, transport, should expect a compressed but genuinely high-intent window in the first two to three weeks of January.",
        ],
      },
      {
        id: "the-mistake",
        heading: "The mistake that wastes the most seasonal budget",
        paragraphs: [
          "Running one generic 'sale' campaign across all three windows with the same creative and the same targeting. Each of these moments has a different customer mindset, and treating them identically means the message misses the actual reason people are buying at that specific time.",
          "Plan each window as its own small campaign with its own message, even if the underlying product or offer barely changes between them.",
        ],
      },
    ],
  },
  {
    slug: "video-ads-vs-static-ads-kenya-2026",
    category: "Meta Ads",
    title: "Video Ads vs Static Ads: What Converts Better on Kenyan Social Media",
    excerpt: "The honest answer depends on what you're selling and where in the funnel the ad sits, not on which format is inherently better.",
    date: "2026-12-29",
    dateLabel: "December 2026",
    readTime: "5 min read",
    metaTitle: "Video Ads vs Static Ads: What Converts Better on Kenyan Social Media",
    metaDescription: "A practical comparison of video and static ads for Kenyan social media campaigns: when each format wins, production cost, and how to decide without guessing.",
    intro: "Business owners often ask whether they should invest in video production or just run well-designed static images. The honest answer is that both have a job, and the mistake is picking one format for every stage of the campaign.",
    thumbnail: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Camera and lighting equipment set up for a video shoot",

    sections: [
      {
        id: "when-video-wins",
        heading: "When video wins",
        paragraphs: [
          "Video earns its cost when the product or service needs to be seen in motion to be understood, a process being done, a space being used, a result being demonstrated. It also tends to hold attention longer in a scrolling feed, which matters most at the awareness stage of a campaign.",
          "Short, native-feeling video, filmed simply rather than over-produced, consistently outperforms polished but generic video for Kenyan audiences, echoing the same lesson from running TikTok content: authenticity beats production value.",
        ],
      },
      {
        id: "when-static-wins",
        heading: "When static wins",
        paragraphs: [
          "Static images are cheaper and faster to produce, easier to test in volume, and often perform just as well or better once someone already knows what your product is and is deciding whether to buy. A clean image with a clear price and offer can outperform video at the bottom of the funnel, where the job is closing the sale, not building interest.",
          "Static also wins by default for any business that cannot realistically produce fresh video every few weeks. A steady stream of well-made static creative beats one video ad running until it fatigues.",
        ],
      },
      {
        id: "cost-reality",
        heading: "The real cost difference",
        paragraphs: [
          "Video production in Kenya typically runs from around KES 40,000 per project upward, depending on complexity, versus a fraction of that for a batch of static designs. That cost difference should factor directly into the decision, not just which format performs marginally better in isolation.",
          "If a modest static budget can produce ten creative variations to test against one video's budget, the static batch often wins on data alone, simply because it generates more signal, faster.",
        ],
      },
      {
        id: "verdict",
        heading: "How I'd decide for your campaign",
        paragraphs: [
          "Use video for awareness and to explain anything that benefits from being seen in motion. Use static for retargeting, price-led offers, and anything close to a purchase decision.",
          "Most of the Kenyan brands I work with run a mix: a small number of video pieces doing the heavy lifting on cold audiences, backed by a rotating set of static creative carrying the closing message.",
        ],
      },
    ],
  },
  {
    slug: "google-business-profile-setup-nairobi-2026",
    category: "SEO",
    title: "How to Set Up Your Google Business Profile the Right Way in Nairobi",
    excerpt: "From picking the right category to handling reviews when someone's just being mean — the GBP setup guide for Nairobi businesses.",
    date: "2026-11-03",
    dateLabel: "November 2026",
    readTime: "5 min read",
    metaTitle: "How to Set Up Your Google Business Profile the Right Way in Nairobi",
    metaDescription: "A practical Google Business Profile setup guide for Nairobi businesses: category, service area, photos, posts, reviews, and the mistakes that cost you visibility.",
    intro: "Whether you're running a kinyozi in Kawangware, a boutique in Kilimani, or a consultancy in Upper Hill, your Google Business Profile is doing more work for you than your website is. Most Nairobi business owners set theirs up once, in five minutes, and never touch it again. Here's how to actually do it right.",
    thumbnail: "https://images.unsplash.com/photo-1669127300649-940337f1487e?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "The Nairobi Expressway and city skyline in Westlands, Nairobi",

    sections: [
      {
        id: "category-and-name",
        heading: "Get your category and name right from day one",
        paragraphs: [
          "Pick the most specific category that fits, not the broadest one. 'Skin care clinic' beats 'Health' every time, because Google shows your listing for the searches that actually match, not the ones that sound impressive.",
          "Don't stuff keywords into your business name (adding 'Nairobi's Best' or 'Cheap' to the name field). Google flags this, and it can get your listing suspended right when you need it most, like during a Black Friday push.",
        ],
      },
      {
        id: "location-and-hours",
        heading: "Set your service area and hours like customers actually check them",
        paragraphs: [
          "If you deliver across Nairobi, use a service area instead of pinning one office. A duka in South B doesn't need a public storefront pin if half the business is boda-boda deliveries across Eastlands.",
          "Update your hours for public holidays and Sundays specifically. Nothing loses trust faster than someone walking to your CBD shop after 'closing time confirmed on Google' only to find it shut.",
        ],
      },
      {
        id: "photos-and-posts",
        heading: "Photos and posts, done consistently",
        paragraphs: [
          "Upload real photos of your actual shop, staff, and products, not stock images. People searching locally can tell the difference immediately, and profiles with real photos consistently get more calls and direction requests.",
          "Post at least twice a month. A quick photo of new stock, a service you're running this week, or a shoutout for a Till number promotion keeps the profile 'active' in Google's eyes, which matters for ranking.",
        ],
      },
      {
        id: "reviews",
        heading: "Handle reviews like they're part of the job, because they are",
        paragraphs: [
          "Ask every satisfied customer to leave a review before they walk out or hang up the phone, while the good experience is still fresh. Most Kenyan SMEs only get reviews from people who are angry, which skews the whole profile.",
          "Reply to every review, good or bad, in a calm and professional tone. When someone leaves a one-star review because a boda rider was late through no fault of yours, a polite public reply does more for trust than deleting the comment ever could (and you can't delete someone else's review anyway).",
        ],
      },
      {
        id: "common-mistakes",
        heading: "The mistakes I see most often",
        paragraphs: [
          "Duplicate listings are the biggest one, usually created by accident when a business moves from Ngong Road to Kilimani and someone makes a new profile instead of updating the old one. Google punishes both listings for it.",
          "The second is ignoring the Q&A section. Random people can post fake answers to questions about your business, and if you're not checking it, wrong information about your prices or hours can sit there for months.",
        ],
      },
    ],
  },
  {
    slug: "ad-creative-testing-kenyan-brands-2026",
    category: "Paid Ads",
    title: "Ad Creative Testing for Kenyan Brands: What to Test and When to Kill It",
    excerpt: "Why one ad blows up while three others just sit there eating budget — and how to make that less random.",
    date: "2026-11-17",
    dateLabel: "November 2026",
    readTime: "5 min read",
    metaTitle: "Ad Creative Testing for Kenyan Brands: What to Test and When to Kill It",
    metaDescription: "How to run ad creative testing properly for Kenyan brands: what to test, what actually performs locally, sample size, and setting kill criteria before you launch.",
    intro: "Every brand I work with asks the same question sooner or later: why did that one ad blow up while three others just sat there eating budget? The answer is almost never luck. It's a testing process, run properly, in a market that behaves differently from the case studies you'll find on YouTube.",
    thumbnail: "https://images.unsplash.com/photo-1759417501276-a309088f1521?q=80&w=1600&auto=format&fit=crop",
    thumbnailAlt: "Professional video camera and lighting set up for a content shoot",

    sections: [
      {
        id: "what-to-test",
        heading: "Test one thing at a time, not everything at once",
        paragraphs: [
          "Hook, visual, and offer are the three things worth testing on their own. Change all three between versions and you'll have a 'winner' with no idea why it won, which means you can't repeat it.",
          "Start with the hook. In a market where people are scrolling TikTok on a Safaricom bundle they're watching the clock on, the first two seconds decide everything else.",
        ],
      },
      {
        id: "local-creative",
        heading: "What actually performs with Kenyan audiences",
        paragraphs: [
          "Sheng and everyday Swahili phrases used naturally, not forced, consistently outperform stiff corporate English in the comments and shares, especially for anything aimed at under-35s in Nairobi.",
          "Real people using the actual product on camera, in a real setting like a matatu stage, a salon chair, or someone's kitchen, beats a studio shoot almost every time for engagement rate. Polish reads as an ad. Realness reads as a recommendation from a friend.",
        ],
      },
      {
        id: "sample-size",
        heading: "Give a test enough data before you judge it",
        paragraphs: [
          "A day and a half of spend with three clicks is not a result, it's noise. Let each variant spend enough to get a meaningful number of link clicks or add-to-carts, usually a few thousand shillings per version, before comparing them.",
          "Judging too early is how good creative gets killed by accident and mediocre creative gets scaled by mistake.",
        ],
      },
      {
        id: "kill-criteria",
        heading: "Know your kill criteria before you launch, not after",
        paragraphs: [
          "Decide upfront what 'this isn't working' looks like: a cost per result above a set number, or a click-through rate under a set percentage, checked after the variant has spent enough to be judged fairly.",
          "Without a kill criteria set in advance, it's tempting to keep a creative running because you personally like it, even after the numbers have made the call.",
        ],
      },
      {
        id: "refresh-cycle",
        heading: "Build a refresh habit, not a one-off shoot",
        paragraphs: [
          "Budget for a new batch of creative every three to four weeks, even for campaigns that are performing well. Frequency climbs faster in Nairobi's smaller, more connected online audience than it does in bigger markets, so fatigue sets in sooner than most brands expect.",
          "Keep a simple swipe file of everything that's ever worked, hooks, formats, offers, so testing next month builds on what you already know instead of starting from zero every time.",
        ],
      },
    ],
  },
];

export const getPostBySlug = (slug?: string) =>
  blogPosts.find((p) => p.slug === slug);

export const getRelatedPosts = (slug: string, limit = 3) =>
  blogPosts.filter((p) => p.slug !== slug).slice(0, limit);
