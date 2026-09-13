"use server";

import { revalidatePath } from "next/cache";
import type z from "zod";
import { createOutPass } from "~/actions/hostel.outpass";
import type { requestOutPassSchema } from "~/constants/hostel.outpass";

export type OutpassRequestResult = { ok: true } | { ok: false; error: string };

/**
 * Same checks as `createOutPass`, but returns the refusal as data: a rejected
 * server action reaches the browser with its message stripped in production.
 */
export async function requestOutpass(
  data: z.infer<typeof requestOutPassSchema>
): Promise<OutpassRequestResult> {
  try {
    await createOutPass(data);
    revalidatePath("/[moderator]/outpass", "layout");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        typeof err === "string" ? err : "Couldn't send the request. Try again.",
    };
  }
}
