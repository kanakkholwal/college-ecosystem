import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Without these, tailwind-merge reads `text-body` as a colour and drops it next to `text-foreground`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "caption",
            "body",
            "body-lg",
            "body-xl",
            "subheading",
            "heading-sm",
            "heading",
            "heading-lg",
            "display",
            "display-xl",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
