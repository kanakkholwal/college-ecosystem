import { type NextRequest, NextResponse } from "next/server";
import {
  getOutPassById,
  getOutPassHistoryByRollNo,
} from "~/actions/hostel.outpass";
import { isValidRollNumber } from "~/constants/core.departments";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import { authorizeGate } from "~/lib/hostel-access";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const identifier = request.nextUrl.searchParams.get("identifier")?.trim();
  if (!identifier) {
    return NextResponse.json(
      { identifier: "unknown", message: "No identifier provided" },
      { status: 400 }
    );
  }
  const isRollNo = isValidRollNumber(identifier);
  if (!isRollNo && !isObjectIdString(identifier)) {
    return NextResponse.json(
      {
        identifier: "unknown",
        message: "Enter a roll number or scan an outpass barcode",
      },
      { status: 400 }
    );
  }

  const access = await authorizeGate();
  if (!access.ok) {
    return NextResponse.json(
      { identifier: "unknown", message: access.error },
      { status: access.status }
    );
  }

  const lookupFailed = (message: string) =>
    NextResponse.json({ identifier: "unknown", message }, { status: 500 });

  if (isRollNo) {
    const history = await getOutPassHistoryByRollNo(identifier);
    if (!history.ok) return lookupFailed(history.error);
    return NextResponse.json(
      { identifier: "rollNo", history: history.data },
      { status: 200, headers: noStore }
    );
  }
  const outpass = await getOutPassById(identifier);
  if (!outpass.ok) return lookupFailed(outpass.error);
  return NextResponse.json(
    { identifier: "id", outpass: outpass.data },
    { status: 200, headers: noStore }
  );
}
