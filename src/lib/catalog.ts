/**
 * Catalog management utilities (robust path fallback)
 */

export interface CatalogItem {
  id: string;
  title: string;
  language: string;             // e.g., "Telugu"
  category: string;             // e.g., "Movies" | "Originals"
  genres: string[];             // e.g., ["Action","Drama"]
  actors: string[];
  director: string;
  tags: string[];
  expiresAt: string;            // ISO date string
  posterUrl?: string;           // portrait card
  landscapeUrl?: string;        // landscape card
}

let catalogCache: CatalogItem[] | null = null;

/**
 * Try a list of paths until one succeeds (supports accidental public/public/)
 */
async function tryPaths<T = unknown>(paths: string[]): Promise<T | null> {
  for (const p of paths) {
    try {
      const res = await fetch(p, { cache: "no-store" });
      if (res.ok) {
        return (await res.json()) as T;
      }
      // If 404, keep trying next path
      if (res.status !== 404) {
        console.warn(`[catalog] "${p}" returned ${res.status}. Trying next path…`);
      }
    } catch (e) {
      console.warn(`[catalog] Failed to fetch "${p}":`, e);
    }
  }
  return null;
}

/**
 * Normalize raw records into CatalogItem (tolerates partial fields)
 */
function normalize(items: any[]): CatalogItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((it, i) => {
    const id = String(it.id ?? i);
    return {
      id,
      title: String(it.title ?? "Untitled"),
      language: String(it.language ?? "Telugu"),
      category: String(it.category ?? "Movies"),
      genres: Array.isArray(it.genres) ? it.genres.map(String) : [],
      actors: Array.isArray(it.actors) ? it.actors.map(String) : [],
      director: String(it.director ?? ""),
      tags: Array.isArray(it.tags) ? it.tags.map(String) : [],
      expiresAt: String(it.expiresAt ?? new Date(Date.now() + 30 * 864e5).toISOString()),
      posterUrl: it.posterUrl ?? "/placeholder.svg",
      landscapeUrl: it.landscapeUrl ?? it.posterUrl ?? "/placeholder.svg",
    };
  });
}

/**
 * Load catalog data with caching.
 * Tries, in order:
 *  1) /mocks/mockCatalog.json                      (recommended)
 *  2) /public/mocks/mockCatalog.json               (handles public/public/ case)
 *  3) /src/mocks/mockCatalog.json                  (older local paths)
 */
export async function loadCatalog(): Promise<CatalogItem[]> {
  if (catalogCache) return catalogCache;

  const candidatePaths = [
    "/mocks/mockCatalog.json",
    "/public/mocks/mockCatalog.json",
    "/src/mocks/mockCatalog.json",
  ];

  const raw = await tryPaths<any[]>(candidatePaths);
  if (!raw) {
    console.warn(
      "[catalog] Could not find mockCatalog.json at any known path. " +
      "Ensure it exists at public/mocks/mockCatalog.json (or public/public/mocks/mockCatalog.json)."
    );
    catalogCache = [];
    return catalogCache;
  }

  catalogCache = normalize(raw);
  return catalogCache;
}

/** Filter catalog items by language */
export function filterByLanguage(items: CatalogItem[], language: string): CatalogItem[] {
  if (!language || language.toLowerCase() === "all") return items;
  return items.filter((it) => it.language?.toLowerCase() === language.toLowerCase());
}

/** Filter catalog items by genres */
export function filterByGenres(items: CatalogItem[], genres: string[]): CatalogItem[] {
  if (!genres?.length) return items;
  const want = genres.map((g) => g.toLowerCase());
  return items.filter((it) =>
    it.genres?.some((g: string) => want.some((w) => g.toLowerCase().includes(w)))
  );
}

/** Mock trending: prioritize Originals/Movies + newer expiry */
export function trending(items: CatalogItem[], language?: string, limit = 10): CatalogItem[] {
  const filtered = language ? filterByLanguage(items, language) : items;
  const buckets = new Set(["Originals", "Movies"]);
  return [...filtered]
    .sort((a, b) => {
      const aScore = buckets.has(a.category) ? 2 : 1;
      const bScore = buckets.has(b.category) ? 2 : 1;
      if (aScore !== bScore) return bScore - aScore;
      return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
    })
    .slice(0, limit);
}

/** Search by title / people / tags / genres */
export function searchCatalog(items: CatalogItem[], query: string): CatalogItem[] {
  const q = query?.trim().toLowerCase();
  if (!q) return items;
  return items.filter((it) => {
    return (
      it.title?.toLowerCase().includes(q) ||
      it.director?.toLowerCase().includes(q) ||
      it.actors?.some((a) => a.toLowerCase().includes(q)) ||
      it.tags?.some((t) => t.toLowerCase().includes(q)) ||
      it.genres?.some((g) => g.toLowerCase().includes(q))
    );
  });
}

/** Items expiring within N days (ascending by soonest) */
export function getExpiringSoon(items: CatalogItem[], days = 7): CatalogItem[] {
  const now = Date.now();
  const cutoff = now + days * 864e5;
  return items
    .filter((it) => {
      const t = new Date(it.expiresAt).getTime();
      return t >= now && t <= cutoff;
    })
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
}

/** Get latest items by language sorted by recent expiration date */
export function getLatestByLanguage(items: CatalogItem[], language: string, limit = 12): CatalogItem[] {
  return filterByLanguage(items, language)
    .sort((a, b) => {
      const dateA = new Date(a.expiresAt).getTime();
      const dateB = new Date(b.expiresAt).getTime();
      if (dateA !== dateB) return dateB - dateA; // newest expiration first
      return a.title.localeCompare(b.title); // then by title
    })
    .slice(0, limit);
}

/** Get trending items by language */
export function getTrendingByLanguage(items: CatalogItem[], language: string, limit = 12): CatalogItem[] {
  return trending(items, language, limit);
}

/** Helpers for homepage rails */
export function getLatestTelugu(items: CatalogItem[], limit = 10): CatalogItem[] {
  return getLatestByLanguage(items, 'Telugu', limit);
}

export function getTrendingTelugu(items: CatalogItem[], limit = 10): CatalogItem[] {
  return getTrendingByLanguage(items, 'Telugu', limit);
}
