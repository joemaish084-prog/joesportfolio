import { ShoppingBag } from "lucide-react";
import type { ServicePage } from "@/data/servicePages";

export const SHOPIFY_PATH = "/agency/shopify-services";
export const SHOPIFY_BRIEF = "/agency/contact?service=shopify-services#brief";

// Joseph supplied this store as his work. These captions describe the public
// storefront; they do not attribute individual features or claim sales results.
export const shopifyProject = {
  name: "Babyshop Dansar",
  url: "https://babyshopdansar.com/",
  description: "A Shopify storefront for baby and maternity essentials, with category-led browsing and seasonal merchandising.",
  desktop: "/work/shopify/babyshop-dansar-desktop.webp",
  mobile: "/work/shopify/babyshop-dansar-mobile.webp",
  captured: "Storefront captures · November 2026",
  details: [
    { label: "Browse", value: "Product categories" },
    { label: "Discover", value: "New arrivals & best sellers" },
    { label: "Shop", value: "Mobile product details" },
  ],
};

export const shopifyOffers = [
  {
    id: "create", number: "01", title: "Create", service: "shopify-create",
    summary: "A new store, ready for your products.",
    heading: "Start with your business.",
    description: "A Shopify store shaped around your brand, products, and customers. We agree the catalogue size, design, and launch requirements before work begins.",
    included: ["Storefront and mobile layout", "Products, collections, and navigation", "Payment and shipping setup for your market", "Test orders and launch handover"],
    cta: "Discuss a new store",
  },
  {
    id: "migrate", number: "02", title: "Migrate", service: "shopify-migrate",
    summary: "Move from WooCommerce with a plan.",
    heading: "Thinking of moving to Shopify?",
    description: "Start with a review of your current store. We map the products, content, important URLs, and integrations that need to move, then agree a migration and launch plan.",
    included: ["Current-store and feature review", "Product and customer data mapping", "Important-page redirects and SEO checks", "Test orders and launch monitoring"],
    cta: "Discuss a migration",
  },
  {
    id: "manage", number: "03", title: "Manage", service: "shopify-manage",
    summary: "Ongoing help with your existing store.",
    heading: "Keep your store moving.",
    description: "Get support with the work that keeps your store current. We agree the monthly tasks, update allowance, and communication schedule around what you need.",
    included: ["Product and collection updates", "Promotional banners and merchandising", "Storefront and app reviews", "An agreed monthly support scope"],
    cta: "Discuss store management",
  },
] as const;

export const migrationReasons = [
  "Maintenance takes too much time",
  "Updating the store is difficult",
  "The mobile experience needs work",
  "Our tools feel disconnected",
  "We are comparing platforms",
] as const;

export const shopifyServicePage: ServicePage = {
  slug: "shopify-services",
  icon: ShoppingBag,
  name: "Shopify Store Design, Migration & Management",
  navLabel: "Shopify Services",
  topic: "Shopify store services",
  areaServed: "Worldwide",
  updated: "2026-11-11",
  metaTitle: "Shopify Design, Migration & Management | Joseph Maina",
  metaDescription: "Shopify store creation, WooCommerce migration, and ongoing management for businesses in Kenya and worldwide. Explore Babyshop Dansar and discuss your store.",
  standfirst: "I create, migrate, and manage Shopify stores for businesses in Kenya and worldwide. Launch a new shop, plan your move, or get help with an existing store.",
  price: { amount: "Quoted for your scope", note: "Store builds and migrations are quoted per project. Management is scoped monthly. Shopify subscriptions, paid themes, apps, and transaction fees are separate." },
  whoFor: ["Businesses launching their first online store", "WooCommerce owners considering a move to Shopify", "Shopify stores that need a redesign or improvements", "Owners who need ongoing catalogue and storefront support"],
  included: shopifyOffers.map(offer => ({ title: offer.title, desc: offer.description })),
  faqs: [
    { q: "Do you work with Kenyan and international businesses?", a: "Yes. I am based in Nairobi and work with businesses in Kenya and worldwide. We plan payment, currency, shipping, and communication requirements around your business and customers." },
    { q: "Can you move my WooCommerce store to Shopify?", a: "Yes. We begin by reviewing your products, content, customer data, and required integrations. That review establishes what can move directly, what needs rebuilding, and whether Shopify fits your business." },
    { q: "What happens to my SEO during a migration?", a: "We map important existing URLs to their new pages, plan redirects, review page titles and content, and check the store after launch. Search visibility can change during a move; fixed rankings or traffic levels are not guaranteed." },
    { q: "Can customer passwords move from WooCommerce?", a: "Customer passwords cannot be migrated. The account sign-in approach and any customer communication are planned as part of the move. Other data, including reviews and historical orders, may need additional tools and mapping." },
    { q: "What does ongoing Shopify management include?", a: "Management can cover product uploads, collections, promotional banners, merchandising, and storefront reviews. The proposal sets the monthly tasks, update allowance, and support schedule. SEO and advertising are scoped separately." },
    { q: "How much will my Shopify project cost?", a: "Pricing depends on catalogue size, design requirements, integrations, and any migration work. Builds and migrations are quoted per project; ongoing management is scoped monthly. Shopify subscriptions, paid themes, apps, and transaction fees are separate from my fee." },
  ],
  hubSlug: "",
  relatedPosts: [],
  cta: { heading: "Tell me about your store", body: "Share your current store link, what you need, and the customers you want to reach. We will agree the scope and next step.", label: "Discuss your Shopify project", href: SHOPIFY_BRIEF },
  draft: false,
  reviewNotes: [],
};
