import { orgConfig } from "~/project.config";

export function academicYearLabel(now = new Date()) {
  const year = now.getFullYear();
  return `${year - 1}-${year}`;
}

export function resultMailSubject(now = new Date()) {
  return `${orgConfig.shortName} Semester Results for ${academicYearLabel(now)} Batch Now Available`;
}

const LOOSE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Splits pasted text into unique addresses; a bare username gets the college mail suffix. */
export function parseRecipients(input: string) {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const raw of input.split(/[\s,;]+/)) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;
    const email = token.includes("@") ? token : `${token}${orgConfig.mailSuffix}`;
    if (seen.has(email)) continue;
    seen.add(email);
    (LOOSE_EMAIL.test(email) ? valid : invalid).push(email);
  }
  return { valid, invalid };
}
