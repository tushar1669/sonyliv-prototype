import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getStorageItem, setStorageItem } from "@/lib/prefs";

const TELUGU_GENRES = [
  "Action", "Drama", "Comedy", "Romance", "Thriller",
  "Family", "Biography", "Crime", "Sports", "Music",
];

interface OnboardingOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingOverlay({ open, onClose }: OnboardingOverlayProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<"Telugu" | "Hindi" | "English">(
    "Telugu"
  );
  const [genres, setGenres] = useState<string[]>([]);

  // Body scroll lock + log stubs
  useEffect(() => {
    if (open) {
      console.log("onboarding_overlay_opened");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    // If user has prefs, hydrate quick summary (optional)
    const saved = getStorageItem("yliv.pref");
    if (saved?.language) setLanguage(saved.language);
    if (Array.isArray(saved?.genres)) setGenres(saved.genres);
  }, []);

  const toggleGenre = (g: string) =>
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const next = () => setStep((s) => (Math.min(3, s + 1) as 1 | 2 | 3));
  const back = () => setStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3));

  const previewCount = useMemo(() => Math.max(6, genres.length * 2), [genres]);

  const finish = () => {
    setStorageItem("yliv.pref", {
      language,
      genres,
      completedAt: Date.now(),
    });
    window.dispatchEvent(new CustomEvent("yliv:prefsSaved"));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl w-full mx-4" aria-describedby="onboarding-desc">
        <DialogHeader className="mb-2">
          <div className="flex items-center justify-between">
            <DialogTitle id="onboarding-title" className="text-xl">
              Complete your setup
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close setup dialog"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription id="onboarding-desc">
            Make your homepage Telugu-first with quick preferences.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-3 mb-5 text-sm">
          {[
            { n: 1, label: "Choose Language" },
            { n: 2, label: "Pick Genres" },
            { n: 3, label: "Review & Confirm" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <span
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                  n <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {n}
              </span>
              <span className={n === step ? "text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
              {n < 3 && <div className="w-6 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Language */}
        {step === 1 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Your default audio language. You can change this later.
            </p>
            <div className="flex flex-wrap gap-3">
              {(["Telugu", "Hindi", "English"] as const).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLanguage(lng)}
                  className={[
                    "px-4 py-2 rounded-full border",
                    language === lng
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-foreground/80 hover:bg-muted",
                  ].join(" ")}
                  aria-pressed={language === lng}
                >
                  {lng}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <span />
              <Button onClick={next} className="min-w-[120px]">Next</Button>
            </div>
          </div>
        )}

        {/* Step 2: Genres */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pick a few Telugu genres you like (3+ recommended).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TELUGU_GENRES.map((g) => {
                const active = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={[
                      "px-3 py-2 rounded-md border text-left",
                      active
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-foreground/80 hover:bg-muted",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={back} className="min-w-[120px]">
                Back
              </Button>
              <Button onClick={next} className="min-w-[120px]">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-md border border-border p-4 bg-card">
              <h4 className="font-semibold mb-2">Your preferences</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="text-foreground">Language:</span> {language}
                </li>
                <li>
                  <span className="text-foreground">Genres:</span>{" "}
                  {genres.length ? genres.join(", ") : "—"}
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              We’ll tune the homepage and show you ~{previewCount} Telugu titles first.
            </p>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={back} className="min-w-[120px]">
                Back
              </Button>
              <Button onClick={finish} className="min-w-[140px]">
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
