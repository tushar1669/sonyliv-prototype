import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { writeYPref, type YPref } from "@/lib/prefs";

interface OnboardingOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingOverlay({ open, onClose }: OnboardingOverlayProps) {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<'Telugu' | 'Hindi' | 'English'>('Telugu');
  const [genres, setGenres] = useState<string[]>([]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setLanguage('Telugu');
      setGenres([]);
    }
  }, [open]);

  const toggleGenre = (genre: string) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const next = () => setStep(prev => Math.min(3, prev + 1));
  const back = () => setStep(prev => Math.max(1, prev - 1));

  const finish = () => {
    const prefs: YPref = { language, genres };
    
    // Save to localStorage
    writeYPref(prefs);
    
    // Dispatch events
    window.dispatchEvent(new CustomEvent('yliv:preferences:updated', { 
      detail: prefs 
    }));
    window.dispatchEvent(new Event('yliv:onboarding:completed'));
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="onboarding-description">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-xl font-semibold pr-10">
            Complete your setup
          </DialogTitle>
          <DialogDescription id="onboarding-description" className="text-muted-foreground">
            Help us personalize your SonyLIV experience by selecting your preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum === step
                      ? 'bg-primary text-primary-foreground'
                      : stepNum < step
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className="w-12 h-0.5 bg-border mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Choose your preferred audio language</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(['Telugu', 'Hindi', 'English'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`p-4 text-left rounded-lg border transition-colors ${
                        language === lang
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <div className="font-medium">{lang}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {lang === 'Telugu' && 'తెలుగు - Regional entertainment'}
                        {lang === 'Hindi' && 'हिंदी - Bollywood & more'}
                        {lang === 'English' && 'English - International content'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pick your favorite genres</h3>
                <p className="text-sm text-muted-foreground">
                  Select at least 3 genres to continue
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    'action', 'comedy', 'drama', 'romance', 'thriller',
                    'horror', 'sci-fi', 'family', 'biography', 'sports',
                    'documentary', 'musical'
                  ].map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`p-3 text-center rounded-lg border transition-colors ${
                        genres.includes(genre)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <div className="font-medium capitalize">{genre}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review & Confirm</h3>
                <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="font-medium">Audio Language</div>
                    <div className="text-muted-foreground">{language}</div>
                  </div>
                  <div>
                    <div className="font-medium">Selected Genres</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {genres.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll use these preferences to personalize your content recommendations.
                  You can always change them later in your settings.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={back}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {step < 3 ? (
              <Button 
                onClick={next} 
                disabled={step === 2 && genres.length < 3}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} className="flex items-center gap-2">
                Save & Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}