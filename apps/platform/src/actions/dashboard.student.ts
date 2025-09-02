"use server";
import { Session } from "~/auth";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { HostelStudentType } from "~/models/hostel_n_outpass";
import { ResultTypeWithId } from "~/models/result";
import { getResultByRollNo } from "./common.result";
import { getHostelForStudent } from "./hostel.core";
import { getOutPassHistoryByRollNo } from "./hostel.outpass";
import { getUserPlatformActivities } from "./user.core";

interface StudentDashboardData {
  success: boolean;
  message: string;

  // Hosteler information
  hosteler:
    | (Pick<
        HostelStudentType,
        "name" | "roomNumber" | "banned" | "bannedReason" | "bannedTill"
      > & {
        hostelName: string;
      })
    | null;
  outpassCount: number;
  result: ResultTypeWithId | null;

  // platform activities
  platformActivities: Awaited<
    ReturnType<typeof getUserPlatformActivities>
  > | null;
}
export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  try {
    const hostelResponse = await getHostelForStudent();
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    const { user } = session as Session;
    const outpassHistory = await getOutPassHistoryByRollNo(user.username);
    const academicResult = await getResultByRollNo(user.username);

    const platformActivities = await getUserPlatformActivities(
      user.id,
      user.username
    );

    return {
      success: true,
      message: "Student dashboard data fetched successfully",
      hosteler:
        hostelResponse.hosteler && hostelResponse.hostel
          ? {
              name: hostelResponse.hosteler.name,
              roomNumber: hostelResponse.hosteler.roomNumber,
              banned: hostelResponse.hosteler.banned,
              bannedReason: hostelResponse.hosteler.bannedReason,
              bannedTill: hostelResponse.hosteler.bannedTill,
              hostelName: hostelResponse.hostel.name,
            }
          : null,
      outpassCount: outpassHistory.length,
      result: academicResult,
      platformActivities,
    };
  } catch (error) {
    console.error("Failed to get student dashboard data", error);
    return {
      success: false,
      message: "Failed to get student dashboard data",
      hosteler: null,
      outpassCount: 0,
      result: null,
      platformActivities: null,
    };
  }
}
