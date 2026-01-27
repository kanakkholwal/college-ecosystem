"use client";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon, IconType } from "../icons";

export const intents = {
  // Standard variants
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  default_soft:
    "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/10 dark:text-primary hover:dark:bg-primary/5 hover:dark:text-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  secondary_soft:
    "bg-secondary/10 text-secondary hover:bg-secondary/20 dark:bg-secondary/10 dark:text-secondary hover:dark:bg-secondary/5 hover:dark:text-secondary",
  tertiary:
    "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90",
  tertiary_soft:
    "bg-tertiary/10 text-tertiary hover:bg-tertiary/20 dark:bg-tertiary/10 dark:text-tertiary hover:dark:bg-tertiary/5 hover:dark:text-tertiary",
  accent:
    "bg-accent text-accent-foreground hover:bg-accent/90",
  muted:
    "bg-muted text-muted-foreground hover:bg-muted/90",

  // Colored variants
  success:
    "bg-emerald-600 hover:bg-emerald-500 text-emerald-100",
  success_soft:
    "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20",
  info:
    "bg-sky-600 hover:bg-sky-500 text-sky-100",
  info_soft:
    "bg-sky-600/10 text-sky-600 hover:bg-sky-600/20",
  warning:
    "bg-amber-600 hover:bg-amber-500 text-amber-100",
  warning_soft:
    "bg-amber-600/10 text-amber-600 hover:bg-amber-600/20",
  destructive:
    "bg-rose-600 hover:bg-rose-500 text-rose-100",
  destructive_soft:
    "bg-rose-600/10 text-rose-600 hover:bg-rose-600/20",

  outline:
    "border border-border bg-card hover:bg-card/80 dark:bg-muted text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:border-primary",
  ghost:
    "bg-transparent dark:hover:bg-accent text-muted-foreground hover:text-accent-foreground dark:text-muted-foreground dark:hover:text-white",

  gray:
    "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:hover:text-gray-100",
  link: "text-primary underline-offset-4 hover:underline",
  dark: "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-800/50 dark:hover:bg-neutral-800",
  light:
    "bg-white shadow text-gray-700 hover:text-gray-700 border border-border",
  glass:
    "bg-white/10 backdrop-blur-sm shadow-lg border border-white/5",

  // Fancy variants
  rainbow:
    "animate-rainbow border-0 bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-primary-foreground dark:text-black [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.125rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] before:[filter:blur(0.75rem)] dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
  rainbow_outline:
    "border border-input border-b-transparent bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-accent-foreground dark:text-primary-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] before:[filter:blur(0.75rem)] dark:bg-[linear-gradient(#0a0a0a,#0a0a0a),linear-gradient(#0a0a0a_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
  // base 
  raw: "",
} as const;
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium capitalize transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none  shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all relative cursor-pointer group user-select-none",
  { // [&_svg:not([class*='size-'])]:size-4
    variants: {
      variant: intents,
      size: {
        default: "h-10 px-5 py-2 [&>svg]:size-4 has-[>svg]:px-5",
        xs: "h-6 rounded-md px-2.5 py-1.5 text-xs [&>svg]:size-3",
        sm: "h-8 rounded-md px-3 py-2 text-xs [&>svg]:size-4 has-[>svg]:pl-4",
        lg: "px-5 py-3 h-11 [&>svg]:size-6",
        xl: "px-6 py-3.5 h-14 text-base [&>svg]:size-8",
        icon: "size-10 p-3 [&>svg]:size-5",
        icon_xs: "size-5 rounded-md [&>svg]:size-3",
        icon_sm: "size-8 p-2 [&>svg]:size-4",
        icon_lg: "size-12 p-3.5 [&>svg]:size-6",
        icon_xl: "size-14 p-4 [&>svg]:size-8",
        responsive_lg: "h-9 px-4 py-2 text-sm md:h-11 md:px-5 md:py-3 md:text-base [&>svg]:size-4 md:[&>svg]:size-6 ",

      },
      effect: {
        none: "",
        expandIcon: "group gap-0",
        ringHover: "hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 transition-all",
        shine:
          "before:animate-shine relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-no-repeat background-position_0s_ease",
        shineHover:
          "relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] before:duration-1000",
        gooeyRight:
          "relative z-0 overflow-hidden transition-all duration-300 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-white/20 before:transition-transform before:duration-500 hover:before:translate-x-[0%] hover:before:translate-y-[0%]",
        gooeyLeft:
          "relative z-0 overflow-hidden transition-all duration-300 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-white/20 after:transition-transform after:duration-500 hover:after:translate-x-[0%] hover:after:translate-y-[0%]",
        underline:
          "relative !no-underline after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300",
        hoverUnderline:
          "relative !no-underline after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300",
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
        damped: "active:scale-99",
        scale: "hover:scale-105 active:scale-95",
        lift: "transition-all hover:-translate-y-0.5 hover:shadow-lg",
        press: "transition-all active:translate-y-0.5",
      },
      // Shadows are now mostly integrated into variants for better "native" feel, 
      // but these helpers remain for overrides.
      shadow: {
        none: "shadow-none",
        default: "shadow-lg shadow-primary/40",
        default_soft: "shadow-md shadow-primary/20",
        destructive: "shadow-lg shadow-destructive/40",
        success: "shadow-md shadow-emerald-500/50",
        warning: "shadow-md shadow-amber-500/40",
        dark: "shadow-lg shadow-black/40",
        light: "shadow-md shadow-gray-200/50",
        glass: "shadow-lg shadow-black/5",
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
    compoundVariants: [
      { variant: "default", size: "lg", shadow: "none", className: "shadow-lg shadow-primary/40" },
      { variant: "default_soft", shadow: "default_soft" },
      { variant: "destructive", shadow: "destructive" },
    ]
  }
);
type IconProps = {
  icon: IconType;
  iconPlacement?: "left" | "right";
  iconClassName?: string;
} | {
  icon?: never;
  iconPlacement?: never;
  iconClassName?: never;
}



interface ButtonBaseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

export type ButtonProps = ButtonBaseProps & IconProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
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
      icon,
      iconPlacement = "left",
      iconClassName,
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
            className,
            transition,
            rounded,
            width,
            effect,
            hoverEffect,

          })
        )}
        ref={ref}
        {...props}
      >
        {(icon && iconPlacement === "left") && <Icon name={icon} className={cn(iconClassName)} />}
        <Slottable>{props.children}</Slottable>
        {(icon && iconPlacement === "right") && (<Icon name={icon} className={cn(iconClassName)} />)}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

