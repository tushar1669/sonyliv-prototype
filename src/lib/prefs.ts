/**
 * Preferences utility for localStorage management with SSR safety
 */

const PREFS_KEY = 'sonyliv_prefs';

interface Preferences {
  language?: string;
  theme?: 'dark' | 'light';
  autoplay?: boolean;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  subtitles?: boolean;
  profileId?: string;
}

/**
 * Get a preference value with SSR safety
 */
export function getPref<K extends keyof Preferences>(
  key: K,
  defaultValue?: Preferences[K]
): Preferences[K] | undefined {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (!stored) return defaultValue;
    
    const prefs: Preferences = JSON.parse(stored);
    return prefs[key] ?? defaultValue;
  } catch (error) {
    console.warn('Failed to get preference:', error);
    return defaultValue;
  }
}

/**
 * Set a preference value with SSR safety
 */
export function setPref<K extends keyof Preferences>(
  key: K,
  value: Preferences[K]
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = localStorage.getItem(PREFS_KEY);
    const prefs: Preferences = stored ? JSON.parse(stored) : {};
    
    prefs[key] = value;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.warn('Failed to set preference:', error);
    return false;
  }
}

/**
 * Get all preferences
 */
export function getAllPrefs(): Preferences {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(PREFS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to get all preferences:', error);
    return {};
  }
}

/**
 * Clear all preferences
 */
export function clearPrefs(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(PREFS_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to clear preferences:', error);
    return false;
  }
}

/**
 * Generic localStorage getter with SSR safety
 */
export function getStorageItem(key: string): any {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to get storage item:', error);
    return null;
  }
}

/**
 * Generic localStorage setter with SSR safety
 */
export function setStorageItem(key: string, value: any): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Failed to set storage item:', error);
    return false;
  }
}