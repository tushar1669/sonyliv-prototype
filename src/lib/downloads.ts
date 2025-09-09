import type { CatalogItem } from "./catalog";

export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';

export type DownloadEntry = {
  id: string;           // catalog item id
  title: string;
  bytesTotal: number;   // mock
  bytesDone: number;
  status: DownloadStatus;
  updatedAt: number;
};

export type DownloadsMap = Record<string, DownloadEntry>; // key=itemId

const KEY = 'yliv.downloads';
let progressInterval: NodeJS.Timeout | null = null;

export function loadDownloads(): DownloadsMap {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveDownloads(map: DownloadsMap): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
    // Dispatch change event
    window.dispatchEvent(new CustomEvent('yliv:downloads:changed', { detail: { map } }));
  } catch (e) {
    console.error('Failed to save downloads:', e);
  }
}

export function getEntry(id: string): DownloadEntry | null {
  const downloads = loadDownloads();
  return downloads[id] || null;
}

function getMockSize(title: string): number {
  // Generate mock size between 150-400 MB based on title hash
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) & 0xffffffff;
  }
  const normalized = Math.abs(hash) % 251; // 0-250
  return (150 + normalized) * 1024 * 1024; // 150-400 MB in bytes
}

export function queueDownload(item: CatalogItem): DownloadEntry {
  const downloads = loadDownloads();
  
  if (downloads[item.id]) {
    return downloads[item.id];
  }
  
  const entry: DownloadEntry = {
    id: item.id,
    title: item.title,
    bytesTotal: getMockSize(item.title),
    bytesDone: 0,
    status: 'queued',
    updatedAt: Date.now()
  };
  
  downloads[item.id] = entry;
  saveDownloads(downloads);
  
  console.log('dl_queued', { 
    id: item.id, 
    title: item.title, 
    status: 'queued', 
    bytesDone: 0, 
    bytesTotal: entry.bytesTotal 
  });
  
  return entry;
}

export function startDownload(id: string): void {
  const downloads = loadDownloads();
  const entry = downloads[id];
  
  if (!entry) return;
  
  entry.status = 'downloading';
  entry.updatedAt = Date.now();
  downloads[id] = entry;
  saveDownloads(downloads);
  
  console.log('dl_started', { 
    id, 
    title: entry.title, 
    status: 'downloading', 
    bytesDone: entry.bytesDone, 
    bytesTotal: entry.bytesTotal 
  });
}

export function pauseDownload(id: string): void {
  const downloads = loadDownloads();
  const entry = downloads[id];
  
  if (!entry || entry.status !== 'downloading') return;
  
  entry.status = 'paused';
  entry.updatedAt = Date.now();
  downloads[id] = entry;
  saveDownloads(downloads);
  
  console.log('dl_paused', { 
    id, 
    title: entry.title, 
    status: 'paused', 
    bytesDone: entry.bytesDone, 
    bytesTotal: entry.bytesTotal 
  });
}

export function resumeDownload(id: string): void {
  const downloads = loadDownloads();
  const entry = downloads[id];
  
  if (!entry || entry.status !== 'paused') return;
  
  entry.status = 'downloading';
  entry.updatedAt = Date.now();
  downloads[id] = entry;
  saveDownloads(downloads);
  
  console.log('dl_resumed', { 
    id, 
    title: entry.title, 
    status: 'downloading', 
    bytesDone: entry.bytesDone, 
    bytesTotal: entry.bytesTotal 
  });
}

export function cancelDownload(id: string): void {
  const downloads = loadDownloads();
  const entry = downloads[id];
  
  if (!entry) return;
  
  console.log('dl_cancelled', { 
    id, 
    title: entry.title, 
    status: entry.status, 
    bytesDone: entry.bytesDone, 
    bytesTotal: entry.bytesTotal 
  });
  
  delete downloads[id];
  saveDownloads(downloads);
}

export function markFailed(id: string): void {
  const downloads = loadDownloads();
  const entry = downloads[id];
  
  if (!entry) return;
  
  entry.status = 'failed';
  entry.updatedAt = Date.now();
  downloads[id] = entry;
  saveDownloads(downloads);
  
  console.log('dl_failed', { 
    id, 
    title: entry.title, 
    status: 'failed', 
    bytesDone: entry.bytesDone, 
    bytesTotal: entry.bytesTotal 
  });
}

export function clearCompleted(): void {
  const downloads = loadDownloads();
  const completedIds = Object.keys(downloads).filter(id => downloads[id].status === 'completed');
  
  for (const id of completedIds) {
    delete downloads[id];
  }
  
  if (completedIds.length > 0) {
    saveDownloads(downloads);
    console.log('dl_cleared_completed', { count: completedIds.length });
  }
}

// Fake progress ticker - increment bytesDone every 300ms while downloading
export function attachTicker(): void {
  if (progressInterval) return; // Already running
  
  progressInterval = setInterval(() => {
    const downloads = loadDownloads();
    let hasChanges = false;
    
    Object.keys(downloads).forEach(id => {
      const entry = downloads[id];
      
      if (entry.status === 'downloading' && entry.bytesDone < entry.bytesTotal) {
        // Increment by random amount (0.5-2% of total size per tick)
        const increment = Math.floor(entry.bytesTotal * (0.005 + Math.random() * 0.015));
        entry.bytesDone = Math.min(entry.bytesDone + increment, entry.bytesTotal);
        entry.updatedAt = Date.now();
        
        if (entry.bytesDone >= entry.bytesTotal) {
          entry.status = 'completed';
          console.log('dl_completed', { 
            id, 
            title: entry.title, 
            status: 'completed', 
            bytesDone: entry.bytesDone, 
            bytesTotal: entry.bytesTotal 
          });
        }
        
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      saveDownloads(downloads);
    }
  }, 300);
}

// Clean up interval on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  });
}