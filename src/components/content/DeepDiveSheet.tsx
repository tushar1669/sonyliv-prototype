import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentCard } from "@/components/content/ContentCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { byActor, byDirector, relatedByPrimaryGenre } from "@/lib/catalog";
import type { CatalogItem } from "@/lib/catalog";

type DeepDiveSheetProps = {
  open: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  catalog: CatalogItem[];
};

export function DeepDiveSheet({ open, onClose, item, catalog }: DeepDiveSheetProps) {
  if (!item) return null;

  const language = item.language;
  
  // Get recommendations for each category
  const byActorItems = item.actors[0] ? byActor(catalog, item.actors[0], language, 12) : [];
  const byDirectorItems = item.director ? byDirector(catalog, item.director, language, 12) : [];
  const byGenreItems = relatedByPrimaryGenre(catalog, item, language, 12);

  const handleCardClick = (selectedItem: CatalogItem, source: 'actor' | 'director' | 'genre') => {
    console.log('deep_dive_click', { source, itemId: selectedItem.id, originalItem: item.id });
    
    // Open the mock player for the selected item
    window.dispatchEvent(new CustomEvent('yliv:deep-dive:play', { 
      detail: { item: selectedItem, source } 
    }));
  };

  // Log when deep dive is shown
  React.useEffect(() => {
    if (open && item) {
      console.log('deep_dive_shown', { 
        itemId: item.id, 
        title: item.title,
        recommendations: {
          actor: byActorItems.length,
          director: byDirectorItems.length,
          genre: byGenreItems.length
        }
      });
    }
  }, [open, item, byActorItems.length, byDirectorItems.length, byGenreItems.length]);

  const Rails = ({ title, items, source }: { 
    title: string; 
    items: CatalogItem[]; 
    source: 'actor' | 'director' | 'genre';
  }) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {items.slice(0, 6).map((recItem) => (
              <div key={recItem.id} className="flex-shrink-0 w-32">
                <ContentCard
                  item={recItem}
                  variant="poster"
                  showMeta={false}
                  onClick={() => handleCardClick(recItem, source)}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Because you watched {item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[60vh] px-6 pb-6">
            <div className="space-y-8">
              {/* More by Actor */}
              {item.actors[0] && (
                <Rails
                  title={`More by ${item.actors[0]}`}
                  items={byActorItems}
                  source="actor"
                />
              )}

              {/* From Director */}
              {item.director && (
                <Rails
                  title={`From Director ${item.director}`}
                  items={byDirectorItems}
                  source="director"
                />
              )}

              {/* Similar Genres */}
              {item.genres[0] && (
                <Rails
                  title={`Similar ${item.genres[0]} ${item.language} Content`}
                  items={byGenreItems}
                  source="genre"
                />
              )}

              {/* Fallback if no recommendations */}
              {byActorItems.length === 0 && byDirectorItems.length === 0 && byGenreItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No related content found at this time.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}