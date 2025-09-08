/**
 * Catalog management utilities (Telugu-first helpers)
 */

export type CatalogItem = {
  id: string;
  title: string;
  language: string; // e.g., "Telugu"
  category?: "Originals" | "Movies" | "TV" | string;
  genres: string[];
  actors: string[];
  director?: string;
  tags: string[];
  expiresAt?: string;   // ISO date string
  releaseDate?: string; // ISO date string
  posterUrl?: string;   // portrait 2:3
  landscapeUrl?: string; // landscape 16:9
};

let catalogCache: CatalogItem[] | null = null;

// ---------- internal: normalize & safe parsing ----------

function toTime(value?: string): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

function normalizeItem(raw: any): CatalogItem {
  const placeholder = "/placeholder.svg";

  return {
    id: String(raw?.id ?? cryptoRandomId()),
    title: String(raw?.title ?? "Untitled"),
    language: String(raw?.language ?? "Unknown"),
    category: raw?.category ?? "Movies",
    genres: Array.isArray(raw?.genres) ? raw.genres : [],
    actors: Array.isArray(raw?.actors) ? raw.actors : [],
    director: raw?.director ?? "",
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    expiresAt: raw?.expiresAt,
    releaseDate: raw?.releaseDate,
    posterUrl: raw?.posterUrl || raw?.image || placeholder,
    landscapeUrl: raw?.landscapeUrl || raw?.backdrop || raw?.posterUrl || placeholder,
  };
}

function cryptoRandomId() {
  // Lightweight id for mocks (no crypto dependency required)
  return Math.random().toString(36).slice(2, 10);
}

// ---------- load & cache ----------

/**
 * Load catalog data with caching
 * (In production this would call an API)
 */
export async function loadCatalog(): Promise<CatalogItem[]> {
  if (catalogCache) return catalogCache;

  try {
    const response = await fetch("/src/mocks/mockCatalog.json");
    if (!response.ok) throw new Error(`Failed to load catalog: ${response.statusText}`);

    const raw = await response.json();
    const items: CatalogItem[] = Array.isArray(raw) ? raw.map(normalizeItem) : [];
    catalogCache = items;
    return items;
  } catch (error) {
    console.warn("Failed to load catalog:", error);
    catalogCache = [];
    return [];
  }
}

// ---------- filters & finders ----------

export function filterByLanguage(items: CatalogItem[], language?: string): CatalogItem[] {
  if (!language || language.toLowerCase() === "all") return items;
  const lang = language.toLowerCase();
  return items.filter((it) => (it.language || "").toLowerCase() === lang);
}

export function filterByGenres(items: CatalogItem[], genres: string[]): CatalogItem[] {
  if (!genres?.length) return items;
  const needles = genres.map((g) => g.toLowerCase());
  return items.filter((it) =>
    it.genres?.some((g) => needles.some((n) => g.toLowerCase().includes(n)))
  );
}

export function searchCatalog(items: CatalogItem[], query: string): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((it) => {
    return (
      it.title.toLowerCase().includes(q) ||
      it.actors?.some((a) => a.toLowerCase().includes(q)) ||
      (it.director || "").toLowerCase().includes(q) ||
      it.tags?.some((t) => t.toLowerCase().includes(q)) ||
      it.genres?.some((g) => g.toLowerCase().includes(q))
    );
  });
}

/**
 * Very light "trending" heuristic for mocks:
 * - Originals above others
 * - Newer release dates first
 */
export function trending(items: CatalogItem[], limit = 10): CatalogItem[] {
  return [...items]
    .sort((a, b) => {
      const as = a.category === "Originals" ? 2 : 1;
      const bs = b.category === "Originals" ? 2 : 1;
      if (as !== bs) return bs - as;

      const ar = toTime(a.releaseDate);
      const br = toTime(b.releaseDate);
      return br - ar;
    })
    .slice(0, limit);
}

export function getExpiringSoon(items: CatalogItem[], days = 7): CatalogItem[] {
  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;

  return items
    .filter((it) => {
      const t = toTime(it.expiresAt);
      return t && t >= now && t <= end;
    })
    .sort((a, b) => toTime(a.expiresAt) - toTime(b.expiresAt));
}

// ---------- Telugu-first helpers used by Home ----------

export async function getLatestTelugu(limit = 12): Promise<CatalogItem[]> {
  const all = await loadCatalog();
  const telugu = filterByLanguage(all, "Telugu");
  return [...telugu]
    .sort((a, b) => toTime(b.releaseDate) - toTime(a.releaseDate))
    .slice(0, limit);
}

export async function getTrendingTelugu(limit = 12): Promise<CatalogItem[]> {
  const all = await loadCatalog();
  return trending(filterByLanguage(all, "Telugu"), limit);
}
