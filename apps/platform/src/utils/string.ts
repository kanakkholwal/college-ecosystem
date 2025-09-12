import { customAlphabet } from "nanoid";
import { passwordSchema } from "~/constants";
import { appConfig } from "~/project.config";

export function generateSlug(length = 8): string {
  return customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    length
  )();
}

export function changeCase(
  str: string,
  type: "upper" | "lower" | "title" | "sentence" | "camel_to_title"
) {
  switch (type) {
    case "upper":
      return str.toUpperCase();
    case "lower":
      return str.toLowerCase();
    case "title":
      return str
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    case "sentence":
      return str.charAt(0).toUpperCase() + str.slice(1);
    case "camel_to_title": {
      // Convert camelCase to Title Case
      // Example: "helloWorld" -> "Hello World"
      const result = str.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    }

    default:
      return str;
  }
}
const appUrl = new URL(appConfig.url);

type UTMSource = string; // usually hostname or campaign source
type UTMMedium = "app" | "email" | "social" | "cpc" | "affiliate";
type UTMParams = {
  utm_medium?: UTMMedium;
  utm_campaign?: string;
  utm_source?: UTMSource;
  utm_path?: string;
};

export function marketwiseLink(link: string, options: UTMParams = {}) {
  const url = new URL(link);

  const {
    utm_medium = "app",
    utm_campaign = "/resources",
    utm_source = appUrl.hostname,
    utm_path = "/resources",
  } = options;

  const campaignPath = new URL(utm_path, appUrl).toString();

  url.searchParams.set("utm_source", utm_source);
  url.searchParams.set("utm_medium", utm_medium);
  url.searchParams.set("utm_campaign", utm_campaign || campaignPath);
  url.searchParams.set("ref", campaignPath);

  return url.toString();
}

export function validatePassword(password: string) {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues[0].message,
    };
  }

  return {
    valid: true,
    message: "Password is strong",
  };
}
export function calculateReadingTime(
  text: string,
  wordsPerMinute = 200
): string {
  if (!text) return "0 min read";

  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return `${minutes} min read`;
}

export type RoutePattern = string | RegExp;

export const toRegex = (route: RoutePattern): RegExp => {
  if (route instanceof RegExp) return route;
  if (route === "/") return /^\/?$/; // Special case for root

  const parts = route.split("/").filter((part) => part !== ""); // Remove empty parts

  if (parts.length === 0) return /^\/?$/; // Handle cases like empty string
  // handle "!" as a negation

  const regexStr = parts
    .map((part) => {
      if (part === "*") return ".*";
      if (part.startsWith(":")) return "[a-z0-9-_]+";
      return part.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
    })
    .join("\\/");

  return new RegExp(`^\\/${regexStr}\\/?$`, "i");
};
// export const toRegex = (route: RoutePattern): RegExp => {
//   if (route instanceof RegExp) return route;

//   let negate = false;
//   let pattern = route;

//   // Handle negation prefix
//   if (typeof pattern === 'string' && pattern.startsWith("!")) {
//     negate = true;
//     pattern = pattern.substring(1);
//   }

//   // Handle empty pattern after negation
//   if (pattern === "/") return negate ? /^(?!\/?$).*$/i : /^\/?$/i;

//   const parts = pattern
//     .split("/")
//     .filter(part => part !== ""); // Remove empty parts

//   if (parts.length === 0) return negate ? /^(?!\/?$).*$/i : /^\/?$/i;

//   const regexStr = parts
//     .map(part => {
//       if (part === "*") return ".*";
//       if (part.startsWith(":")) return "[a-z0-9-_]+";
//       return part.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
//     })
//     .join("\\/");

//   const baseRegex = new RegExp(`^\\/${regexStr}\\/?$`, "i");

//   // Convert to negative match if needed
//   if (negate) {
//     const innerPattern = baseRegex.source
//       .slice(1, -1)     // Remove ^ and $
//       .replace("\\/", "/"); // Unescape slashes for clean lookahead
//     return new RegExp(`^(?!/${innerPattern}$).*$`, "i");
//   }

//   return baseRegex;
// };
