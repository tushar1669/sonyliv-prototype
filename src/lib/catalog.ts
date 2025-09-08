/**
 * Catalog management utilities
 */

export interface CatalogItem {
  id: string;
  title: string;
  language: string;
  category: string;
  genres: string[];
  actors: string[];
  director: string;
  tags: string[];
  expiresAt: string; // ISO date string
}

let catalogCache: CatalogItem[] | null = null;

/**
 * Load catalog data with caching
 */
export async function loadCatalog(): Promise<CatalogItem[]> {
  if (catalogCache) {
    return catalogCache;
  }

  try {
    // In production, this would be an API call
    const response = await fetch('/src/mocks/mockCatalog.json');
    if (!response.ok) {
      throw new Error(`Failed to load catalog: ${response.statusText}`);
    }
    
    catalogCache = await response.json();
    return catalogCache || [];
  } catch (error) {
    console.warn('Failed to load catalog:', error);
    return [];
  }
}

/**
 * Filter catalog items by language
 */
export function filterByLanguage(
  items: CatalogItem[], 
  language: string
): CatalogItem[] {
  if (!language || language === 'all') {
    return items;
  }
  
  return items.filter(item => 
    item.language.toLowerCase() === language.toLowerCase()
  );
}

/**
 * Filter catalog items by genres
 */
export function filterByGenres(
  items: CatalogItem[], 
  genres: string[]
): CatalogItem[] {
  if (!genres.length) {
    return items;
  }
  
  return items.filter(item =>
    genres.some(genre =>
      item.genres.some(itemGenre =>
        itemGenre.toLowerCase().includes(genre.toLowerCase())
      )
    )
  );
}

/**
 * Get trending content for a specific language
 * This is a mock implementation - would use real analytics in production
 */
export function trending(
  items: CatalogItem[],
  language?: string,
  limit: number = 10
): CatalogItem[] {
  let filtered = language ? filterByLanguage(items, language) : items;
  
  // Mock trending logic: newer items + popular categories
  const trendingCategories = ['Originals', 'Movies'];
  const prioritized = filtered.sort((a, b) => {
    // Prioritize originals and recent releases
    const aScore = (trendingCategories.includes(a.category) ? 2 : 1);
    const bScore = (trendingCategories.includes(b.category) ? 2 : 1);
    
    if (aScore !== bScore) {
      return bScore - aScore;
    }
    
    // Then by expiration date (newer first)
    return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
  });
  
  return prioritized.slice(0, limit);
}

/**
 * Search catalog items by title, actors, or tags
 */
export function searchCatalog(
  items: CatalogItem[],
  query: string
): CatalogItem[] {
  if (!query.trim()) {
    return items;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return items.filter(item => {
    return (
      item.title.toLowerCase().includes(searchTerm) ||
      item.actors.some(actor => actor.toLowerCase().includes(searchTerm)) ||
      item.director.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      item.genres.some(genre => genre.toLowerCase().includes(searchTerm))
    );
  });
}

/**
 * Get items expiring soon (within specified days)
 */
export function getExpiringSoon(
  items: CatalogItem[],
  days: number = 7
): CatalogItem[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return items
    .filter(item => {
      const expiryDate = new Date(item.expiresAt);
      return expiryDate >= now && expiryDate <= futureDate;
    })
    .sort((a, b) => 
      new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    );
}