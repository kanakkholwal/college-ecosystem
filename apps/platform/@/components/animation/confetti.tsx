"use client";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import useStorage from "@/hooks/useLocalStorage";
// import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { AnimatedGradientText } from "./animated-shiny-text";

export function CelebrationDialog() {
  const [celebrated, setCelebrated] = useStorage(
    "impressions-celebrated",
    true,
    "localStorage"
  );
  const [isOpen, setIsOpen] = useState(true);

  const fireConfetti = () => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 35,
      spread: 120,
      ticks: 80,
      zIndex: 9999,
      colors: [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff",
      ],
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);
      // Left side
      // confetti({
      //     ...defaults,
      //     particleCount,
      //     origin: {
      //         x: randomInRange(0.1, 0.3),
      //         y: Math.random() - 0.2
      //     },
      //     angle: randomInRange(55, 125)
      // });
      // // Right side
      // confetti({
      //     ...defaults,
      //     particleCount,
      //     origin: {
      //         x: randomInRange(0.7, 0.9),
      //         y: Math.random() - 0.2
      //     },
      //     angle: randomInRange(55, 125)
      // });
    }, 250);
  };

  const handleExit = () => {
    setIsOpen(false);
    setCelebrated(true);
  };
  useEffect(() => {
    if (isOpen && !celebrated) {
      fireConfetti();
    }
  }, [isOpen]);
  if (celebrated) return null;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open === false) {
          handleExit();
        }
      }}
    >
      <DialogContent
        className="rounded-xl max-w-md shadow-2xl p-8 border-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-tertiary rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2 z-0" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2 z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2 z-0" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2 z-0" />

        <DialogHeader className="relative z-10">
          <div className="mx-auto text-7xl flex items-center justify-center size-32 rounded-full bg-primary/10 mb-6">
            <span className="animate-bounce">🎉</span>
          </div>

          <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
            Amazing Milestone Reached!
          </DialogTitle>

          <DialogDescription className="mt-4 text-center ">
            <AnimatedGradientText className="block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-secondary mb-2">
              100,000+ Impressions
            </AnimatedGradientText>
            <p className="mt-3 text-sm text-muted-foreground">
              Thank you for being part of this incredible journey! Your support
              means everything to us.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center relative z-10">
          {/* <Button
                        onClick={fireConfetti}
                        size="lg"
                        rounded="large"
                        className="px-8 py-6"
                        variant="rainbow_outline"
                    >
                        Celebrate Again!
                    </Button> */}

          <DialogClose asChild>
            <Button
              variant="default_soft"
              width="full"
              size="lg"
              rounded="large"
              className="px-8 py-6"
              onClick={() => {
                handleExit();
              }}
            >
              Continue Exploring
              <Icon name="arrow-right" />
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
