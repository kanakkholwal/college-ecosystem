import { customAlphabet } from "nanoid";
import { z } from "zod";

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
export function validatePassword(password: string) {
  const minLength = 8;
  const minUppercase = 1;
  const minLowercase = 1;
  const minNumbers = 1;
  const minSpecialChars = 1;
  const specialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;

  const uppercaseRegex = /[A-Z]/g;
  const lowercaseRegex = /[a-z]/g;
  const numbersRegex = /[0-9]/g;
  const passwordSchema = z
    .string()
    .min(minLength)
    .refine(
      (password) =>
        (password.match(uppercaseRegex) || []).length >= minUppercase,
      {
        message: `Password must contain at least ${minUppercase} uppercase letter`,
      }
    )
    .refine(
      (password) =>
        (password.match(lowercaseRegex) || []).length >= minLowercase,
      {
        message: `Password must contain at least ${minLowercase} lowercase letter`,
      }
    )
    .refine(
      (password) => (password.match(numbersRegex) || []).length >= minNumbers,
      {
        message: `Password must contain at least ${minNumbers} number`,
      }
    )
    .refine(
      (password) =>
        specialChars.test(password) &&
        (password.match(specialChars) || []).length >= minSpecialChars,
      {
        message: `Password must contain at least ${minSpecialChars} special character`,
      }
    );
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.errors[0].message,
    };
  }

  return {
    valid: true,
    message: "Password is strong",
  };
}


export type RoutePattern = string | RegExp;

export const toRegex = (route: RoutePattern): RegExp => {
  if (route instanceof RegExp) return route;
  if (route === "/") return /^\/?$/; // Special case for root

  const parts = route
    .split("/")
    .filter(part => part !== ""); // Remove empty parts

  if (parts.length === 0) return /^\/?$/; // Handle cases like empty string

  const regexStr = parts
    .map(part => {
      if (part === "*") return ".*";
      if (part.startsWith(":")) return "[a-z0-9-_]+";
      return part.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
    })
    .join("\\/");

  return new RegExp(`^\\/${regexStr}\\/?$`, "i");
};