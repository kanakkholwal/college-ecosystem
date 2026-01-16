import { format } from "date-fns";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
// import * as XLSX from "xlsx";
import dbConnect from "~/lib/dbConnect";
import { AllotmentSlotModel } from "~/models/allotment";
import { HostelModel, HostelStudentModel } from "~/models/hostel_n_outpass";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get("hostelId");

    await dbConnect();

    if (!hostelId) {
      return NextResponse.json(
        { message: "No hostel id provided" },
        { status: 400 }
      );
    }

    // Get all upcoming slots for the hostel
    const upcomingSlots = await AllotmentSlotModel.find({
      hostelId: new mongoose.Types.ObjectId(hostelId),
    }).sort({ startingTime: 1 });

    // Prepare data for Excel
    const data = [["Slot Number", "Slot Timing", "Roll Number", "Name"]];

    // Fetch student details for each slot
    const allSlots = await Promise.all(
      upcomingSlots.map(async (slot, index) => {
        const slotNumber = index + 1;

        // Format the time range
        const startTime = format(slot.startingTime, "hh:mm a");
        const endTime = format(slot.endingTime, "hh:mm a");
        const slotTiming = `${startTime} - ${endTime}`;

        const slotRelatedStudents = await HostelStudentModel.find({
          email: { $in: slot.allotedFor },
        }).populate("userId", "name rollNumber");

        return {
          slotNumber,
          slotTiming,
          slotRollNumbers: slotRelatedStudents.map(
            (student) => student.rollNumber
          ), // Fix incorrect field
          slotNames: slotRelatedStudents.map((student) => student.name),
        };
      })
    );

    for (const slot of allSlots) {
      const { slotNumber, slotTiming, slotRollNumbers, slotNames } = slot;
      const rollNumbers = slotRollNumbers.join("\n");
      const names = slotNames.join("\n");
      data.push([slotNumber.toString(), slotTiming, rollNumbers, names]);
    }

    // Create workbook and worksheet
    // const workbook = XLSX.utils.book_new();
    // const worksheet = XLSX.utils.aoa_to_sheet(data);

    // // Add the worksheet to the workbook
    // XLSX.utils.book_append_sheet(workbook, worksheet, "Slot Allotments");

    // Get hostel name for the filename
    const hostel = await HostelModel.findById(hostelId);
    const hostelName = hostel ? hostel.name.replace(/\s+/g, "_") : "hostel";

    // Write workbook to buffer
    // const excelBuffer = XLSX.write(workbook, {
    //   type: "buffer",
    //   bookType: "xlsx",
    // });

    // Return the file as a download
    return NextResponse.json(
      {
        message: "Excel file generated successfully",
        data: allSlots,
        // excelBuffer, // Uncomment this line if you want to return the buffer directly
      },
      { status: 200 }
    );
    // return new NextResponse(excelBuffer, {
    //   headers: {
    //     "Content-Type":
    //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //     "Content-Disposition": `attachment; filename="${hostelName}_slot_allotments.xlsx"`,
    //   },
    // });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return NextResponse.json(
      {
        message: "Failed to generate Excel file",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
