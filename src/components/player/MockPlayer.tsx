import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, X, CheckCircle } from "lucide-react";
import { setProgress, markComplete, getProgress } from "@/lib/progress";
import type { CatalogItem } from "@/lib/catalog";

type MockPlayerProps = {
  open: boolean;
  onClose: () => void;
  item: CatalogItem | null;
};

// Generate mock duration based on item title (90-120s range)
function getMockDuration(title: string): number {
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 90 + (hash % 31); // 90-120 seconds
}

export function MockPlayer({ open, onClose, item }: MockPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize or resume from saved progress
  useEffect(() => {
    if (!item || !open) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    const mockDuration = getMockDuration(item.title);
    const savedProgress = getProgress(item.id);
    
    setDuration(mockDuration);
    setCurrentTime(savedProgress?.position || 0);
    setIsPlaying(true); // Auto-start when opened
  }, [item, open]);

  // Progress tracking timer
  useEffect(() => {
    if (isPlaying && item && currentTime < duration) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = Math.min(prev + 1, duration);
          
          // Save progress every second
          if (item) {
            setProgress(item.id, {
              position: newTime,
              duration,
              updatedAt: Date.now(),
              completed: false
            });
          }
          
          // Auto-complete when reaching end
          if (newTime >= duration && item) {
            handleMarkAsFinished();
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, item, duration, currentTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  const handleMarkAsFinished = () => {
    if (!item) return;
    
    markComplete(item.id, duration);
    console.log('content_finished', { id: item.id, title: item.title });
    
    // Dispatch completion event for deep dive
    window.dispatchEvent(new CustomEvent('yliv:content:finished', { detail: item }));
    
    setIsPlaying(false);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
        <div className="relative h-full flex flex-col bg-black">
          {/* Video Area */}
          <div className="relative flex-1 bg-gradient-to-br from-black via-black/90 to-black/80 flex items-center justify-center">
            <img 
              src={item.landscapeUrl || item.posterUrl} 
              alt={item.title}
              className="max-w-full max-h-full object-contain opacity-60"
            />
            
            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                className="h-20 w-20 rounded-full bg-black/50 hover:bg-black/70 text-white border-2 border-white/20"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              aria-label="Close player"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="p-6 bg-black/95 text-white">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-white text-xl">{item.title}</DialogTitle>
              <p className="text-white/70 text-sm">
                {item.language} • {item.category} • {item.genres.join(', ')}
              </p>
            </DialogHeader>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between text-sm text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={handlePlayPause}
                variant="default"
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleMarkAsFinished}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Finished
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}