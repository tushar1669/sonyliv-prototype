import * as React from "react";
import type { CatalogItem } from "@/lib/catalog";

type CardVariant = "poster" | "landscape";

interface ContentCardProps {
  item: CatalogItem;
  variant?: CardVariant;
  onClick?: (item: CatalogItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  variant = "poster",
  onClick,
}) => {
  const img = variant === "poster" ? item.posterUrl : item.landscapeUrl;

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className="group relative overflow-hidden rounded-xl border border-border bg-card text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`${item.title} (${item.language})`}
      style={{
        aspectRatio: variant === "poster" ? "2/3" : "16/9",
      }}
    >
      <img
        src={img}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* gradient + title */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
        <div className="line-clamp-1 text-sm font-semibold text-white drop-shadow">
          {item.title}
        </div>
        <div className="mt-0.5 line-clamp-1 text-[11px] text-white/75">
          {item.genres?.slice(0, 2).join(" • ")}
        </div>
      </div>
    </button>
  );
};
