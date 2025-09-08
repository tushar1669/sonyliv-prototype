import React from "react";

export interface ContentItem {
  id: string;
  title: string;
  poster?: string;
  language: string;
  genres: string[];
  category?: string;
  expiresAt?: string;
}

export const ContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-colors">
      <div className="aspect-[2/3] bg-muted flex items-center justify-center">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-xs text-muted-foreground px-2 text-center">
            {item.title}
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm line-clamp-1">{item.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {item.genres?.slice(0, 2).join(" • ")}
        </p>
      </div>
    </div>
  );
};
