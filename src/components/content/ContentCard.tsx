import * as React from "react";
import type { CatalogItem } from "@/lib/catalog";
import { daysUntilExpiry } from "@/lib/catalog";

type CardVariant = "poster" | "landscape";

interface ContentCardProps {
  item: CatalogItem;
  variant?: CardVariant;
  showMeta?: boolean;
  badge?: "leavingSoon" | "new" | null;
  onClick?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  variant = "poster",
  showMeta = true,
  badge = null,
  onClick,
}) => {
  const expiryDays = daysUntilExpiry(item);
  const isExpiringSoon = expiryDays <= 7 && expiryDays > 0;
  
  const imageUrl = variant === "poster" ? item.posterUrl : item.landscapeUrl;

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div 
      className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md" 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${item.title} in ${item.language}`}
    >
      <div className="relative">
        <div
          className={
            variant === "poster"
              ? "aspect-[2/3] bg-muted rounded-md overflow-hidden"
              : "aspect-video bg-muted rounded-md overflow-hidden"
          }
        >
          <img
            src={imageUrl}
            alt={`${item.title} ${variant}`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Leaving Soon Ribbon */}
        {isExpiringSoon && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md shadow-md">
            Leaving in {expiryDays}d
          </div>
        )}
      </div>

      {/* Title and metadata */}
      {showMeta && (
        <div className="mt-2 space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{item.language}</span>
            {item.genres.length > 0 && (
              <>
                <span>•</span>
                <span>{item.genres[0]}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};