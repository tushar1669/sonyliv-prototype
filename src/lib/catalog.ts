/**
 * Catalog management utilities (public JSON + Telugu helpers)
 */

export interface CatalogItem {
  id: string;
  title: string;
  language: string;           // e.g., "Telugu", "Hindi"
  category: string;           // e.g., "Movies", "Originals", "TV Shows"
  genres: string[];
  actors: string[];
  director: string;
  tags: string[];             // e.g., ["Trending", "New"]
  expiresAt: string;          // ISO date string
  posterUrl?: string;         // vertical image
  landscapeUrl?: string;      // horizontal image
}

let catalogCache: CatalogItem[] | null = null;

/**
 * Load catalog from /public/mocks/mockCatalog.json (works in dev/preview)
 */
export async function loadCatalog(): Promise<CatalogItem[]> {
  if (catalogCache) return catalogCache;

  try {
    const res = await fetch("/mocks/mockCatalog.json");
    if (!res.ok) throw new Error(`Failed to load catalog: ${res.statusText}`);
    const data = (await res.json()) as CatalogItem[];
    catalogCache = Array.isArray(data) ? data : [];
    return catalogCache;
  } catch (err) {
    console.warn("Failed to load catalog:", err);
    return [];
  }
}

function isTelugu(item: CatalogItem) {
  return item.language?.toLowerCase() === "telugu";
}

/**
 * New in Telugu (recent first by expiresAt — mock recency)
 */
export function getLatestTelugu(
  items: CatalogItem[],
  limit: number = 12
): CatalogItem[] {
  return items
    .filter(isTelugu)
    .sort(
      (a, b) =>
        new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
    )
    .slice(0, limit);
}

/**
 * Trending in Telugu (tagged “trending” first, then recent fallback)
 */
export function getTrendingTelugu(
  items: CatalogItem[],
  limit: number = 12
): CatalogItem[] {
  const telugu = items.filter(isTelugu);
  const tagged = telugu.filter((i) =>
    (i.tags || []).some((t) => /trending|hot|popular/i.test(t))
  );
  const rest = telugu
    .filter((i) => !tagged.includes(i))
    .sort(
      (a, b) =>
        new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
    );

  return [...tagged, ...rest].slice(0, limit);
}

/**
 * Unique Telugu genres (for chips/filters)
 */
export function getTeluguGenres(items: CatalogItem[]): string[] {
  const set = new Set<string>();
  items.filter(isTelugu).forEach((i) => i.genres?.forEach((g) => set.add(g)));
  return Array.from(set).sort();
}

/**
 * Generic text search
 */
export function searchCatalog(items: CatalogItem[], query: string): CatalogItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase().trim();

  return items.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.director.toLowerCase().includes(q) ||
      item.actors.some((a) => a.toLowerCase().includes(q)) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.genres.some((g) => g.toLowerCase().includes(q))
    );
  });
}

/**
 * Expiring soon (within N days)
 */
export function getExpiringSoon(items: CatalogItem[], days = 7): CatalogItem[] {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return items
    .filter((i) => {
      const d = new Date(i.expiresAt);
      return d >= now && d <= future;
    })
    .sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    );
}
