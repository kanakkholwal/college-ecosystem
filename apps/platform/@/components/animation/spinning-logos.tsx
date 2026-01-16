"use client";
import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";

import React from "react";
import { Icon, IconType } from "../icons";

export interface SpinningLogosProps {
  radiusToCenterOfIcons?: number;
  iconWrapperWidth?: number;
  ringPadding?: number;
  logos: Array<{
    icon: IconType;
    className: string;
    name: string;
  }>;
  appLogo: string | StaticImageData;
  className?: string;
}

export const SpinningLogos: React.FC<SpinningLogosProps> = ({
  radiusToCenterOfIcons = 180,
  iconWrapperWidth = 60,
  ringPadding = 40,
  logos,
  appLogo,
  className,
}) => {
  // Convert degrees to radians for trigonometric calculations
  const toRadians = (degrees: number): number => (Math.PI / 180) * degrees;

  return (
    <div
      className={cn(
        "flex justify-center items-center bg-background p-8 overflow-hidden ",
        className
      )}
    >
      <div
        style={{
          width: radiusToCenterOfIcons * 2 + iconWrapperWidth + ringPadding,
          height: radiusToCenterOfIcons * 2 + iconWrapperWidth + ringPadding,
        }}
        className="relative rounded-full bg-card shadow-lg border border-border"
      >
        <div className="absolute inset-0 animate-spin-slow">
          {logos.map((logo, index) => {
            const angle = (360 / logos.length) * index;
            return (
              <div
                key={index}
                style={{
                  top: `calc(50% - ${iconWrapperWidth / 2}px + ${radiusToCenterOfIcons * Math.sin(toRadians(angle))}px)`,
                  left: `calc(50% - ${iconWrapperWidth / 2}px + ${radiusToCenterOfIcons * Math.cos(toRadians(angle))}px)`,
                  width: iconWrapperWidth,
                  height: iconWrapperWidth,
                }}
                className={cn(
                  "absolute flex items-center justify-center rounded-full shadow-md border-2 animate-spin-reverse",
                  logo.className
                )}
                aria-label={`${logo.name} logo`}
              >
                <Icon name={logo.icon} className="size-6" />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background rounded-full w-3/5 h-3/5 flex items-center justify-center shadow-inner border-4 border-border">
            <span className="text-2xl sm:text-3xl font-bold text-foreground text-center px-4">
              <Image
                height={40}
                width={280}
                className="h-14 w-auto"
                src={appLogo}
                alt="logo"
                loading="eager"
                priority
                unoptimized
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
