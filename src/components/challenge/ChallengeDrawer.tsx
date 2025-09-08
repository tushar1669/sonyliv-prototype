import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, Target } from "lucide-react";
import type { ChallengeState } from "@/lib/challenge";
import { startChallenge, saveChallenge, getDay, getPercent } from "@/lib/challenge";

type Props = {
  open: boolean;
  onClose: () => void;
  state: ChallengeState | null;
  onStateChange: (newState: ChallengeState) => void;
};

export function ChallengeDrawer({ open, onClose, state, onStateChange }: Props) {
  React.useEffect(() => {
    if (open && state) {
      console.log('challenge_opened');
    }
  }, [open, state]);

  const handleStartChallenge = () => {
    const newState = startChallenge();
    onStateChange(newState);
    console.log('challenge_started');
  };

  const handleFindPicks = () => {
    const picksSection = document.getElementById('yliv-challenge-picks');
    if (picksSection) {
      picksSection.scrollIntoView({ behavior: 'smooth' });
    }
    onClose();
  };

  if (!state) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              7-Day Telugu Tour
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Join our 7-day challenge to discover amazing Telugu content and unlock bonus features!
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Complete 4 fun tasks</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Unlock bonus week access</span>
              </div>
            </div>
            
            <Button onClick={handleStartChallenge} className="w-full">
              Start Challenge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentDay = getDay(state);
  const percent = getPercent(state);
  const isCompleted = state.completedAt !== null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            7-Day Telugu Tour
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Day {currentDay} of 7</span>
            <span>•</span>
            <span>{percent}% complete</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {isCompleted && (
            <div className="text-center space-y-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-primary mx-auto" />
              <div>
                <p className="font-medium text-primary">Congratulations!</p>
                <p className="text-sm text-muted-foreground">You've completed the Telugu Tour!</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {state.tasks.map((task) => (
              <div key={task.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {task.done ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 border rounded-full" />
                    )}
                    <span className={`text-sm font-medium ${task.done ? 'text-green-600' : 'text-foreground'}`}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant={task.done ? "default" : "secondary"} className="text-xs">
                    {task.progress}/{task.target}
                  </Badge>
                </div>
                
                <Progress 
                  value={(task.progress / task.target) * 100} 
                  className="h-2" 
                />
                
                {task.hint && !task.done && (
                  <p className="text-xs text-muted-foreground pl-6">
                    {task.hint}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {!isCompleted && (
            <Button onClick={handleFindPicks} variant="outline" className="w-full">
              Find Picks
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}