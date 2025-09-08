import React, { useState, useEffect } from "react";
import { Search, Settings, User, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompleteSetupPill } from "@/components/header/CompleteSetupPill";
import { getWatchlist } from "@/lib/watchlist";

export function Header() {
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    setWatchlistCount(getWatchlist().length);
    
    const handleWatchlistChange = (event: CustomEvent) => {
      setWatchlistCount(event.detail.length);
    };
    
    window.addEventListener('yliv:watchlist:changed', handleWatchlistChange as EventListener);
    return () => window.removeEventListener('yliv:watchlist:changed', handleWatchlistChange as EventListener);
  }, []);

  const handleWatchlistClick = () => {
    const watchlistSection = document.getElementById('yliv-watchlist');
    if (watchlistSection) {
      watchlistSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-foreground">sony</span>
              <span className="text-primary">liv</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
            Home
          </a>
          <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
            Movies
          </a>
          <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
            TV Shows
          </a>
          <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
            Originals
          </a>
          <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
            Sports
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <CompleteSetupPill />
          
          <Button variant="ghost" size="icon" onClick={handleWatchlistClick} className="relative">
            <Bookmark className="h-4 w-4" />
            {watchlistCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {watchlistCount}
              </Badge>
            )}
            <span className="sr-only">Watchlist ({watchlistCount} items)</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Preferences</span>
          </Button>

          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}