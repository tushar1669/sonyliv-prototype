import type { ChallengeState } from './challenge';

export type RewardType = 'discount_10' | 'bonus_week';

export type Reward = {
  type: RewardType;
  code: string;
  createdAt: number;
  claimedAt?: number;
};

const KEY = 'yliv.rewards';

export function getReward(): Reward | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to read reward from localStorage:', error);
    return null;
  }
}

export function saveReward(reward: Reward): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KEY, JSON.stringify(reward));
  } catch (error) {
    console.warn('Failed to save reward to localStorage:', error);
  }
}

export function ensureRewardForChallenge(challenge: ChallengeState): void {
  if (!challenge.completedAt) return;
  
  const existing = getReward();
  if (existing) return; // Already have a reward
  
  const reward: Reward = {
    type: 'discount_10',
    code: 'TELUGU10',
    createdAt: Date.now()
  };
  
  saveReward(reward);
  console.log('reward_available', { type: reward.type, code: reward.code });
  
  window.dispatchEvent(new CustomEvent('yliv:rewards:changed', { detail: { reward } }));
}

export function claimReward(): void {
  const reward = getReward();
  if (!reward || reward.claimedAt) return;
  
  console.log('reward_claim_clicked', { type: reward.type, code: reward.code });
  
  const claimedReward = {
    ...reward,
    claimedAt: Date.now()
  };
  
  saveReward(claimedReward);
  console.log('reward_claimed', { type: reward.type, code: reward.code });
  
  window.dispatchEvent(new CustomEvent('yliv:rewards:changed', { detail: { reward: claimedReward } }));
}