import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface DownloadsBadgeProps {
  count: number;
  onClick: () => void;
}

export function DownloadsBadge({ count, onClick }: DownloadsBadgeProps) {
  if (count === 0) return null;
  
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="relative">
      <Download className="h-4 w-4" />
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {count}
      </Badge>
      <span className="sr-only">Downloads ({count} active)</span>
    </Button>
  );
}