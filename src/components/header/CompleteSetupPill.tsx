import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { getStorageItem } from "@/lib/prefs";
import { OnboardingOverlay } from "@/components/onboarding/Overlay";

export function CompleteSetupPill() {
  const [showPill, setShowPill] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    // Check if yliv.pref exists
    const prefs = getStorageItem('yliv.pref');
    setShowPill(!prefs);
  }, []);

  const handleOpenOverlay = () => {
    setOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
  };

  if (!showPill) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenOverlay}
        className="text-xs font-medium border-primary/50 text-primary hover:bg-primary/10"
      >
        <Settings className="h-3 w-3 mr-1" />
        Complete setup
      </Button>

      <OnboardingOverlay 
        open={overlayOpen}
        onClose={handleCloseOverlay}
      />
    </>
  );
}