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
];

export const getPostBySlug = (slug?: string) =>
  blogPosts.find((p) => p.slug === slug);

export const getRelatedPosts = (slug: string, limit = 3) =>
  blogPosts.filter((p) => p.slug !== slug).slice(0, limit);
