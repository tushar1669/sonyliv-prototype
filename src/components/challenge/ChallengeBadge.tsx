import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { ChallengeState } from "@/lib/challenge";
import { isActive, getPercent } from "@/lib/challenge";

type Props = {
  state: ChallengeState | null;
  onClick: () => void;
};

export function ChallengeBadge({ state, onClick }: Props) {
  if (!state || !isActive(state)) {
    return null;
  }

  const percent = getPercent(state);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      className="relative flex items-center gap-2 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
    >
      <Trophy className="h-3 w-3" />
      <span>7-Day Tour</span>
      <Badge 
        variant="secondary" 
        className="h-4 px-1.5 text-xs bg-primary/20 text-primary hover:bg-primary/30"
      >
        {percent}%
      </Badge>
      <span className="sr-only">Telugu Tour Challenge - {percent}% complete</span>
    </Button>
  );
}