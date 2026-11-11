import { describe, expect, it } from "vitest";
import { isRecent, latestPosts, searchPosts } from "./blogSearch";

const posts = [
  { title: "How Much Should a Kenyan SME Spend on Meta Ads?", excerpt: "Budget guide.", category: "Meta Ads", date: "2026-05-01" },
  { title: "Local SEO in Nairobi", excerpt: "Rank on Google Maps with Meta tips.", category: "SEO", date: "2026-11-10" },
  { title: "TikTok Ads for Retail", excerpt: "Short video that sells.", category: "TikTok", date: "2026-09-01" },
];

describe("searchPosts", () => {
  it("returns nothing for an empty query", () => {
    expect(searchPosts(posts, "   ")).toEqual([]);
  });

  it("requires every word to match and ranks title hits first", () => {
    expect(searchPosts(posts, "meta").map((p) => p.category)).toEqual(["Meta Ads", "SEO"]);
    expect(searchPosts(posts, "meta nairobi").map((p) => p.category)).toEqual(["SEO"]);
  });

  it("ignores case and punctuation", () => {
    expect(searchPosts(posts, "TIKTOK!")).toHaveLength(1);
  });
});

describe("latestPosts", () => {
  it("sorts newest first without mutating", () => {
    const copy = [...posts];
    expect(latestPosts(posts, 2).map((p) => p.date)).toEqual(["2026-11-10", "2026-09-01"]);
    expect(posts).toEqual(copy);
  });
});

describe("isRecent", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  it("flags posts from the last 14 days only", () => {
    expect(isRecent("2026-11-10", now)).toBe(true);
    expect(isRecent("2026-10-01", now)).toBe(false);
    expect(isRecent("2026-12-01", now)).toBe(false);
  });
});
