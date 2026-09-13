import { type NextRequest, NextResponse } from "next/server";
import { authorizeHostelManager } from "~/lib/hostel-access";
import { AllotmentSlotModel } from "~/models/allotment";
import { HostelStudentModel } from "~/models/hostel_n_outpass";

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

export async function GET(request: NextRequest) {
  const hostelId = request.nextUrl.searchParams.get("hostelId");
  if (!hostelId) {
    return NextResponse.json(
      { message: "No hostel id provided" },
      { status: 400 }
    );
  }

  const access = await authorizeHostelManager(hostelId, "id");
  if (!access.ok) {
    return NextResponse.json(
      { message: access.error },
      { status: access.status }
    );
  }

  try {
    const slots = await AllotmentSlotModel.find({
      hostelId: access.hostel._id,
    })
      .select("startingTime endingTime allotedFor")
      .sort({ startingTime: 1 })
      .lean<{ startingTime: Date; endingTime: Date; allotedFor: string[] }[]>();

    const students = await HostelStudentModel.find({
      email: { $in: slots.flatMap((s) => s.allotedFor) },
    })
      .select("email name rollNumber")
      .lean<{ email: string; name: string; rollNumber: string }[]>();
    const byEmail = new Map(students.map((s) => [s.email, s]));

    const data = slots.map((slot, index) => {
      const people = slot.allotedFor.flatMap((email) => {
        const student = byEmail.get(email);
        return student ? [student] : [];
      });
      return {
        slotNumber: index + 1,
        slotTiming: `${timeFormat.format(slot.startingTime)} to ${timeFormat.format(slot.endingTime)}`,
        slotRollNumbers: people.map((p) => p.rollNumber),
        slotNames: people.map((p) => p.name),
      };
    });

    return NextResponse.json(
      { message: "Slots fetched", hostel: access.hostel.name, data },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("allotment-slot failed:", error);
    return NextResponse.json(
      { message: "Failed to load slots" },
      { status: 500 }
    );
  }
}
