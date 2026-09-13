"use client";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon, type IconType } from "../icons";

export const intents = {
  default: "bg-action text-action-foreground shadow-xs hover:opacity-90",
  primary:
    "bg-primary text-primary-foreground shadow-xs hover:bg-primary-active",
  default_soft: "bg-primary/10 text-primary hover:bg-primary/15",
  secondary: "bg-muted text-foreground hover:bg-border",
  secondary_soft: "bg-muted text-foreground hover:bg-border",
  tertiary: "bg-tertiary text-tertiary-foreground hover:opacity-90",
  tertiary_soft: "bg-tertiary/10 text-tertiary hover:bg-tertiary/15",
  accent: "bg-accent text-accent-foreground hover:bg-border",
  muted: "bg-muted text-muted-foreground hover:text-foreground",

  success: "bg-success text-success-foreground hover:opacity-90",
  success_soft: "bg-success/10 text-success hover:bg-success/15",
  info: "bg-info text-info-foreground hover:opacity-90",
  info_soft: "bg-info/10 text-info hover:bg-info/15",
  warning: "bg-warning text-warning-foreground hover:opacity-90",
  warning_soft: "bg-warning/10 text-warning hover:bg-warning/15",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  destructive_soft:
    "bg-destructive/10 text-destructive hover:bg-destructive/15",

  outline:
    "border border-border bg-card text-foreground shadow-xs hover:bg-muted",
  ghost:
    "text-foreground hover:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground",
  gray: "bg-muted text-foreground hover:bg-border",
  link: "text-primary underline-offset-4 hover:underline",
  dark: "bg-action text-action-foreground shadow-xs hover:opacity-90",
  ink: "bg-fixed-dark text-fixed-light shadow-xs hover:opacity-90",
  light: "bg-fixed-light text-fixed-dark shadow-xs hover:opacity-90",
  glass:
    "border border-border bg-background/80 text-foreground backdrop-blur-xl hover:bg-muted",

  // Legacy names kept for existing call sites; both render the brand action.
  rainbow:
    "bg-primary text-primary-foreground shadow-xs hover:bg-primary-active",
  rainbow_outline:
    "border border-border bg-card text-foreground shadow-xs hover:bg-muted",
  raw: "",
} as const;

const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-craft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 group",
  {
    variants: {
      variant: intents,
      size: {
        default: "h-10 px-4 [&>svg]:size-4",
        xs: "h-7 gap-1 px-2.5 text-xs [&>svg]:size-3.5",
        sm: "h-9 gap-1.5 px-3 [&>svg]:size-4",
        lg: "h-11 px-6 [&>svg]:size-5",
        xl: "h-12 px-8 text-base [&>svg]:size-5",
        icon: "size-10 [&>svg]:size-5",
        icon_xs: "size-7 [&>svg]:size-3.5",
        icon_sm: "size-9 [&>svg]:size-4",
        icon_lg: "size-12 [&>svg]:size-6",
        icon_xl: "size-14 [&>svg]:size-7",
        responsive_lg:
          "h-10 px-4 md:h-11 md:px-6 [&>svg]:size-4 md:[&>svg]:size-5",
      },
      // Decorative effects were retired with the Orbit system; names stay so call sites compile.
      effect: {
        none: "",
        expandIcon: "",
        ringHover: "",
        shine: "",
        shineHover: "",
        gooeyRight: "",
        gooeyLeft: "",
        underline: "",
        hoverUnderline: "",
      },
      hoverEffect: {
        none: "",
      },
      width: {
        default: "w-auto",
        full: "w-full",
        fit: "w-fit mx-auto",
        content: "max-w-content mx-auto",
        xs: "w-full max-w-xs mx-auto",
        sm: "w-full max-w-sm mx-auto",
        md: "w-full max-w-md mx-auto",
        lg: "w-full max-w-lg mx-auto",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        large: "rounded-lg",
        none: "rounded-none",
      },
      transition: {
        none: "",
        damped: "active:scale-[0.98] motion-reduce:active:scale-100",
        scale: "active:scale-[0.98] motion-reduce:active:scale-100",
        lift: "active:scale-[0.98] motion-reduce:active:scale-100",
        press: "active:scale-[0.98] motion-reduce:active:scale-100",
      },
      shadow: {
        none: "",
        default: "",
        default_soft: "",
        destructive: "",
        success: "",
        warning: "",
        dark: "",
        light: "",
        glass: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      transition: "damped",
      hoverEffect: "none",
      effect: "none",
      rounded: "default",
      shadow: "none",
    },
  }
);
type IconProps =
  | {
      icon: IconType;
      iconPlacement?: "left" | "right";
      iconClassName?: string;
    }
  | {
      icon?: never;
      iconPlacement?: never;
      iconClassName?: never;
    };

interface ButtonBaseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

export type ButtonProps = ButtonBaseProps & IconProps;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      rounded,
      transition,
      width,
      effect,
      hoverEffect,
      shadow,
      icon,
      iconPlacement = "left",
      iconClassName,
      isLoading: _isLoading,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            transition,
            rounded,
            width,
            effect,
            hoverEffect,
            shadow,
          }),
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && iconPlacement === "left" && (
          <Icon name={icon} className={cn(iconClassName)} />
        )}
        <Slottable>{props.children}</Slottable>
        {icon && iconPlacement === "right" && (
          <Icon name={icon} className={cn(iconClassName)} />
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
