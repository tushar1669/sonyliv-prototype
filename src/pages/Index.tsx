import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { OnboardingOverlay } from "@/components/onboarding/Overlay";
import { ContentRail } from "@/components/content/ContentRail";
import { DetailsModal } from "@/components/content/DetailsModal";
import { MockPlayer } from "@/components/player/MockPlayer";
import { DeepDiveSheet } from "@/components/content/DeepDiveSheet";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Trophy } from "lucide-react";
import { loadCatalog, getLatestByLanguage, getTrendingByLanguage, getExpiringSoonByLanguage, byGenreAndLanguage, daysUntilExpiry } from "@/lib/catalog";
import type { CatalogItem } from "@/lib/catalog";
import { useIsDesktop } from "@/lib/viewport";
import { readYPref, type YPref } from "@/lib/prefs";
import { getWatchlist } from "@/lib/watchlist";
import { getContinueWatchingIds } from "@/lib/progress";
import { ensureChallengeStarted, onContentFinished, onWatchlistChanged, type ChallengeState } from "@/lib/challenge";
import { loadDownloads, attachTicker, queueDownload, startDownload, pauseDownload, resumeDownload, cancelDownload, clearCompleted, type DownloadsMap } from "@/lib/downloads";
import { ChallengeBadge } from "@/components/challenge/ChallengeBadge";
import { ChallengeDrawer } from "@/components/challenge/ChallengeDrawer";
import { DownloadsBadge } from "@/components/downloads/DownloadsBadge";
import { DownloadsDrawer } from "@/components/downloads/DownloadsDrawer";
import { SmartDownloadsBanner } from "@/components/downloads/SmartDownloadsBanner";

declare global {
  interface WindowEventMap {
    "yliv:openOverlay": CustomEvent<void>;
    "yliv:content:finished": CustomEvent<CatalogItem>;
    "yliv:deep-dive:play": CustomEvent<{ item: CatalogItem; source: string }>;
    "yliv:continue:resume": CustomEvent<{ id: string }>;
  }
}

export default function Index() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<YPref | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState<CatalogItem[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerItem, setPlayerItem] = useState<CatalogItem | null>(null);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [deepDiveItem, setDeepDiveItem] = useState<CatalogItem | null>(null);
  const [continueItems, setContinueItems] = useState<CatalogItem[]>([]);
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeBannerDismissed, setChallengeBannerDismissed] = useState(false);
  const [downloads, setDownloads] = useState<DownloadsMap>({});
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<CatalogItem[]>([]);
  const isDesktop = useIsDesktop();
  
  // Load catalog data and user preferences
  useEffect(() => {
    loadCatalog().then((data) => {
      setCatalog(data);
      setCatalogLoading(false);
    });
    setUserPrefs(readYPref());
    setChallenge(ensureChallengeStarted());
    setDownloads(loadDownloads());
    attachTicker(); // Start progress ticker once
  }, []);

  // Event listeners for overlay, preference updates, and watchlist changes
  useEffect(() => {
    const handleOpenOverlay = () => setOverlayOpen(true);
    const handlePrefsUpdated = (event: CustomEvent<YPref>) => {
      console.log('yliv_pref_changed', event.detail);
      setUserPrefs(event.detail);
    };
    const handleWatchlistChanged = (event: CustomEvent) => {
      updateWatchlistItems();
      if (challenge) {
        const newChallenge = onWatchlistChanged(challenge, event.detail);
        setChallenge(newChallenge);
        if (newChallenge.completedAt && !challenge.completedAt) {
          console.log('challenge_completed');
          alert('Congratulations! You completed the Telugu Tour! Bonus week unlocked!');
        }
      }
    };
    const handleProgressChanged = () => {
      updateContinueItems();
    };
    const handleContentFinished = (event: CustomEvent<CatalogItem>) => {
      setDeepDiveItem(event.detail);
      setDeepDiveOpen(true);
      updateContinueItems(); // Remove completed item from continue watching
      
      if (challenge) {
        const newChallenge = onContentFinished(challenge, event.detail, userPrefs);
        setChallenge(newChallenge);
        if (newChallenge.completedAt && !challenge.completedAt) {
          console.log('challenge_completed');
          alert('Congratulations! You completed the Telugu Tour! Bonus week unlocked!');
        }
      }
    };
    const handleDeepDivePlay = (event: CustomEvent<{ item: CatalogItem; source: string }>) => {
      setPlayerItem(event.detail.item);
      setPlayerOpen(true);
    };

    const handleDownloadsChange = (event: CustomEvent<{ map: DownloadsMap }>) => {
      setDownloads(event.detail.map);
    };
    
    const updateWatchlistItems = () => {
      if (catalog.length > 0) {
        const watchlistIds = getWatchlist();
        const items = catalog.filter(item => watchlistIds.includes(item.id));
        setWatchlistItems(items);
      }
    };

    const updateContinueItems = () => {
      if (catalog.length > 0) {
        const continueIds = getContinueWatchingIds(12);
        const items = catalog.filter(item => continueIds.includes(item.id));
        setContinueItems(items);
        
        if (items.length > 0) {
          console.log('continue_rail_rendered', { itemIds: items.map(i => i.id) });
        }
      }
    };
    
    // Initial updates
    updateWatchlistItems();
    updateContinueItems();
    
    window.addEventListener('yliv:openOverlay', handleOpenOverlay);
    window.addEventListener('yliv:preferences:updated', handlePrefsUpdated as EventListener);
    window.addEventListener('yliv:watchlist:changed', handleWatchlistChanged);
    window.addEventListener('yliv:progress:changed', handleProgressChanged);
    window.addEventListener('yliv:content:finished', handleContentFinished as EventListener);
    window.addEventListener('yliv:deep-dive:play', handleDeepDivePlay as EventListener);
    window.addEventListener('yliv:downloads:changed', handleDownloadsChange as EventListener);
    
    return () => {
      window.removeEventListener('yliv:openOverlay', handleOpenOverlay);
      window.removeEventListener('yliv:preferences:updated', handlePrefsUpdated as EventListener);
      window.removeEventListener('yliv:watchlist:changed', handleWatchlistChanged);
      window.removeEventListener('yliv:progress:changed', handleProgressChanged);
      window.removeEventListener('yliv:content:finished', handleContentFinished as EventListener);
      window.removeEventListener('yliv:deep-dive:play', handleDeepDivePlay as EventListener);
      window.removeEventListener('yliv:downloads:changed', handleDownloadsChange as EventListener);
    };
  }, [catalog]);

  // Compute smart download suggestions and show banner when eligible
  useEffect(() => {
    if (catalog.length > 0 && userPrefs && isDesktop) {
      const activeDownloads = Object.values(downloads).filter(d => d.status !== 'completed').length;
      const completedDownloads = Object.values(downloads).filter(d => d.status === 'completed').length;
      
      // Show banner if: desktop, 0 completed downloads, <2 active downloads
      if (completedDownloads === 0 && activeDownloads < 2) {
        const language = userPrefs.language || 'Telugu';
        let suggestions = getTrendingByLanguage(catalog, language, 12);
        
        // Prefer items matching user's genres if available
        if (userPrefs.genres && userPrefs.genres.length > 0) {
          const genreItems = catalog.filter(item => 
            item.language === language &&
            item.genres.some(g => userPrefs.genres!.map(ug => ug.toLowerCase()).includes(g.toLowerCase())) &&
            !downloads[item.id] // Not already downloading/completed
          );
          if (genreItems.length > 0) {
            suggestions = [...genreItems.slice(0, 6), ...suggestions.slice(0, 6)];
          }
        }
        
        // Filter out already downloading/completed items
        suggestions = suggestions.filter(item => !downloads[item.id]).slice(0, 3);
        
        setSmartSuggestions(suggestions);
        setSmartOpen(suggestions.length > 0);
      } else {
        setSmartOpen(false);
      }
    }
  }, [catalog, userPrefs, downloads, isDesktop]);

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

  const handleContinueItemClick = (item: CatalogItem) => {
    console.log('continue_resume_clicked', { id: item.id, title: item.title });
    window.dispatchEvent(new CustomEvent('yliv:continue:resume', { detail: { id: item.id } }));
    setPlayerItem(item);
    setPlayerOpen(true);
  };

  const handlePlayFromDetails = (item: CatalogItem) => {
    setDetailsModalOpen(false);
    setPlayerItem(item);
    setPlayerOpen(true);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedItem(null);
  };

  // Get content for rails based on user language preference
  const language = userPrefs?.language || 'Telugu';
  const latestContent = getLatestByLanguage(catalog, language, 10);
  const trendingContent = getTrendingByLanguage(catalog, language, 10);
  const leavingSoonContent = getExpiringSoonByLanguage(catalog, language, 7, 12);
  
  // Genre-based recommendations from user preferences
  const firstTwoGenres = userPrefs?.genres?.slice(0, 2) || [];
  const genreRails = firstTwoGenres.map(genre => ({
    genre,
    title: `Because you like ${genre.charAt(0).toUpperCase() + genre.slice(1)}`,
    items: byGenreAndLanguage(catalog, genre, language, 12)
  }));

  // Challenge picks rail - help complete remaining tasks
  const challengePicks = React.useMemo(() => {
    if (!challenge || challenge.completedAt) return [];
    
    let picks = getTrendingByLanguage(catalog, language, 12);
    
    // Prefer items that match user's preferred genres if pref_genre_1 task not done
    const prefGenreTask = challenge.tasks.find(t => t.id === 'pref_genre_1');
    if (prefGenreTask && !prefGenreTask.done && userPrefs?.genres) {
      const genreItems = catalog.filter(item => 
        item.language === language &&
        item.genres.some(g => userPrefs.genres.map(ug => ug.toLowerCase()).includes(g.toLowerCase()))
      );
      if (genreItems.length > 0) {
        picks = [...genreItems.slice(0, 6), ...picks.slice(0, 6)];
      }
    }
    
    return picks.slice(0, 12);
  }, [catalog, challenge, language, userPrefs]);
  
  // Check for expiring watchlist items (≤3 days)
  const expiringWatchlistItems = watchlistItems.filter(item => {
    const days = daysUntilExpiry(item);
    return days <= 3 && days > 0;
  });
  
  const shouldShowBanner = !bannerDismissed && expiringWatchlistItems.length > 0;
  const shouldShowChallengeBanner = challenge && !challengeBannerDismissed && 
    challenge.completedAt === null && challenge.tasks.some(t => t.progress < t.target);

  const handleBannerDismiss = () => {
    setBannerDismissed(true);
  };

  const handleViewLeavingSoon = () => {
    const leavingSoonSection = document.getElementById('yliv-leaving-soon');
    if (leavingSoonSection) {
      leavingSoonSection.scrollIntoView({ behavior: 'smooth' });
    }
    setBannerDismissed(true);
  };

  const handleChallengeBannerDismiss = () => {
    setChallengeBannerDismissed(true);
  };

  const handleViewChallengeTasks = () => {
    setChallengeOpen(true);
    setChallengeBannerDismissed(true);
  };

  const handleDownloadAction = (id: string, action: 'pause' | 'resume' | 'cancel' | 'clearCompleted') => {
    if (action === 'clearCompleted') {
      clearCompleted();
    } else if (action === 'pause') {
      pauseDownload(id);
    } else if (action === 'resume') {
      resumeDownload(id);
    } else if (action === 'cancel') {
      cancelDownload(id);
    }
  };

  const handleSmartDownloadsAccept = () => {
    smartSuggestions.forEach(item => {
      queueDownload(item);
      startDownload(item.id);
    });
    console.log('sd_auto_queued', { 
      count: smartSuggestions.length,
      itemIds: smartSuggestions.map(s => s.id)
    });
    setSmartOpen(false);
    setDownloadsOpen(true); // Open downloads drawer to show progress
  };

  const handleSmartDownloadsDismiss = () => {
    setSmartOpen(false);
  };

  // Calculate active download count for badge
  const activeDownloadCount = Object.values(downloads).filter(d => d.status !== 'completed').length;

  // IMPORTANT: bg-transparent so the global body background shows through
  return (
    <div className="relative min-h-screen bg-transparent">
      <Header>
        <DownloadsBadge 
          count={activeDownloadCount} 
          onClick={() => setDownloadsOpen(true)} 
        />
        <ChallengeBadge 
          state={challenge} 
          onClick={() => setChallengeOpen(true)} 
        />
      </Header>

      {/* Onboarding Overlay (page-owned) */}
      <OnboardingOverlay open={overlayOpen} onClose={handleOverlayClose} />

      {/* Details Modal */}
      <DetailsModal 
        open={detailsModalOpen} 
        onClose={handleDetailsModalClose} 
        item={selectedItem}
        onPlay={handlePlayFromDetails}
      />

      {/* Mock Player */}
      <MockPlayer 
        open={playerOpen} 
        onClose={() => setPlayerOpen(false)} 
        item={playerItem} 
      />

      {/* Deep Dive Sheet */}
      <DeepDiveSheet 
        open={deepDiveOpen} 
        onClose={() => setDeepDiveOpen(false)} 
        item={deepDiveItem} 
        catalog={catalog} 
      />

      {/* Challenge Drawer */}
      <ChallengeDrawer 
        open={challengeOpen} 
        onClose={() => setChallengeOpen(false)} 
        state={challenge}
        onStateChange={setChallenge}
      />

      {/* Downloads Drawer */}
      <DownloadsDrawer 
        open={downloadsOpen} 
        onClose={() => setDownloadsOpen(false)} 
        map={downloads} 
        onAction={handleDownloadAction}
      />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Smart Downloads Banner */}
        <SmartDownloadsBanner 
          open={smartOpen} 
          onAccept={handleSmartDownloadsAccept}
          onDismiss={handleSmartDownloadsDismiss}
          suggestions={smartSuggestions}
        />
        {/* Challenge Banner */}
        {shouldShowChallengeBanner && (
          <Alert className="mb-6 border-primary/50 bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
            <div className="flex items-center justify-between w-full">
              <div className="flex-1">
                <AlertTitle className="text-primary">Welcome!</AlertTitle>
                <AlertDescription className="text-primary/80">
                  Join the <strong>7-Day Telugu Tour</strong> and unlock a bonus week.
                </AlertDescription>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewChallengeTasks}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  View Tasks
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleChallengeBannerDismiss}
                  className="h-8 w-8 text-primary/60 hover:text-primary"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Expiring Watchlist Banner */}
        {shouldShowBanner && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div className="flex items-center justify-between w-full">
              <div className="flex-1">
                <AlertTitle className="text-destructive">Items Leaving Soon</AlertTitle>
                <AlertDescription className="text-destructive/80">
                  Some items in your Watchlist are leaving soon.
                </AlertDescription>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewLeavingSoon}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  View
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleBannerDismiss}
                  className="h-8 w-8 text-destructive/60 hover:text-destructive"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
        )}
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
          {/* Continue Watching Rail */}
          {continueItems.length > 0 && (
            <ContentRail
              title="Continue Watching"
              items={continueItems}
              variant="poster"
              loading={false}
              onItemClick={handleContinueItemClick}
            />
          )}
          
          {/* Watchlist Rail */}
          {watchlistItems.length > 0 && (
            <div id="yliv-watchlist">
              <ContentRail
                title="Your Watchlist"
                items={watchlistItems}
                variant="poster"
                loading={false}
                onItemClick={handleItemClick}
              />
            </div>
          )}
          
          {/* Leaving Soon Rail */}
          {leavingSoonContent.length > 0 && (
            <div id="yliv-leaving-soon">
              <ContentRail
                title="Leaving Soon"
                items={leavingSoonContent}
                variant="poster"
                loading={catalogLoading}
                onItemClick={handleItemClick}
              />
            </div>
          )}
          
          {/* Challenge Picks Rail */}
          {challengePicks.length > 0 && challenge && !challenge.completedAt && (
            <div id="yliv-challenge-picks">
              <ContentRail
                title="Telugu Tour Picks"
                items={challengePicks}
                variant="poster"
                loading={catalogLoading}
                onItemClick={handleItemClick}
              />
            </div>
          )}
          
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
          
          {/* Genre-based Rails */}
          {genreRails.map(rail => (
            rail.items.length > 0 && (
              <ContentRail
                key={rail.genre}
                title={rail.title}
                items={rail.items}
                variant="poster"
                loading={catalogLoading}
                onItemClick={handleItemClick}
              />
            )
          ))}
        </div>
      </main>
    </div>
  );
}
