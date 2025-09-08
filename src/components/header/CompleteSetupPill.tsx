import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { getStorageItem } from "@/lib/prefs";

/**
 * Small header pill that opens the onboarding overlay.
 * It is visible only when yliv.pref is missing.
 * Clicking the pill dispatches a window event listened to by the page.
 */
export function CompleteSetupPill() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show pill only when onboarding pref is not set
    const hasPref = !!getStorageItem("yliv.pref");
    setVisible(!hasPref);

    // If some other flow saves prefs, hide the pill
    const onPrefsSaved = () => setVisible(false);
    window.addEventListener("yliv:prefsSaved", onPrefsSaved);
    return () => window.removeEventListener("yliv:prefsSaved", onPrefsSaved);
  }, []);

  if (!visible) return null;

  const openOverlay = () => {
    // Let the page (Index) handle opening the overlay
    window.dispatchEvent(new CustomEvent("yliv:openOverlay"));
  };

  return (
    <Button
      id="yliv-complete-setup-pill"
      variant="outline"
      size="sm"
      onClick={openOverlay}
      className="text-xs font-medium border-primary/50 text-primary hover:bg-primary/10"
      aria-label="Open onboarding setup"
    >
      <Settings className="h-3 w-3 mr-1" />
      Complete setup
    </Button>
  );
}
