import { NextResponse } from "next/server";
import { FALLBACK_STATS, recordImpression } from "~/lib/third-party/github";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** One call per page view: records the impression upstream and returns the fresh total. */
export async function POST() {
  // Local and preview builds must not inflate the production counter.
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json(
      { count: FALLBACK_STATS.visitors, recorded: false },
      { headers: NO_STORE }
    );
  }
  const count = await recordImpression();
  return NextResponse.json({ count, recorded: true }, { headers: NO_STORE });
}
