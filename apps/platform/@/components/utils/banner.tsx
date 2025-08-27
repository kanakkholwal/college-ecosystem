"use client";
import { BorderBeam } from "@/components/animation/border-beam";
import { Button } from "@/components/ui/button";
import useStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ButtonLink } from "./link";

interface BannerActionPropsBase {
  className?: string;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  redirectUrl?: string;
  isClosable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode | null;
  id?: string;
}

interface BannerActionWithBtnProps extends BannerActionPropsBase {
  btnProps:
  | React.ComponentProps<typeof Button>
  | React.ComponentProps<typeof ButtonLink>;
  actionComponent?: never;
}

interface BannerActionWithComponent extends BannerActionPropsBase {
  btnProps?: never;
  actionComponent: React.ReactNode;
}

type BannerPanelProps = BannerActionWithBtnProps | BannerActionWithComponent;

export function BannerPanel({
  className,
  description,
  title,
  btnProps,
  actionComponent,
  redirectUrl,
  isClosable = true,
  icon,
  id,
  onClose,
}: BannerPanelProps) {
  const [isBannerPanelClosed, setIsBannerPanelClosed] = useStorage(
    id ? `bannerPanelClosed-${id}` : "bannerPanelClosed",
    false,
    "sessionStorage"
  );

  return (
    <AnimatePresence >
      {!isBannerPanelClosed && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 z-100 w-[calc(100%-theme(spacing.6))] max-w-6xl rounded-2xl bg-card/80 backdrop-blur-2xl shadow-xl px-4 py-3 md:py-2",
            className
          )}
          suppressHydrationWarning
        >
          <div className="mx-auto max-w-(--max-app-width) w-full flex grow gap-3 flex-wrap md:items-center justify-between px-3 lg:px-6 z-50 relative">
            <div className="flex grow gap-3 md:items-center">
              {icon && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 max-md:mt-0.5 [&>svg]:size-4 text-primary"
                  aria-hidden="true"
                >
                  {icon}
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm flex space-y-0.5 flex-col"
              >
                <div className="font-medium whitespace-nowrap text-sm">
                  {title}
                </div>
                {typeof description === "string"
                  ? description.length > 0 && (
                    <p className="text-xs text-muted-foreground text-pretty truncate line-clamp-2">
                      {description}
                    </p>
                  )
                  : description}
              </motion.div>
            </div>
            <div className="min-w-[8rem] flex items-center gap-1 float-end">
              {actionComponent ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {actionComponent}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    effect="shineHover"
                    {...btnProps}
                    onClick={() => {
                      if (redirectUrl) {
                        window.open(redirectUrl, "_blank");
                      }
                    }}
                    className={cn(btnProps?.className)}
                  />
                </motion.div>
              )}
              {isClosable && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="ghost"
                    size="icon_xs"
                    rounded="full"
                    transition="damped"
                    className="group shrink-0 p-0 -mr-2 absolute right-2 left-auto top-1/2 -translate-y-1/2 hover:bg-transparent"
                    onClick={() => {
                      setIsBannerPanelClosed(true);
                      onClose?.();
                    }}
                    aria-label="Close banner"
                  >
                    <X
                      size={16}
                      strokeWidth={2}
                      className="opacity-60 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
          <BorderBeam />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


interface RotatingBannerProps {
  banners: BannerPanelProps[]; // array of props
  interval?: number; // ms
}

export function RotatingBanner({ banners, interval = 5000 }: RotatingBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, interval);
    return () => clearInterval(id);
  }, [banners, interval]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50" suppressHydrationWarning>
      <AnimatePresence mode="wait">
        <motion.div
          key={index} // important for re-mount animation
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
        >
          <BannerPanel {...banners[index]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}