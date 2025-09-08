import type { CatalogItem } from './catalog';
import type { YPref } from './prefs';

export type ChallengeTaskId =
  | 'watch_1'
  | 'watch_3'
  | 'pref_genre_1'
  | 'add_watchlist_2';

export type ChallengeTask = {
  id: ChallengeTaskId;
  title: string;
  target: number;
  progress: number;
  done: boolean;
  hint?: string;
};

export type ChallengeState = {
  startedAt: number;  // Date.now()
  day: number;        // 1..7 (ceil((now-start)/86400))
  tasks: ChallengeTask[];
  completedAt?: number | null;
};

const KEY = 'yliv.challenge';
const DAY_MS = 86400000; // 24 * 60 * 60 * 1000

export function loadChallenge(): ChallengeState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to read challenge from localStorage:', error);
    return null;
  }
}

export function startChallenge(): ChallengeState {
  const now = Date.now();
  const state: ChallengeState = {
    startedAt: now,
    day: 1,
    tasks: [
      {
        id: 'watch_1',
        title: 'Finish 1 title',
        target: 1,
        progress: 0,
        done: false,
        hint: 'Complete any movie or show'
      },
      {
        id: 'watch_3',
        title: 'Finish 3 titles',
        target: 3,
        progress: 0,
        done: false,
        hint: 'Build your watching streak'
      },
      {
        id: 'pref_genre_1',
        title: 'Finish 1 in your genre',
        target: 1,
        progress: 0,
        done: false,
        hint: 'Watch content in your selected genres'
      },
      {
        id: 'add_watchlist_2',
        title: 'Add 2 to Watchlist',
        target: 2,
        progress: 0,
        done: false,
        hint: 'Save titles to watch later'
      }
    ],
    completedAt: null
  };
  
  saveChallenge(state);
  return state;
}

export function saveChallenge(state: ChallengeState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save challenge to localStorage:', error);
  }
}

export function getDay(state: ChallengeState): number {
  const now = Date.now();
  const elapsed = now - state.startedAt;
  return Math.min(Math.ceil(elapsed / DAY_MS), 7);
}

export function isActive(state: ChallengeState): boolean {
  return getDay(state) <= 7 && !state.completedAt;
}

export function onContentFinished(state: ChallengeState, item: CatalogItem, userPref?: YPref): ChallengeState {
  if (!isActive(state)) return state;
  
  const newState = { ...state };
  newState.day = getDay(newState);
  newState.tasks = [...state.tasks];
  
  let changed = false;
  
  // Update watch_1 task
  const watch1Task = newState.tasks.find(t => t.id === 'watch_1');
  if (watch1Task && !watch1Task.done) {
    watch1Task.progress = Math.min(watch1Task.progress + 1, watch1Task.target);
    watch1Task.done = watch1Task.progress >= watch1Task.target;
    changed = true;
  }
  
  // Update watch_3 task
  const watch3Task = newState.tasks.find(t => t.id === 'watch_3');
  if (watch3Task && !watch3Task.done) {
    watch3Task.progress = Math.min(watch3Task.progress + 1, watch3Task.target);
    watch3Task.done = watch3Task.progress >= watch3Task.target;
    changed = true;
  }
  
  // Update pref_genre_1 task if item matches user genres
  const prefGenreTask = newState.tasks.find(t => t.id === 'pref_genre_1');
  if (prefGenreTask && !prefGenreTask.done && userPref?.genres) {
    const itemGenres = item.genres.map(g => g.toLowerCase());
    const userGenres = userPref.genres.map(g => g.toLowerCase());
    const hasMatchingGenre = itemGenres.some(g => userGenres.includes(g));
    
    if (hasMatchingGenre) {
      prefGenreTask.progress = Math.min(prefGenreTask.progress + 1, prefGenreTask.target);
      prefGenreTask.done = prefGenreTask.progress >= prefGenreTask.target;
      changed = true;
    }
  }
  
  // Check if all tasks are complete
  if (newState.tasks.every(t => t.done) && !newState.completedAt) {
    newState.completedAt = Date.now();
    changed = true;
  }
  
  if (changed) {
    saveChallenge(newState);
  }
  
  return newState;
}

export function onWatchlistChanged(state: ChallengeState, newIds: string[]): ChallengeState {
  if (!isActive(state)) return state;
  
  const newState = { ...state };
  newState.day = getDay(newState);
  newState.tasks = [...state.tasks];
  
  // Update add_watchlist_2 task based on current watchlist count
  const watchlistTask = newState.tasks.find(t => t.id === 'add_watchlist_2');
  if (watchlistTask && !watchlistTask.done) {
    watchlistTask.progress = Math.min(newIds.length, watchlistTask.target);
    watchlistTask.done = watchlistTask.progress >= watchlistTask.target;
    
    // Check if all tasks are complete
    if (newState.tasks.every(t => t.done) && !newState.completedAt) {
      newState.completedAt = Date.now();
    }
    
    saveChallenge(newState);
  }
  
  return newState;
}

export function getPercent(state: ChallengeState): number {
  const totalProgress = state.tasks.reduce((sum, task) => sum + task.progress, 0);
  const totalTarget = state.tasks.reduce((sum, task) => sum + task.target, 0);
  return totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0;
}

export function ensureChallengeStarted(): ChallengeState {
  const existing = loadChallenge();
  return existing || startChallenge();
}