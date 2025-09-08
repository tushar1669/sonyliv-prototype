import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { OnboardingOverlay } from "@/components/onboarding/Overlay";
import { useIsDesktop } from "@/lib/viewport";
import { getStorageItem } from "@/lib/prefs";

declare global {
  interface WindowEventMap {
    "yliv:openOverlay": CustomEvent<void>;
  }
}

const Index: React.FC = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const isDesktop = useIsDesktop();

  // Listen for header pill event
  useEffect(() => {
    const onOpen = () => setOverlayOpen(true);
    window.addEventListener("yliv:openOverlay", onOpen);
    return () => window.removeEventListener("yliv:openOverlay", onOpen);
  }, []);

  // Auto-open on first desktop visit when prefs missing
  useEffect(() => {
    if (!isDesktop) return;
    const prefs = getStorageItem("yliv.pref");
    if (!prefs) {
      console.log("onboarding_overlay_opened (auto)");
      setOverlayOpen(true);
    }
  }, [isDesktop]);

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    console.log("onboarding_overlay_closed");
    const trigger = document.getElementById(
      "yliv-complete-setup-pill"
    ) as HTMLButtonElement | null;
    trigger?.focus();
  };

  return (
    /* Keep transparent so the body background image is visible */
    <div className="relative min-h-screen bg-transparent">
      <Header />

      <OnboardingOverlay open={overlayOpen} onClose={handleCloseOverlay} />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to <span className="text-primary">SonyLIV</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stream your favorite Telugu movies, shows, and originals. Discover
            trending content and enjoy premium entertainment.
          </p>

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
