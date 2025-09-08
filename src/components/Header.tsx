// src/components/header/CompleteSetupPill.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { getStorageItem } from "@/lib/prefs";

/**
 * Small pill shown in the header until onboarding is completed.
 * Clicking it dispatches a window event that the page listens to
 * to open the onboarding overlay.
 */
export function CompleteSetupPill() {
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
    // Show only when onboarding prefs are missing
    const prefs = getStorageItem("yliv.pref");
    setShowPill(!prefs);
  }, []);

  if (!showPill) return null;

  const openOverlay = () => {
    window.dispatchEvent(new CustomEvent("yliv:openOverlay"));
  };

  return (
    <Button
      id="yliv-complete-setup-pill"
      variant="outline"
      size="sm"
      onClick={openOverlay}
      className="text-xs font-medium border-primary/50 text-primary hover:bg-primary/10"
    >
      <Settings className="h-3 w-3 mr-1" />
      Complete setup
    </Button>
  );
}
