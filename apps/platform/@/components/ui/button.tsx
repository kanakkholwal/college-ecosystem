"use client";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium capitalize transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all relative cursor-pointer group user-select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary dark:bg-primary text-white hover:bg-primary/90",
        default_light:
          "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/10 dark:text-primary hover:dark:bg-primary/5 hover:dark:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        success_light:
          "bg-green-600/10 text-green-600 hover:bg-green-600/20 dark:bg-green-600/20 dark:text-green-600 hover:dark:bg-green-600/10 hover:dark:text-green-600",
        warning_light:
          "bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600/20 dark:bg-yellow-600/20 dark:text-yellow-600 hover:dark:bg-yellow-600/10 hover:dark:text-yellow-600",
        destructive_light:
          "bg-red-600/10 text-red-600 hover:bg-red-600/20 dark:bg-red-600/5 dark:text-red-600 hover:dark:bg-red-600/10 hover:dark:text-red-600",
        destructive:
          "bg-red-100 hover:bg-red-200 text-red-700	dark:bg-red-700 dark:text-red-200 dark:hover:bg-red-800 dark:hover:text-red-200",
        outline:
          "border border-border bg-card hover:bg-card/80 dark:bg-muted text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:border-primary",
        ghost:
          "bg-transparent dark:hover:bg-accent text-muted-foreground hover:text-accent-foreground dark:text-muted-foreground dark:hover:text-white",
        success:
          "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-700",
        slate:
          "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-950 dark:hover:text-slate-100",
        link: "text-primary underline-offset-4 hover:underline",
        dark: "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-800",
        light:
          "bg-white shadow text-gray-700 hover:text-gray-700 border border-border",
        glass:
          "bg-white/90 dark:bg-white/5 backdrop-blur-xl border-slate-600/10 dark:border-border/70",
        rainbow:
          "animate-rainbow border-0 bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-primary-foreground dark:text-black [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.125rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] before:[filter:blur(0.75rem)] dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
        rainbow_outline:
          "border border-input border-b-transparent bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-accent-foreground dark:text-primary-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] before:[filter:blur(0.75rem)] dark:bg-[linear-gradient(#0a0a0a,#0a0a0a),linear-gradient(#0a0a0a_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",

        vote: "w-full rounded-lg border border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:shadow-md dark:border-primary/70 dark:text-primary",
        voted: "w-full rounded-lg bg-gradient-to-r from-primary/90 to-primary text-white shadow-lg hover:shadow-xl",


        gradient_blue:
          "text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 hover:bg-gradient-to-br",
        gradient_green:
          "text-white bg-gradient-to-r from-green-400 via-green-600 to-green-700 hover:bg-gradient-to-br",
        gradient_cyan:
          "text-white bg-gradient-to-r from-cyan-400 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br",
        gradient_teal:
          "text-white bg-gradient-to-r from-teal-400 via-teal-600 to-teal-700 hover:bg-gradient-to-br",
        gradient_lime:
          "text-white bg-gradient-to-r from-lime-400 via-lime-600 to-lime-700 hover:bg-gradient-to-br",
        gradient_red:
          "text-white bg-gradient-to-r from-red-400 via-red-600 to-red-700 hover:bg-gradient-to-br",
        gradient_pink:
          "text-white bg-gradient-to-r from-pink-400 via-pink-600 to-pink-700 hover:bg-gradient-to-br",
        gradient_purple:
          "text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br",
        gradient_emerald:
          "text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:bg-gradient-to-br",
        gradient_yellow:
          "text-white bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br",
        raw: "",
      },
      size: {
        default: "h-9 px-4 py-2 [&>svg]:size-4 has-[>svg]:px-5",
        xs: "h-6 rounded-md px-2.5 py-1.5 text-xs [&>svg]:size-3",
        sm: "h-8 rounded-md px-3 py-2 text-xs [&>svg]:size-4 has-[>svg]:pl-4",
        lg: "px-5 py-3 h-11 [&>svg]:size-6",
        xl: "px-6 py-3.5 h-14 text-base [&>svg]:size-8",
        icon: "size-10 p-3 [&>svg]:size-5",
        icon_xs: "size-5 rounded-md [&>svg]:size-4",
        icon_sm: "size-8 p-2 [&>svg]:size-4",
        icon_lg: "size-12 p-3.5 [&>svg]:size-6",
        icon_xl: "size-14 p-4 [&>svg]:size-8",
      },
      effect: {
        none: "",
        expandIcon:
          "group relative group-hover:gap-4 [&>svg.icon]:transition-transform [&>svg.icon]:group-hover:translate-x-1",
        ringHover:
          "transition-all duration-300 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
        shine:
          "before:animate-shine relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-no-repeat background-position_0s_ease",
        shineHover:
          "relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] before:duration-1000",
        gooeyRight:
          "relative z-0 overflow-hidden transition-all duration-600 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-white/40 before:transition-transform before:duration-1000  hover:before:translate-x-[0%] hover:before:translate-y-[0%]",
        gooeyLeft:
          "relative z-0 overflow-hidden transition-all duration-600 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-white/40 after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%]",
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
        damped: "active:scale-95",
        scale: "hover:scale-105 active:scale-95",
      },
      shadow: {
        none: "shadow-none",
        default: "shadow-lg shadow-primary/50",
        default_light: "shadow-md shadow-primary/20",
        destructive: "shadow-lg shadow-destructive/50",
        destructive_light: "shadow-md shadow-destructive/10",
        success: "shadow-md shadow-green-500/50",
        success_light: "shadow-md shadow-green-500/10",
        warning: "shadow-md shadow-yellow-500/50",
        warning_light: "shadow-md shadow-yellow-500/10",
        dark: "shadow-lg shadow-neutral-900/50",
        light: "shadow-md shadow-gray-200/50",
        glass: "shadow-lg shadow-white/20 dark:shadow-black/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      transition: "damped",
      hoverEffect: "none",
      effect: "none",
      rounded: "default",
      // shadow: "none",
    },
  }
);
interface IconProps {
  icon: React.ElementType;
  iconPlacement: "left" | "right";
}

interface IconRefProps {
  icon?: never;
  iconPlacement?: undefined;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

export type ButtonIconProps = IconProps | IconRefProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
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
      icon: Icon,
      iconPlacement,
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
        {Icon &&
          iconPlacement === "left" &&
          (effect === "expandIcon" ? (
            <div className="w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-100 group-hover:pr-2 group-hover:opacity-100">
              <Icon />
            </div>
          ) : (
            <Icon />
          ))}
        <Slottable>{props.children}</Slottable>
        {Icon &&
          iconPlacement === "right" &&
          (effect === "expandIcon" ? (
            <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
              <Icon />
            </div>
          ) : (
            <Icon />
          ))}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
