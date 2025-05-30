"use client";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

// const buttonVariants = cva(
//   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary dark:bg-primary text-white  hover:bg-primary/90",
//         default_light: "bg-primary/10 text-primary hover:bg-primary/20",
//         success_light: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
//         warning_light:
//           "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
//         destructive_light:
//           "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-500 hover:dark:bg-red-500/10 hover:dark:text-red-500",
//         destructive:
//           "bg-red-100 hover:bg-red-200 text-red-600	dark:bg-red-700 dark:text-red-200 dark:hover:bg-red-800 dark:hover:text-red-200",
//         outline:
//           "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
//         secondary:
//           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//         ghost:
//           "bg-white hover:bg-white hover:text-accent-foreground dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white",
//         slate:
//           "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-950 dark:hover:text-slate-100",
//         dark: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/80 dark:hover:bg-white/70 dark:text-slate-200",
//         link: "text-primary underline-offset-4 hover:underline",
//         success:
//           "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700",
//         gradient_blue:
//           "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br",
//         gradient_green:
//           "text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br",
//         gradient_cyan:
//           "text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br",
//         gradient_teal:
//           "text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br",
//         gradient_lime:
//           "text-white bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 hover:bg-gradient-to-br",
//         gradient_red:
//           "text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br",
//         gradient_pink:
//           "text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br",
//         gradient_purple:
//           "text-white bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 hover:bg-gradient-to-br",
//       },
//       size: {
//         default: "h-9 px-4 py-2",
//         sm: "h-8 rounded-md px-3 text-xs",
//         lg: "h-10 rounded-md px-8",
//         icon: "h-9 w-9 p-3",
//         xs: "px-3 py-2 text-xs h-4",
//         xl: "px-6 py-3.5 text-base h-12",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap capitalize rounded-md text-sm font-medium tracking-wide ring-offset-background transition-transform transition-duration-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary dark:bg-primary text-white hover:bg-primary/90",
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
          "border border-border bg-background shadow-sm hover:bg-accent dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:hover:text-white",
        ghost:
          "bg-slate-100/20 hover:bg-slate-100/80 backdrop-blur-md hover:text-accent-foreground dark:bg-accent dark:text-white dark:hover:bg-accent/80 dark:hover:text-white",
        success:
          "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-700",
        slate:
          "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-950 dark:hover:text-slate-100",
        link: "text-primary underline-offset-4 hover:underline",
        dark: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
        light:
          "bg-white shadow text-gray-700 hover:text-gray-700 border border-border",
        glass:
          "bg-white/90 dark:bg-white/5 backdrop-blur-xl border-slate-600/10 dark:border-border/70",
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
        raw: "",
      },
      size: {
        default: "h-10 px-4 px-5 py-2.5 [&>svg]:w-5 [&>svg]:h-5",
        sm: "h-8 rounded-md px-3 py-2 text-xs [&>svg]:w-4 [&>svg]:h-4",
        lg: "px-5 py-3 text-base h-12 [&>svg]:w-6 [&>svg]:h-6",
        xl: "px-6 py-3.5 text-base [&>svg]:w-8 [&>svg]:h-8",
        icon: "h-10 w-10 p-3 [&>svg]:w-5 [&>svg]:h-5",
        icon_sm: "h-8 w-8 p-2 [&>svg]:w-4 [&>svg]:h-4",
        icon_lg: "h-12 w-12 p-3.5 [&>svg]:w-6 [&>svg]:h-6",
        icon_xl: "h-14 w-14 p-4 [&>svg]:w-8 [&>svg]:h-8",
      },
      effect: {
        expandIcon: "group gap-0 relative",
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
      width: {
        default: "w-auto",
        full: "w-full",
        xs: "w-full max-w-xs mx-auto",
        sm: "w-full max-w-sm mx-auto",
        md: "w-full max-w-md mx-auto",
        lg: "w-full max-w-lg mx-auto",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
      transition: {
        none: "",
        damped:
          "transition-all hover:scale-105 active:duration-75 active:scale-95",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      transition: "none",
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
