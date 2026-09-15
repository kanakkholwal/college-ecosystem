"use server";

import { revalidatePath } from "next/cache";
import type z from "zod";
import { createOutPass } from "~/actions/hostel.outpass";
import type { requestOutPassSchema } from "~/constants/hostel.outpass";

export type OutpassRequestResult = { ok: true } | { ok: false; error: string };

/** `createOutPass` plus a revalidate of the student's outpass pages. */
export async function requestOutpass(
  data: z.infer<typeof requestOutPassSchema>
): Promise<OutpassRequestResult> {
  const res = await createOutPass(data);
  if (!res.ok) return { ok: false, error: res.error };
  revalidatePath("/[moderator]/outpass", "layout");
  return { ok: true };
}
