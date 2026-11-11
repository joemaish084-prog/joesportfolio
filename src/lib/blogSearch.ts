import type { BlogSummary } from "@/data/blogSummaries";

type Searchable = Pick<BlogSummary, "title" | "excerpt" | "category">;

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

/**
 * Posts whose title, excerpt or category contain every word of the query.
 * Title matches rank first, then the original order is kept.
 */
export function searchPosts<T extends Searchable>(posts: T[], query: string): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { post: T; score: number; index: number }[] = [];
  posts.forEach((post, index) => {
    const title = normalize(post.title);
    const haystack = `${title} ${normalize(post.excerpt)} ${normalize(post.category)}`;
    if (!terms.every((t) => haystack.includes(t))) return;
    const score = terms.filter((t) => title.includes(t)).length;
    scored.push({ post, score, index });
  });

  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((s) => s.post);
}

/** Newest first by ISO date, without mutating the input. */
export const latestPosts = <T extends { date: string }>(posts: T[], limit: number): T[] =>
  [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);

/** True when the post was published within `days` of `now`. */
export const isRecent = (date: string, now: Date, days = 14) => {
  const published = new Date(`${date}T00:00:00Z`).getTime();
  return !Number.isNaN(published) && now.getTime() - published <= days * 86_400_000 && published <= now.getTime();
};
