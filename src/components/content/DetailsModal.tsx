import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Play, Plus, Download, Calendar, Check, Pause } from "lucide-react";
import type { CatalogItem } from "@/lib/catalog";
import { daysUntilExpiry } from "@/lib/catalog";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { getEntry, queueDownload, startDownload, pauseDownload, resumeDownload } from "@/lib/downloads";

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onPlay?: (item: CatalogItem) => void;
}

export function DetailsModal({ open, onClose, item, onPlay }: DetailsModalProps) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [downloadEntry, setDownloadEntry] = useState<any>(null);

  useEffect(() => {
    if (item) {
      setInWatchlist(isInWatchlist(item.id));
      setDownloadEntry(getEntry(item.id));
    }
  }, [item]);

  // Listen for watchlist and download changes to update button states
  useEffect(() => {
    const handleWatchlistChange = () => {
      if (item) {
        setInWatchlist(isInWatchlist(item.id));
      }
    };

    const handleDownloadsChange = () => {
      if (item) {
        setDownloadEntry(getEntry(item.id));
      }
    };
    
    window.addEventListener('yliv:watchlist:changed', handleWatchlistChange);
    window.addEventListener('yliv:downloads:changed', handleDownloadsChange);
    return () => {
      window.removeEventListener('yliv:watchlist:changed', handleWatchlistChange);
      window.removeEventListener('yliv:downloads:changed', handleDownloadsChange);
    };
  }, [item]);

  if (!item) return null;

  const handlePlayClick = () => {
    console.log('detail_play_clicked', { itemId: item.id, title: item.title });
    if (onPlay) {
      onPlay(item);
    }
  };

  const handleWatchlistClick = () => {
    if (inWatchlist) {
      removeFromWatchlist(item.id);
      console.log('watchlist_removed', { itemId: item.id, title: item.title });
    } else {
      addToWatchlist(item.id);
      console.log('watchlist_added', { itemId: item.id, title: item.title });
    }
  };

  const handleDownloadClick = () => {
    if (!item) return;
    
    if (!downloadEntry) {
      // Queue and start download
      queueDownload(item);
      startDownload(item.id);
      console.log('dl_from_details_clicked', { id: item.id, action: 'download' });
    } else if (downloadEntry.status === 'downloading' || downloadEntry.status === 'queued') {
      // Pause download
      pauseDownload(item.id);
      console.log('dl_from_details_clicked', { id: item.id, action: 'pause' });
    } else if (downloadEntry.status === 'paused') {
      // Resume download
      resumeDownload(item.id);
      console.log('dl_from_details_clicked', { id: item.id, action: 'resume' });
    }
  };

  const expiryDays = daysUntilExpiry(item);
  const isExpiringSoon = expiryDays <= 7 && expiryDays > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl" aria-describedby="details-description">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Close content details dialog"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-xl font-semibold pr-10">
            {item.title}
          </DialogTitle>
          <DialogDescription id="details-description" className="text-muted-foreground">
            {item.category} • {item.language}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Image */}
          {item.landscapeUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={item.landscapeUrl} 
                alt={`${item.title} backdrop`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Info */}
          <div className="space-y-4">
            {/* Genres */}
            {item.genres.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {item.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Cast & Crew */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.director && (
                <div>
                  <h4 className="font-medium mb-1">Director</h4>
                  <p className="text-muted-foreground">{item.director}</p>
                </div>
              )}
              {item.actors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Cast</h4>
                  <p className="text-muted-foreground">{item.actors.slice(0, 3).join(', ')}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expiry Warning */}
            {isExpiringSoon && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Calendar className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Leaving in {expiryDays} day{expiryDays !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={handlePlayClick} className="flex items-center gap-2" aria-label={`Play ${item.title}`}>
              <Play className="h-4 w-4" />
              Play
            </Button>
            <Button 
              variant={inWatchlist ? "default" : "outline"}
              onClick={handleWatchlistClick}
              className="flex items-center gap-2"
              aria-label={inWatchlist ? `Remove ${item.title} from watchlist` : `Add ${item.title} to watchlist`}
            >
              {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDownloadClick}
              className="flex items-center gap-2"
              aria-label={
                !downloadEntry 
                  ? `Download ${item.title}` 
                  : downloadEntry.status === 'completed' 
                  ? `${item.title} downloaded` 
                  : downloadEntry.status === 'downloading' || downloadEntry.status === 'queued'
                  ? `Pause download of ${item.title}`
                  : `Resume download of ${item.title}`
              }
              disabled={downloadEntry?.status === 'completed'}
            >
              {!downloadEntry ? (
                <>
                  <Download className="h-4 w-4" />
                  Download
                </>
              ) : downloadEntry.status === 'completed' ? (
                <>
                  <Check className="h-4 w-4" />
                  Downloaded
                </>
              ) : downloadEntry.status === 'downloading' || downloadEntry.status === 'queued' ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}