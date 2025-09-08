export type Watchlist = string[]; // item ids

/**
 * Get the current watchlist from localStorage
 */
export function getWatchlist(): Watchlist {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('yliv.watchlist');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to read watchlist from localStorage:', error);
    return [];
  }
}

/**
 * Add an item to the watchlist
 */
export function addToWatchlist(id: string): Watchlist {
  const currentList = getWatchlist();
  if (!currentList.includes(id)) {
    const newList = [...currentList, id];
    try {
      localStorage.setItem('yliv.watchlist', JSON.stringify(newList));
      window.dispatchEvent(new CustomEvent('yliv:watchlist:changed', { detail: newList }));
      return newList;
    } catch (error) {
      console.warn('Failed to save to watchlist:', error);
      return currentList;
    }
  }
  return currentList;
}

/**
 * Remove an item from the watchlist
 */
export function removeFromWatchlist(id: string): Watchlist {
  const currentList = getWatchlist();
  const newList = currentList.filter(itemId => itemId !== id);
  
  try {
    localStorage.setItem('yliv.watchlist', JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent('yliv:watchlist:changed', { detail: newList }));
    return newList;
  } catch (error) {
    console.warn('Failed to remove from watchlist:', error);
    return currentList;
  }
}

/**
 * Check if an item is in the watchlist
 */
export function isInWatchlist(id: string): boolean {
  return getWatchlist().includes(id);
}