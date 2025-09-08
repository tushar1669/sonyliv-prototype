/**
 * Progress tracking utilities (localStorage-based)
 */

export type ProgressEntry = {
  position: number;      // seconds watched
  duration: number;      // seconds (mock)
  updatedAt: number;     // Date.now()
  completed: boolean;
};

export type ProgressMap = Record<string, ProgressEntry>; // key = itemId

const KEY = 'yliv.progress';

/**
 * Get the full progress map from localStorage
 */
export function getProgressMap(): ProgressMap {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to read progress from localStorage:', error);
    return {};
  }
}

/**
 * Get progress for a specific item
 */
export function getProgress(id: string): ProgressEntry | null {
  const map = getProgressMap();
  return map[id] || null;
}

/**
 * Set progress for an item and dispatch change event
 */
export function setProgress(id: string, entry: ProgressEntry): void {
  try {
    const map = getProgressMap();
    map[id] = entry;
    localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('yliv:progress:changed', { detail: { id } }));
  } catch (error) {
    console.warn('Failed to save progress to localStorage:', error);
  }
}

/**
 * Mark an item as completed
 */
export function markComplete(id: string, duration: number): void {
  const entry: ProgressEntry = {
    position: duration,
    duration,
    updatedAt: Date.now(),
    completed: true
  };
  setProgress(id, entry);
}

/**
 * Get IDs for continue watching (sorted by most recent, not completed)
 */
export function getContinueWatchingIds(limit = 12): string[] {
  const map = getProgressMap();
  const entries = Object.entries(map)
    .filter(([_, entry]) => !entry.completed && entry.position > 0)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, limit);
  
  return entries.map(([id]) => id);
}