/**
 * Expected frontmatter schema for resource MDX files
 * @param num - The number to format
 * @returns A formatted string with compact notation
 * @example formatNumber(1000) // "1K"
 * @example formatNumber(1500000) // "1.5M"
 */
export function formatNumber(num: number) {
  const formatter = new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
  });
  return formatter.format(num);
}
/**
 * Formats a number with ordinal suffix (e.g., 1st, 2nd, 3rd, etc.)
 * @param num - The number to format
 * @returns A string with the number followed by its ordinal suffix
 * @example formatNumberOrdinal(1) // "1st"
 * @example formatNumberOrdinal(2) // "2nd"

 */
export function formatNumberOrdinal(num: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}
