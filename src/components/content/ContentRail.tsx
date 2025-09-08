import * as React from "react";
import type { CatalogItem } from "@/lib/catalog";
import { ContentCard } from "./ContentCard";

type CardVariant = "poster" | "landscape";

interface ContentRailProps {
  title: string;
  items: CatalogItem[];
  variant?: CardVariant;
}

export const ContentRail: React.FC<ContentRailProps> = ({
  title,
  items,
  variant = "poster",
}) => {
  if (!items?.length) return null;

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
        {items.map((item) => (
          <div key={item.id} role="listitem" className="shrink-0 w-40 md:w-44">
            <ContentCard item={item} variant={variant} />
          </div>
        ))}
      </div>
    </section>
  );
};

