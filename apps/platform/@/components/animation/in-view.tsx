"use client";
import { cn } from "@/lib/utils";
import {
    motion,
    Transition,
    useInView,
    UseInViewOptions,
    Variant,
} from "framer-motion";
import { ReactNode, useRef, useState } from "react";

export type InViewProps = {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  once?: boolean;
  className?: string;
  id?: string;
};

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = "div",
  once,
  className,
  id,
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const [isViewed, setIsViewed] = useState(false);

  const MotionComponent = motion[as as keyof typeof motion] as typeof as;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      onAnimationComplete={() => {
        if (once) setIsViewed(true);
      }}
      animate={isInView || isViewed ? "visible" : "hidden"}
      id={id}
      variants={variants}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}
