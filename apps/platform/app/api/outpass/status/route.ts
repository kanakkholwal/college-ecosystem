import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import {
    getOutPassById,
    getOutPassHistoryByRollNo,
} from "~/actions/hostel.outpass";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { ROLES_ENUMS } from "~/constants";
import { isValidRollNumber } from "~/constants/core.departments";
import dbConnect from "~/lib/dbConnect";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const identifier = searchParams.get("identifier");
    if (!identifier) {
      return new NextResponse("No identifier provided", { status: 400 });
    }
    const isValidRollNo = isValidRollNumber(identifier);
    const isValidMongoId = Types.ObjectId.isValid(identifier);
    if (!isValidRollNo && !isValidMongoId) {
      return new NextResponse("Invalid identifier provided", { status: 400 });
    }
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (
      session.user.role !== ROLES_ENUMS.ADMIN ||
      !session.user.other_roles.includes(ROLES_ENUMS.GUARD)
    ) {
      return new NextResponse("You are not authorized to access this feature", {
        status: 403,
      });
    }
    await dbConnect();
    if (isValidRollNo) {
      // Fetch outpass history by roll number
      const outpassHistory = await getOutPassHistoryByRollNo(identifier);
      return NextResponse.json(
        {
          identifier: "rollNo",
          history: outpassHistory,
        },
        { status: 200 }
      );
    }
    // Fetch outpass by id
    if (isValidMongoId) {
      const outpass = await getOutPassById(identifier);
      return NextResponse.json(
        {
          identifier: "id",
          outpass,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        identifier: "unknown",
        message: "Invalid identifier provided or no data found",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        identifier: "unknown",
        message: "An error occurred while fetching data",
        error: error?.toString() || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
