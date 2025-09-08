import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface OnboardingOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Desktop onboarding overlay (shell).
 * Radix handles focus-trap/ESC; we also lock body scroll while open.
 */
export function OnboardingOverlay({ open, onClose }: OnboardingOverlayProps) {
  useEffect(() => {
    if (open) {
      console.log("onboarding_overlay_opened");
      document.body.style.overflow = "hidden";
    } else {
      console.log("onboarding_overlay_closed");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className="max-w-2xl w-full mx-4"
        aria-describedby="onboarding-description"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle id="onboarding-title">Complete your setup</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close setup dialog"
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div id="onboarding-description" className="space-y-6 py-4">
          <div className="text-center space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span>Choose Language (default Telugu)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span>Pick Genres</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span>Review & Confirm</span>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleClose} className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
