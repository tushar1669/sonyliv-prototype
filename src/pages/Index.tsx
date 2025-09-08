import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { OnboardingOverlay } from "@/components/onboarding/Overlay";
import { useIsDesktop } from "@/lib/viewport";
import { getStorageItem } from "@/lib/prefs";

const Index = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const isDesktop = useIsDesktop();

  // Open overlay when the header pill dispatches the event
  useEffect(() => {
    const openFromPill = () => setOverlayOpen(true);
    window.addEventListener("yliv:openOverlay", openFromPill);
    return () => window.removeEventListener("yliv:openOverlay", openFromPill);
  }, []);

  // Auto-open overlay on first desktop visit if preferences are missing
  useEffect(() => {
    if (isDesktop) {
      const prefs = getStorageItem("yliv.pref");
      if (!prefs) {
        console.log("onboarding_overlay_opened (auto)");
        setOverlayOpen(true);
      }
    }
  }, [isDesktop]);

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    console.log("onboarding_overlay_closed");

    // Return focus to the pill if present (important for keyboard users)
    if (typeof document !== "undefined") {
      const trigger = document.getElementById("yliv-complete-setup-pill") as
        | HTMLButtonElement
        | null;
      trigger?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Onboarding Overlay (page-owned) */}
      <OnboardingOverlay open={overlayOpen} onClose={handleCloseOverlay} />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to <span className="text-primary">SonyLIV</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stream your favorite Telugu movies, shows, and originals.
            Discover trending content and enjoy premium entertainment.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-2xl font-bold text-primary">24+</h3>
              <p className="text-muted-foreground">Content Items</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-2xl font-bold text-primary">Telugu</h3>
              <p className="text-muted-foreground">Primary Focus</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-2xl font-bold text-primary">Dark</h3>
              <p className="text-muted-foreground">Theme Ready</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
