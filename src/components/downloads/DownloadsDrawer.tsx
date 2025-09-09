import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, Play, Pause, RotateCcw, Trash2, CheckCircle, Download } from "lucide-react";
import type { DownloadsMap } from "@/lib/downloads";

interface DownloadsDrawerProps {
  open: boolean;
  onClose: () => void;
  map: DownloadsMap;
  onAction: (id: string, action: 'pause' | 'resume' | 'cancel' | 'clearCompleted') => void;
}

export function DownloadsDrawer({ open, onClose, map, onAction }: DownloadsDrawerProps) {
  useEffect(() => {
    if (open) {
      console.log('dl_drawer_opened');
    }
  }, [open]);

  const downloads = Object.values(map);
  const inProgress = downloads.filter(d => ['queued', 'downloading', 'paused', 'failed'].includes(d.status));
  const completed = downloads.filter(d => d.status === 'completed');
  
  const handleAction = (id: string, action: 'pause' | 'resume' | 'cancel' | 'retry' | 'remove') => {
    const analyticsAction = action === 'retry' ? 'resume' : action === 'remove' ? 'cancel' : action;
    console.log(`dl_${analyticsAction}_clicked`, { id });
    
    const mappedAction = action === 'retry' ? 'resume' : action === 'remove' ? 'cancel' : action;
    onAction(id, mappedAction);
  };

  const handleClearCompleted = () => {
    console.log('dl_clear_completed_clicked');
    onAction('', 'clearCompleted');
  };

  const formatBytes = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'queued':
        return <Badge variant="secondary">Queued</Badge>;
      case 'downloading':
        return <Badge variant="default">Downloading</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return null;
    }
  };

  const getActionButtons = (download: any) => {
    switch (download.status) {
      case 'queued':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAction(download.id, 'resume')}>
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleAction(download.id, 'cancel')}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'downloading':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAction(download.id, 'pause')}>
              <Pause className="h-3 w-3 mr-1" />
              Pause
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleAction(download.id, 'cancel')}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'paused':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAction(download.id, 'resume')}>
              <Play className="h-3 w-3 mr-1" />
              Resume
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleAction(download.id, 'cancel')}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'failed':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAction(download.id, 'retry')}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleAction(download.id, 'remove')}>
              Remove
            </Button>
          </div>
        );
      case 'completed':
        return (
          <Button size="sm" variant="ghost" onClick={() => handleAction(download.id, 'remove')}>
            Remove
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="downloads-description">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Close downloads"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-xl font-semibold pr-10">
            Downloads
          </DialogTitle>
          <DialogDescription id="downloads-description" className="text-muted-foreground">
            Manage your downloaded content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* In Progress Downloads */}
          {inProgress.length > 0 && (
            <div>
              <h3 className="font-medium mb-4">In Progress</h3>
              <div className="space-y-3">
                {inProgress.map((download) => {
                  const progressPercent = download.bytesTotal > 0 
                    ? (download.bytesDone / download.bytesTotal) * 100 
                    : 0;
                    
                  return (
                    <div key={download.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{download.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(download.status)}
                            <span className="text-xs text-muted-foreground">
                              {formatBytes(download.bytesDone)} / {formatBytes(download.bytesTotal)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {getActionButtons(download)}
                        </div>
                      </div>
                      {download.status !== 'queued' && (
                        <Progress value={progressPercent} className="h-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Downloads */}
          {completed.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Completed</h3>
                <Button size="sm" variant="outline" onClick={handleClearCompleted}>
                  Clear All
                </Button>
              </div>
              <div className="space-y-3">
                {completed.map((download) => (
                  <div key={download.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <h4 className="font-medium text-sm">{download.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(download.bytesTotal)}
                          </p>
                        </div>
                      </div>
                      {getActionButtons(download)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {downloads.length === 0 && (
            <div className="text-center py-8">
              <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No Downloads</h3>
              <p className="text-sm text-muted-foreground">
                Downloaded content will appear here
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}