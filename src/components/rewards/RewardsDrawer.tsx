import { Gift, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Reward } from '@/lib/rewards';
import { claimReward } from '@/lib/rewards';

type RewardsDrawerProps = {
  open: boolean;
  onClose: () => void;
  reward: Reward | null;
};

export function RewardsDrawer({ open, onClose, reward }: RewardsDrawerProps) {
  if (!reward) return null;

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      console.log('reward_drawer_opened', { type: reward.type, code: reward.code });
    } else {
      if (!reward.claimedAt) {
        console.log('reward_dismissed', { type: reward.type, code: reward.code });
      }
      onClose();
    }
  };

  const handleClaim = () => {
    claimReward();
    onClose();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(reward.code);
  };

  const isClaimedReward = !!reward.claimedAt;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {isClaimedReward ? 'Reward Claimed!' : 'Congratulations!'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {reward.type === 'discount_10' && (
              <>
                You unlocked <strong>10% off Annual</strong> (mock)
              </>
            )}
            {reward.type === 'bonus_week' && (
              <>Bonus week unlocked</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {reward.type === 'discount_10' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Your discount code:</p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="font-mono text-base px-3 py-1">
                  {reward.code}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCode}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {!isClaimedReward ? (
              <>
                <Button
                  onClick={handleClaim}
                  className="w-full"
                  aria-label="Claim reward"
                >
                  Claim
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-muted-foreground"
                >
                  Maybe later
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}