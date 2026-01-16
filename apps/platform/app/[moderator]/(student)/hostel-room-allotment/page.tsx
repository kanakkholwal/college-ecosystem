import {
  getAllotmentProcess,
  getHostRoom,
  getHostelRooms,
  getUpcomingSlots,
} from "~/actions/hostel.allotment-process";
import { getHostelForStudent } from "~/actions/hostel.core";

// UI Components
import EmptyArea from "@/components/common/empty-area";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { SkeletonCardArea } from "@/components/utils/skeleton-cards";
import { AllotmentHeader, RoomGrid } from "./client"; // We will create these

export default async function HostelRoomAllotmentPage() {
  // 1. Fetch Core Data
  const hostelResponse = await getHostelForStudent();

  if (!hostelResponse.success || !hostelResponse.hosteler || !hostelResponse.hostel) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <EmptyArea
          title={hostelResponse.message || "No Hostel Assigned"}
          description="Please contact the administration to resolve your hostel allocation."
        />
      </div>
    );
  }

  const { hostel, hosteler } = hostelResponse;

  // 2. Fetch Process Status & User's Current Room
  const [allotmentProcess, userRoomData] = await Promise.all([
    getAllotmentProcess(hosteler._id),
    getHostRoom(hosteler._id as string),
  ]);

  const hostJoinedRoom = userRoomData?.data?.room;

  // 3. Conditional Data Fetching (Only if open)
  let rooms = [];
  let slots = [];
  
  if (allotmentProcess?.status === "open") {
    const [roomsRes, slotsRes] = await Promise.all([
      getHostelRooms(hostel._id),
      getUpcomingSlots(hostel._id)
    ]);
    rooms = roomsRes.data || [];
    slots = slotsRes.data || [];
  }

  return (
    <div className="space-y-8 my-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <AllotmentHeader 
        status={allotmentProcess?.status} 
        joinedRoom={hostJoinedRoom?.roomNumber}
      />

      <ErrorBoundaryWithSuspense loadingFallback={<SkeletonCardArea count={8} />}>
        {/* State Handling */}
        {allotmentProcess?.status !== "open" ? (
          <StatusMessage status={allotmentProcess?.status} />
        ) : (
          <RoomGrid 
            rooms={rooms} 
            hostId={hosteler._id as string} 
            userRoomId={hostJoinedRoom?._id}
          />
        )}
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

function StatusMessage({ status }: { status: string }) {
  const messages = {
    closed: { title: "Allotment Closed", desc: "The allocation window has ended." },
    paused: { title: "Process Paused", desc: "Admin has temporarily paused allocation." },
    waiting: { title: "Starting Soon", desc: "The allocation window has not opened yet." },
    completed: { title: "Allotment Done", desc: "The process is complete for this semester." },
  };

  const msg = messages[status as keyof typeof messages] || messages.waiting;

  return (
    <div className="p-12">
      <EmptyArea title={msg.title} description={msg.desc} />
    </div>
  );
}