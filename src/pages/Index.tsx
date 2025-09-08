import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { OnboardingOverlay } from "@/components/onboarding/Overlay";
import { ContentRail } from "@/components/content/ContentRail";
import { DetailsModal } from "@/components/content/DetailsModal";
import { loadCatalog, getLatestByLanguage, getTrendingByLanguage } from "@/lib/catalog";
import type { CatalogItem } from "@/lib/catalog";
import { useIsDesktop } from "@/lib/viewport";
import { readYPref, type YPref } from "@/lib/prefs";

declare global {
  interface WindowEventMap {
    "yliv:openOverlay": CustomEvent<void>;
  }
}

export default function Index() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<YPref | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const isDesktop = useIsDesktop();
  
  // Load catalog data and user preferences
  useEffect(() => {
    loadCatalog().then((data) => {
      setCatalog(data);
      setCatalogLoading(false);
    });
    setUserPrefs(readYPref());
  }, []);

  // Event listeners for overlay and preference updates
  useEffect(() => {
    const handleOpenOverlay = () => setOverlayOpen(true);
    const handlePrefsUpdated = (event: CustomEvent<YPref>) => {
      setUserPrefs(event.detail);
    };
    
    window.addEventListener('yliv:openOverlay', handleOpenOverlay);
    window.addEventListener('yliv:preferences:updated', handlePrefsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('yliv:openOverlay', handleOpenOverlay);
      window.removeEventListener('yliv:preferences:updated', handlePrefsUpdated as EventListener);
    };
  }, []);

  // Auto-open overlay on first desktop visit
  useEffect(() => {
    if (isDesktop && catalog.length > 0 && !userPrefs) {
      setOverlayOpen(true);
    }
  }, [isDesktop, catalog, userPrefs]);

  const handleOverlayClose = () => {
    setOverlayOpen(false);
  };

  const handleItemClick = (item: CatalogItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedItem(null);
  };

  // Get content for rails based on user language preference
  const language = userPrefs?.language || 'Telugu';
  const latestContent = getLatestByLanguage(catalog, language, 10);
  const trendingContent = getTrendingByLanguage(catalog, language, 10);

  // IMPORTANT: bg-transparent so the global body background shows through
  return (
    <div className="relative min-h-screen bg-transparent">
      <Header />

      {/* Onboarding Overlay (page-owned) */}
      <OnboardingOverlay open={overlayOpen} onClose={handleOverlayClose} />

      {/* Details Modal */}
      <DetailsModal 
        open={detailsModalOpen} 
        onClose={handleDetailsModalClose} 
        item={selectedItem} 
      />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to <span className="text-primary">SonyLIV</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stream your favorite Telugu movies, shows, and originals. Discover
            trending content and enjoy premium entertainment.
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

        {/* Content Rails */}
        <div className="mt-12 space-y-8">
          <ContentRail
            title={`New in ${language}`}
            items={latestContent}
            variant="poster"
            loading={catalogLoading}
            onItemClick={handleItemClick}
          />
          <ContentRail
            title={`Trending in ${language}`}  
            items={trendingContent}
            variant="poster"
            loading={catalogLoading}
            onItemClick={handleItemClick}
          />
        </div>
      </main>
    </div>
  );
}
