"use server";

import { Client } from "@notionhq/client";
import { applicationSchema } from "./validation";

type SaveApplicationResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: string[] };

// Legacy: Builder Club intake is inactive; kept for reuse and disabled until NOTION_* env is set.
export async function saveApplication(
  payload: unknown
): Promise<SaveApplicationResult> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    return {
      success: false,
      message: "Applications are closed right now. Check back later.",
    };
  }

  const parsed = applicationSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: "Some fields are invalid",
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }
  const validated = parsed.data;

  try {
    const notion = new Client({ auth: token });
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: validated.name } }] },
        Email: { email: validated.collegeId },
        Year: { select: { name: validated.collegeYear } },
        Mobile: {
          phone_number: validated.mobile || "",
        },
        "Work Links": {
          rich_text: validated.workLinks.map((link) => ({
            text: { content: link.url, link: { url: link.url } },
          })),
        },
        "Best Project": {
          rich_text: [{ text: { content: validated.bestProject ?? "" } }],
        },
        "Best Hack": {
          rich_text: [{ text: { content: validated.bestHack ?? "" } }],
        },
        Status: { select: { name: "Applied" } },
      },
    });
    return { success: true, message: "Application submitted" };
  } catch (error) {
    console.error("[builder-club] saveApplication failed", error);
    return {
      success: false,
      message: "We couldn't submit your application. Please try again.",
    };
  }
}
