import EmptyArea from "@/components/common/empty-area"; // Keep your existing
import {
  AlertCircle
} from "lucide-react";
import { getAllotmentProcess, getHostelRooms } from "~/actions/hostel.allotment-process";
import { getHostel } from "~/actions/hostel.core";
import {
  AdminHeader,
  ProcessControlCard,
  RoomsTableWrapper,
  SlotManagementCard
} from "./client";

export default async function HostelRoomAllotmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const hostelRes = await getHostel(slug);

  if (!hostelRes.success || !hostelRes.hostel) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <EmptyArea
          title="Hostel Not Found"
          description={`Could not locate hostel data for slug: ${slug}`}
        />
      </div>
    );
  }

  const { hostel } = hostelRes;

  // Parallel Fetching for Admin Performance
  const [allotmentProcess, roomsRes] = await Promise.all([
    getAllotmentProcess(hostel._id),
    getHostelRooms(hostel._id)
  ]);

  const rooms = roomsRes.data || [];
  
  // Calculate Quick Stats for Dashboard
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((acc: number, r: any) => acc + r.capacity, 0);
  const totalOccupied = rooms.reduce((acc: number, r: any) => acc + r.occupied_seats, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Dashboard Header */}
      <AdminHeader 
        hostelName={hostel.name} 
        gender={hostel.gender}
        stats={{ totalRooms, totalCapacity, totalOccupied, occupancyRate }}
      />

      {/* 2. Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Control */}
        <ProcessControlCard 
          hostelId={hostel._id} 
          currentStatus={allotmentProcess?.status || "waiting"} 
        />
        
        {/* Slot Operations */}
        <SlotManagementCard hostelId={hostel._id} />

        {/* Quick Tips / Info (Optional 3rd Column) */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              System Status
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              System is operating normally. Ensure slots are distributed before opening the process.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between text-sm">
             <span className="text-muted-foreground">Last Updated</span>
             <span className="font-mono">Just now</span>
          </div>
        </div>
      </div>

      {/* 3. Rooms Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
             <h2 className="text-lg font-semibold tracking-tight">Room Inventory</h2>
             <p className="text-sm text-muted-foreground">Manage locks and view detailed occupancy.</p>
          </div>
        </div>
        <RoomsTableWrapper rooms={rooms} />
      </div>

    </div>
  );
}