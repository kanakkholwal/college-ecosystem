import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import {
  getOutPassById,
  getOutPassHistoryByRollNo,
} from "~/actions/hostel.outpass";
import { isValidRollNumber } from "~/constants/core.departments";
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
  if (!isRollNo && !Types.ObjectId.isValid(identifier)) {
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

  try {
    if (isRollNo) {
      const history = await getOutPassHistoryByRollNo(identifier);
      return NextResponse.json(
        { identifier: "rollNo", history },
        { status: 200, headers: noStore }
      );
    }
    const outpass = await getOutPassById(identifier);
    return NextResponse.json(
      { identifier: "id", outpass },
      { status: 200, headers: noStore }
    );
  } catch (error) {
    console.error("outpass status lookup failed:", error);
    return NextResponse.json(
      {
        identifier: "unknown",
        message: "An error occurred while fetching data",
      },
      { status: 500 }
    );
  }
}
