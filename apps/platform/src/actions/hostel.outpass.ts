"use server";
import { format } from "date-fns";
import type z from "zod";
import { getHostelByUser, getHostelForStudent } from "~/actions/hostel.core";
import { REASONS, requestOutPassSchema } from "~/constants/hostel.outpass";
// import { getSession } from "~/lib/auth-server";
import dbConnect from "~/lib/dbConnect";
import {
  HostelStudentModel,
  OutPassModel,
  type OutPassType,
} from "~/models/hostel_n_outpass";

/*
    OutPass Actions
*/

export async function createOutPass(
  data: z.infer<typeof requestOutPassSchema>
) {
  try {
    const validationResponse = requestOutPassSchema.safeParse(data);
    if (!validationResponse.success) {
      return Promise.reject(validationResponse.error);
    }
    // const session = await getSession()
    // if(!session){
    //   return Promise.reject("Unauthorized")
    // }
    const { success, message, hostel, hosteler } = await getHostelByUser();
    if (!success || !hosteler || !hostel) {
      return Promise.reject(message);
    }

    if (hosteler.banned) {
      return Promise.reject(
        `User is banned from accessing hostel features till ${hosteler.bannedTill ? format(new Date(hosteler.bannedTill), "dd/MM/yyyy HH:mm:ss") : "unknown"}`
      );
    }
    if (!REASONS.includes(data.reason)) {
      return Promise.reject("Invalid Reason");
    }

    // if(session.user.id !== hosteler.userId){
    //   return Promise.reject("You are not authorized to request outpass for this user")
    // }
    await dbConnect();

    if (
      data.roomNumber !== hosteler.roomNumber &&
      data.roomNumber !== "UNKNOWN"
    ) {
      await HostelStudentModel.updateOne(
        { _id: hosteler._id },
        { roomNumber: data.roomNumber }
      );
    }

    // if reason is outing or market then validity should be the end of the day of expectedInTime
    const validity = new Date();
    if (data.reason === "outing" || data.reason === "market") {
      const date = new Date(data.expectedInTime);
      validity.setFullYear(date.getFullYear());
      validity.setMonth(date.getMonth());
      validity.setDate(date.getDate());
      validity.setHours(23, 59, 59, 999);
    }
    // if reason is home or medical then validity should be +4 days from expectedInTime
    if (data.reason === "home" || data.reason === "medical") {
      const date = new Date(data.expectedInTime);
      validity.setFullYear(date.getFullYear());
      validity.setMonth(date.getMonth());
      validity.setDate(date.getDate() + 4);
      validity.setHours(23, 59, 59, 999);
    }
    // create a date of end of today directly on declaration

    const payload = {
      student: hosteler._id,
      hostel: hostel._id,
      rollNumber: hosteler.rollNumber,
      roomNumber: data.roomNumber,
      address: data.address,
      reason: data.reason,
      expectedInTime: data.expectedInTime,
      expectedOutTime: data.expectedOutTime,
      status: "pending",
      validTill: validity,
    };
    await OutPassModel.create(payload);

    return Promise.resolve("Outpass Requested Successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject(err?.toString() || "Something went wrong");
  }
}

export async function getOutPassForHosteler(): Promise<OutPassType[]> {
  try {
    const { success, message, hostel, hosteler } = await getHostelForStudent();
    if (!success || !hosteler || !hostel) {
      return Promise.reject(message);
    }
    await dbConnect();
    const outPasses = await OutPassModel.find({ student: hosteler._id })
      .populate("hostel")
      .populate("student")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return Promise.resolve(JSON.parse(JSON.stringify(outPasses)));
  } catch (err) {
    console.error(err);
    return Promise.reject(err?.toString() || "Something went wrong");
  }
}

export async function getOutPassHistoryByRollNo(
  rollNo: string
): Promise<OutPassType[]> {
  try {
    const outPasses = await OutPassModel.find({})
      .populate({
        path: "student",
        match: { rollNumber: rollNo }, // Filter `student` by rollNumber
      })
      .populate("hostel")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Filter out results where `student` was not matched
    const filteredOutPasses = outPasses.filter((outPass) => outPass.student);

    return Promise.resolve(JSON.parse(JSON.stringify(filteredOutPasses)));
  } catch (err) {
    console.error(err);
    return Promise.reject(err?.toString() || "Something went wrong");
  }
}
export async function getOutPassById(id: string): Promise<OutPassType | null> {
  try {
    const outPass = await OutPassModel.findById(id)
      .populate("hostel")
      .populate("student")
      .lean();

    return Promise.resolve(JSON.parse(JSON.stringify(outPass)));
  } catch (err) {
    console.error(err);
    return Promise.reject(err?.toString() || "Something went wrong");
  }
}

export async function allowEntryExit(
  id: string,
  action_type: "entry" | "exit"
): Promise<string> {
  try {
    await dbConnect();

    const outPass = await OutPassModel.findById(id)
      .populate("hostel")
      .populate("student")
      .exec();

    // 1. Basic Validation
    if (!outPass) {
      return Promise.reject("Outpass not found");
    }

    // 2. Check for Invalid States (Rejected/Pending)
    if (outPass.status === "rejected") {
      return Promise.reject("This Outpass was REJECTED by the warden.");
    }
    if (outPass.status === "pending") {
      return Promise.reject("This Outpass is still PENDING approval.");
    }
    if (outPass.status === "processed") {
      return Promise.reject("This Outpass has already been used and processed.");
    }

    // 3. Handle EXIT Logic
    if (action_type === "exit") {
      // Check if already exited
      if (outPass.actualOutTime) {
        return Promise.reject("Student has already exited campus.");
      }

      // Update timestamps and status
      outPass.actualOutTime = new Date();
      outPass.status = "in_use"; // Mark as "Currently Outside"

      await outPass.save();
      return Promise.resolve("Exit allowed successfully.");
    }

    // 4. Handle ENTRY Logic
    if (action_type === "entry") {
      // Security Check: Cannot enter if never exited
      if (!outPass.actualOutTime) {
        return Promise.reject("Cannot verify Entry: Student has not scanned Exit yet.");
      }

      // Check if already entered
      if (outPass.actualInTime) {
        return Promise.reject("Student has already entered campus.");
      }

      // Update timestamps and status
      outPass.actualInTime = new Date();
      outPass.status = "processed"; // Mark as "Completed/History"

      await outPass.save();
      return Promise.resolve("Entry allowed successfully.");
    }

    return Promise.reject("Invalid action type provided.");

  } catch (err: any) {
    console.error("Entry/Exit Error:", err);
    return Promise.reject(err?.message || "Internal Server Error");
  }
}

export async function approveRejectOutPass(
  id: string,
  action: "approve" | "reject"
): Promise<string> {
  try {
    await dbConnect();
    const outPass = await OutPassModel.findById(id)
      .populate("hostel")
      .populate("student")
      .exec();
    if (!outPass) {
      return Promise.reject("Outpass not found");
    }
    if (outPass.status !== "pending") {
      return Promise.reject("Outpass is not pending");
    }
    if (action === "approve") {
      outPass.status = "approved";
      await outPass.save();
      return Promise.resolve("Outpass approved successfully");
    }
    if (action === "reject") {
      outPass.status = "rejected";
      await outPass.save();
      return Promise.resolve("Outpass rejected successfully");
    }
    return Promise.reject("Invalid action type");
  } catch (err) {
    console.error(err);
    return Promise.reject(err?.toString() || "Something went wrong");
  }
}

export async function getOutPassHistoryForHostel({
  query,
  offset,
  limit = 100,
  sortBy = "desc",
}: {
  query?: string;
  offset?: number;
  limit?: number;
  sortBy?: "asc" | "desc";
}): Promise<{
  data: OutPassType[];
  error: string | null;
}> {
  // This function is used to get the outpass history for the hostel
  try {
    const { success, message, hostel } = await getHostelByUser();
    if (!success || !hostel) {
      return {
        data: [],
        error: message,
      };
    }
    await dbConnect();
    const outPasses = await OutPassModel.find({
      hostel: hostel._id,
      ...(query && {
        $or: [
          { "student.name": { $regex: query, $options: "i" } },
          { "student.rollNumber": { $regex: query, $options: "i" } },
        ],
      }),
    })
      .populate("hostel")
      .populate("student")
      .sort({
        createdAt: sortBy === "asc" ? 1 : -1,
      })
      .limit(offset ? offset + limit : limit)
      .lean();
    return Promise.resolve({
      data: JSON.parse(JSON.stringify(outPasses)),
      error: null,
    });
  } catch (err) {
    console.error(err);
    return Promise.reject({
      data: [],
      error: err?.toString() || "Something went wrong",
    });
  }
}

export async function getOutPassByIdForHosteler(id: string): Promise<{
  data: OutPassType[] | null;
  error: string | null;
}> {
  try {
    const { success, message, hostel, hosteler } = await getHostelByUser();
    if (!success || !hosteler || !hostel) {
      return Promise.reject({
        data: null,
        error: message,
      });
    }

    await dbConnect();

    const outPass = await OutPassModel.find({ student: id })
      .populate("hostel")
      .populate("student")
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: JSON.parse(JSON.stringify(outPass)),
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      data: null,
      error: err?.toString() || "Something went wrong",
    };
  }
}
