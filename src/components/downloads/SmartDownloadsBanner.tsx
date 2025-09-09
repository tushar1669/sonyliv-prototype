import React, { useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import type { CatalogItem } from "@/lib/catalog";

interface SmartDownloadsBannerProps {
  open: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  suggestions: CatalogItem[];
}

export function SmartDownloadsBanner({ open, onAccept, onDismiss, suggestions }: SmartDownloadsBannerProps) {
  useEffect(() => {
    if (open) {
      console.log('sd_banner_shown', { 
        suggestionsCount: suggestions.length,
        suggestedIds: suggestions.map(s => s.id)
      });
    }
  }, [open, suggestions]);

  if (!open) return null;

  const handleAccept = () => {
    console.log('sd_accepted', { 
      suggestionsCount: suggestions.length,
      suggestedIds: suggestions.map(s => s.id)
    });
    onAccept();
  };

  const handleDismiss = () => {
    console.log('sd_dismissed');
    onDismiss();
  };

  return (
    <Alert className="mb-6 border-primary/50 bg-primary/10">
      <Download className="h-4 w-4 text-primary" />
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <AlertTitle className="text-primary">Save a few for offline?</AlertTitle>
          <AlertDescription className="text-primary/80">
            We'll download 3 Telugu picks automatically.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAccept}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            Download 3 picks
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-primary/60 hover:text-primary"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}