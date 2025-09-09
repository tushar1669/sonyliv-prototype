import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RewardsBadgeProps = {
  hasUnclaimed: boolean;
  onClick: () => void;
};

export function RewardsBadge({ hasUnclaimed, onClick }: RewardsBadgeProps) {
  if (!hasUnclaimed) return null;

  console.log('reward_badge_shown');

  return (
    <Button
      variant="ghost"
      size="sm" 
      onClick={onClick}
      aria-label="Open rewards"
      className={cn(
        "relative h-8 px-2 text-foreground/80 hover:text-foreground hover:bg-muted/50",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      <Gift className="h-4 w-4 mr-1" />
      <span className="text-sm font-medium">Rewards</span>
      <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary-foreground">1</span>
      </div>
    </Button>
  );
}