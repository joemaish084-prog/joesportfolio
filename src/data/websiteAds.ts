import { packageFeeKes, serviceFeeKes } from "@/data/services";

export const websiteAdsSlug = "website-and-ads";
export const websiteAdsPath = `/agency/${websiteAdsSlug}`;
export const websiteAdsLabel = "Website + 90-Day Ads";
export const websiteAdsDescription = "A new website and three months of ads for Kenyan retailers and service businesses.";
export const websiteAdsMonths = 3;

export const websiteAdsHero = {
  src: "/media/partnership/nairobi-market-960.webp",
  srcSet: "/media/partnership/nairobi-market-480.webp 480w, /media/partnership/nairobi-market-960.webp 960w",
  alt: "Roadside fruit stalls in a Nairobi market",
  caption: "Nairobi, Kenya",
  width: 960,
  height: 640,
};

export const websiteAdsPlans = [
  {
    id: "growth",
    name: "Growth",
    buildFee: 120_000,
    scope: {
      retail: {
        title: "Online shop with checkout and up to 25 products",
        details: [
          "Give shoppers product pages with pricing, photos and a cart so they can place orders online.",
          "Agree on payment and delivery options before the build. The quote covers the setup needed for your store.",
        ],
      },
      services: {
        title: "Full service website with booking or quote requests",
        details: [
          "Give priority services their own pages with room for past work, testimonials you provide and areas you serve.",
          "Send enquiries to a quote form or connect an existing booking tool, depending on how your team takes bookings.",
        ],
      },
    },
    campaignScope: "Up to two ad platforms, with reviews every two weeks",
    campaignDetails: "Start with the strongest channel and add a second when the audience and budget justify it. Review performance by channel and by offer.",
    options: [{ name: "Campaign budget", management: packageFeeKes("GROWTH"), media: 50_000 }],
  },
  {
    id: "launch",
    name: "Launch",
    buildFee: 50_000,
    scope: {
      retail: {
        title: "Catalogue of up to 10 products with WhatsApp ordering",
        details: [
          "Give shoppers a mobile-friendly catalogue with product photos, prices and details you supply.",
          "Send shoppers to WhatsApp to confirm availability, payment and delivery with your team.",
        ],
      },
      services: {
        title: "Three-page website with a quote form",
        details: [
          "Show one priority offer, examples of your work and the area you cover across a compact site.",
          "Give customers a quote form and clear call or WhatsApp links so your team can follow up.",
        ],
      },
    },
    campaignScope: "One offer and one ad platform, with monthly reporting",
    campaignDetails: "Choose Google or Meta based on how customers find what you sell. Send traffic to one focused offer and review the enquiries or orders it generated each month.",
    options: [
      { name: "Meta", management: serviceFeeKes("meta-ads"), media: 30_000 },
      { name: "Google", management: serviceFeeKes("google-ads"), media: 25_000 },
    ],
  },
] as const;

/** Problems owners describe before they hire us, each paired with what the package changes. */
export const websiteAdsProblems = [
  {
    problem: "Your ads send people to an Instagram page or an old website.",
    fix: "Ads land on a site built around the offer, with one clear next step: order, book or ask for a quote.",
  },
  {
    problem: "Your web designer and your ads person blame each other.",
    fix: "Nuvana builds the site and JM runs the ads on one plan, with one goal agreed before anything goes live.",
  },
  {
    problem: "You can’t tell whether the ads bring in customers.",
    fix: "Tracking is tested before launch. Your report shows enquiries, orders and what each one cost.",
  },
  {
    problem: "Enquiries arrive, then go cold.",
    fix: "Forms and WhatsApp links reach the right person on your team, and we review which ones became sales.",
  },
] as const;

export const websiteAdsExamples = [
  {
    title: "For retailers",
    example: "A beauty retailer wants to promote a skincare range. With Launch, shoppers browse the range and order on WhatsApp. With Growth, they can add products to a cart and check out online.",
    measurement: "Report product enquiries and WhatsApp clicks. Use your order records to count confirmed chat orders, or track purchases and cost per purchase through online checkout.",
    href: "/work/case-studies#google-ads-launch",
    linkLabel: "See JM’s retail ads case study",
  },
  {
    title: "For service businesses",
    example: "A water-filter installer wants more quotes from customers in Nairobi. With Launch, ads point to one installation offer. With Growth, the site can cover several services and direct visitors to the relevant quote or booking page.",
    measurement: "Agree on what makes a qualified enquiry, such as the service and location. Track form submissions and contact clicks, then review quotes sent and jobs booked using your team’s records.",
    href: "/agency/blog/convey-communications-case-study-10x-leads",
    linkLabel: "See JM’s lead generation case study",
  },
] as const;

export const websiteAdsResponsibilities = [
  {
    title: "Nuvana builds the site",
    items: [
      "Plan pages, catalogue or checkout around how your customers buy.",
      "Build a mobile-friendly site using your approved brand assets, product details or service copy.",
      "Test the purchase or enquiry flow, then hand over access for the agreed setup.",
    ],
  },
  {
    title: "JM runs the campaigns",
    items: [
      "Select the first offer, locations and channels based on your customers and budget.",
      "Write and set up campaigns, verify the agreed tracking, and review performance during the three months.",
      "Report what came in, what it cost and what changed. Use your confirmed sales or bookings in the review when available.",
    ],
  },
  {
    title: "Your team closes the loop",
    items: [
      "Share product information, prices, photos, service areas and the access needed to get started.",
      "Approve the website, offer and ads. Assign someone to respond to calls, forms and WhatsApp enquiries.",
      "Record which enquiries qualified and led to orders or bookings so we can improve the next round of ads.",
    ],
  },
] as const;

export const websiteAdsTimeline = [
  {
    stage: "Before launch",
    title: "Build and test",
    body: "Agree on the offer, website scope and budget. Build the site, then test that a quote request, chat click or purchase is recorded and reaches the right place.",
  },
  {
    stage: "Month 1",
    title: "Launch and measure",
    body: "Start the agreed campaign and check that spend, traffic and tracking are working as planned. Use the first results to establish a baseline for orders or qualified enquiries.",
  },
  {
    stage: "Month 2",
    title: "Improve what customers see",
    body: "Refine search terms, audiences, creative or the page people land on. Use feedback from actual enquiries and orders to decide where to move the budget.",
  },
  {
    stage: "Month 3",
    title: "Review and decide",
    body: "Review costs, confirmed outcomes and what improved. Get a recommendation for which offers, channels or site changes make sense for the next campaign.",
  },
] as const;

export const websiteAdsFaqs = [
  {
    q: "Can I use my existing website?",
    a: "Yes, if it can support the campaign. Share the site for review and we’ll quote the updates it needs or advise on a rebuild if the scope calls for one.",
  },
  {
    q: "When do the three months start?",
    a: "The three months start when your ads go live. Before then we build or prepare the website, agree on your offer and test the customer journey and tracking.",
  },
  {
    q: "Do I get Google and Meta on both packages?",
    a: "Launch covers one platform. Growth covers up to two. We recommend a mix after reviewing your audience, offer and media budget.",
  },
  {
    q: "Who pays for the ads?",
    a: "You pay the ad platforms directly through your ad account. Our proposal shows the website fee, monthly campaign management and planned ad budget as individual costs.",
  },
  {
    q: "Can customers order on WhatsApp?",
    a: "Yes. The Launch catalogue sends shoppers to WhatsApp. Your team confirms availability, payment and delivery, and records completed orders so we can include them in the review.",
  },
  {
    q: "Can we add online payments or sync our stock?",
    a: "Growth can include an online store with checkout. Tell us which payment, delivery or stock tools you already use so Nuvana can verify compatibility and quote the setup.",
  },
  {
    q: "Who owns the domain and ad accounts?",
    a: "You own your domain and ad accounts. We’ll agree who manages hosting, renewals, third-party subscriptions and ongoing website support in your quote.",
  },
  {
    q: "How will we judge whether it’s working?",
    a: "We agree on the main measure before launch, such as cost per qualified enquiry or cost per online purchase. Your budget, offer and close rate help set a target. We review it against the actual results over the three months.",
  },
  {
    q: "What happens after month three?",
    a: "We review the campaign results and recommend what to do next. If you want to continue with ads or website support, we scope the next period with you.",
  },
];
