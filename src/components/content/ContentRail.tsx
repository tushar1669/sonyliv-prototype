import * as React from "react";
import type { CatalogItem } from "@/lib/catalog";
import { ContentCard } from "./ContentCard";

type CardVariant = "poster" | "landscape";

interface ContentRailProps {
  title: string;
  items: CatalogItem[];
  variant?: CardVariant;
  loading?: boolean;
  onItemClick?: (item: CatalogItem) => void;
}

// Skeleton Card Component
const SkeletonCard: React.FC<{ variant: CardVariant }> = ({ variant }) => (
  <div className="shrink-0 w-40 md:w-44">
    <div
      className={
        variant === "poster"
          ? "aspect-[2/3] bg-muted rounded-md animate-pulse"
          : "aspect-video bg-muted rounded-md animate-pulse"
      }
    />
    <div className="mt-2 space-y-2">
      <div className="h-4 bg-muted rounded animate-pulse" />
      <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
    </div>
  </div>
);

export const ContentRail: React.FC<ContentRailProps> = ({
  title,
  items,
  variant = "poster",
  loading = false,
  onItemClick,
}) => {
  // Analytics when rail renders with content
  React.useEffect(() => {
    if (!loading && items.length > 0) {
      console.log('rail_rendered', { 
        railName: title, 
        itemIds: items.map(item => item.id) 
      });
      
      // Special analytics for specific rails
      if (title === "Your Watchlist") {
        console.log('watchlist_rail_rendered', { 
          itemCount: items.length,
          itemIds: items.map(item => item.id) 
        });
      } else if (title === "Leaving Soon") {
        console.log('leaving_soon_rail_rendered', { 
          itemCount: items.length,
          itemIds: items.map(item => item.id) 
        });
      }
    }
  }, [loading, items, title]);

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      {/* horizontal scroller */}
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        role="list"
        aria-label={title}
      >
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} variant={variant} />
          ))
        ) : (
          // Show actual content
          items.map((item) => (
            <div key={item.id} role="listitem" className="shrink-0 w-40 md:w-44">
              <ContentCard 
                item={item} 
                variant={variant} 
                onClick={() => {
                  console.log('card_clicked', { id: item.id, title: item.title });
                  onItemClick?.(item);
                }}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
};

