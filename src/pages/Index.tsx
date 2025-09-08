import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { OnboardingOverlay } from "@/components/onboarding/Overlay";
import { useIsDesktop } from "@/lib/viewport";
import { getStorageItem } from "@/lib/prefs";
import { ContentRail } from "@/components/content/ContentRail";
import type { ContentItem } from "@/components/content/ContentCard";
import {
  loadCatalog,
  filterByLanguage,
  trending,
  getExpiringSoon,
} from "@/lib/catalog";

declare global {
  interface WindowEventMap {
    "yliv:openOverlay": CustomEvent<void>;
  }
}

const Index: React.FC = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const [teluguTrending, setTeluguTrending] = useState<ContentItem[]>([]);
  const [teluguNew, setTeluguNew] = useState<ContentItem[]>([]);

  // Open overlay when the header pill dispatches the event
  useEffect(() => {
    const onOpen = () => setOverlayOpen(true);
    window.addEventListener("yliv:openOverlay", onOpen);
    return () => window.removeEventListener("yliv:openOverlay", onOpen);
  }, []);

  // Auto-open overlay on first desktop visit if preferences are missing
  useEffect(() => {
    if (!isDesktop) return;
    const prefs = getStorageItem("yliv.pref");
    if (!prefs) {
      console.log("onboarding_overlay_opened (auto)");
      setOverlayOpen(true);
    }
  }, [isDesktop]);

  // Load catalog and compute Telugu-first rails
  useEffect(() => {
    (async () => {
      const all = (await loadCatalog()) as any as ContentItem[];
      const telugu = filterByLanguage(all, "Telugu") as any as ContentItem[];
      setTeluguTrending(trending(telugu, "Telugu", 12) as any);
      // Proxy for “recent”: sort by expiresAt ascending for mock data
      setTeluguNew(getExpiringSoon(telugu, 365).slice(0, 12) as any);
    })();
  }, []);

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    console.log("onboarding_overlay_closed");
    const trigger = document.getElementById(
      "yliv-complete-setup-pill"
    ) as HTMLButtonElement | null;
    trigger?.focus();
  };

  // bg-transparent: allow global site background to be visible
  return (
    <div className="relative min-h-screen bg-transparent">
      <Header />
      <OnboardingOverlay open={overlayOpen} onClose={handleCloseOverlay} />

      <main className="container mx-auto px-4 py-8 space-y-10">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to <span className="text-primary">SonyLIV</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stream your favorite Telugu movies, shows, and originals. Discover
            trending content and enjoy premium entertainment.
          </p>

        {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto">
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

        {/* Above-the-fold rails */}
        <ContentRail title="Trending in Telugu" items={teluguTrending} />
        <ContentRail title="New & Noteworthy (Telugu)" items={teluguNew} />
      </main>
    </div>
  );
};

export default Index;
