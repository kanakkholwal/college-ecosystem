"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React, { useEffect, useId, useRef } from "react";
import { appConfig } from "~/project.config";
import { getClientEnv } from "~/utils/env";
import "./adsense.css";

const adsTypes = {
  "display-horizontal": {
    adSlot: "4288761968",
    adFormat: "auto",
  },
  "display-square": {
    adSlot: "6395200498",
    adFormat: "auto",
  },
  "display-vertical": {
    adSlot: "6395200498",
    adFormat: "auto",
  },
  multiplex: {
    adSlot: "8619691544",
    adFormat: "autorelaxed",
  },
} as const;


declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[]
  }
}
interface AdUnitProps {
  adSlot: keyof typeof adsTypes;
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ adSlot, className }) => {
  const adsProps = adsTypes[adSlot];
  const id = useId();
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (!getClientEnv().isProd) return;
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("Adsense error:", e);
      adRef.current?.classList?.add("error");
    }
  }, [pathname, adSlot]); // refresh ad when route or slot changes

  return (
    <div className={cn("adsense-container empty:hidden", className)} id={`adsense-${id}`}>
      <ins
        key={id}
        id={`adsbygoogle-${id}`}
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={appConfig.verifications.google_adsense}
        data-ad-slot={adsProps.adSlot}
        data-ad-format={adsProps.adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdUnit;
