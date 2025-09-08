import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { getStorageItem } from "@/lib/prefs";

/**
 * Header pill shown until onboarding prefs exist.
 * Click dispatches a window event the page listens for.
 */
export function CompleteSetupPill() {
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
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
