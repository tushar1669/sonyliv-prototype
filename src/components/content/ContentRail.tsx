import React from "react";
import { ContentItem, ContentCard } from "./ContentCard";

export const ContentRail: React.FC<{ title: string; items: ContentItem[] }> = ({
  title,
  items,
}) => {
  if (!items?.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {items.map((it) => (
          <ContentCard key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
};
