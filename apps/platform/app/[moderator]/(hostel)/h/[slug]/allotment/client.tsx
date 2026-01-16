"use client";

import {
    CheckCircle2,
    Clock,
    Download,
    Lock,
    MoreHorizontal,
    PauseCircle,
    PlayCircle,
    RefreshCw,
    Search,
    StopCircle,
    Unlock
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Or react-hot-toast

// Actions
import {
    distributeSlots,
    lockToggleRoom,
    updateAllotmentProcess,
} from "~/actions/hostel.allotment-process";
import type { HostelRoomJson } from "~/models/allotment";

// Shadcn UI (Assumed available based on your codebase)
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// --- 1. Header Component ---
export function AdminHeader({ hostelName, gender, stats }: any) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{hostelName}</h1>
          <Badge variant={gender === "male" ? "default" : "secondary"} className="capitalize px-3">
            {gender}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Hostel Administration & Allotment Dashboard
        </p>
      </div>
      
      {/* Quick Stats Pill */}
      <div className="flex gap-6 bg-secondary/30 px-6 py-3 rounded-lg border">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Occupancy</p>
          <p className="text-2xl font-mono font-bold">{stats.occupancyRate}%</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Vacant Beds</p>
          <p className="text-2xl font-mono font-bold text-green-600">
            {stats.totalCapacity - stats.totalOccupied}
          </p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Rooms</p>
          <p className="text-2xl font-mono font-bold">{stats.totalRooms}</p>
        </div>
      </div>
    </div>
  );
}

// --- 2. Process Control Card ---
const statusConfig = {
  open: { label: "Live / Open", color: "text-green-600", icon: PlayCircle, bg: "bg-green-100" },
  closed: { label: "Closed", color: "text-red-600", icon: StopCircle, bg: "bg-red-100" },
  paused: { label: "Paused", color: "text-amber-600", icon: PauseCircle, bg: "bg-amber-100" },
  waiting: { label: "Waiting", color: "text-gray-600", icon: Clock, bg: "bg-gray-100" },
  completed: { label: "Completed", color: "text-blue-600", icon: CheckCircle2, bg: "bg-blue-100" },
};

export function ProcessControlCard({ hostelId, currentStatus }: { hostelId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const statusInfo = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.waiting;
  const StatusIcon = statusInfo.icon;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateAllotmentProcess(hostelId, { status: newStatus as any, hostelId });
      toast.success(`Process marked as ${newStatus}`);
    } catch(e) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-muted-foreground">Process Status</CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight capitalize">{currentStatus}</span>
          <div className={cn("p-2 rounded-full", statusInfo.bg)}>
            <StatusIcon className={cn("w-5 h-5", statusInfo.color)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between" disabled={loading}>
              {loading ? "Updating..." : "Change Status"}
              <MoreHorizontal className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Select Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.keys(statusConfig).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={currentStatus === key}
                onCheckedChange={() => handleStatusChange(key)}
                className="capitalize"
              >
                {key}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

// --- 3. Slot Management Card ---
export function SlotManagementCard({ hostelId }: { hostelId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDistribute = async () => {
    if(!confirm("This will regenerate all time slots based on current ranking. Continue?")) return;
    setLoading(true);
    try {
      await distributeSlots(hostelId);
      toast.success("Slots distributed successfully");
    } catch(e) { toast.error("Distribution failed"); }
    setLoading(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-muted-foreground">Slot Management</CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight">Configuration</span>
          <div className="p-2 rounded-full bg-primary/10">
            <Clock className="w-5 h-5 text-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button 
          className="flex-1" 
          variant="default" 
          onClick={handleDistribute} 
          disabled={loading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Generate Slots
        </Button>
        <Button 
          variant="default_soft" 
          size="icon" 
          title="Download Schedule"
          onClick={() => toast.success("Download started...")}
        >
          <Download className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// --- 4. Rooms Table (Redesigned) ---
export function RoomsTableWrapper({ rooms }: { rooms: HostelRoomJson[] }) {
  const [filter, setFilter] = useState("");
  
  const filteredRooms = rooms.filter(r => 
    r.roomNumber.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="shadow-sm">
      <div className="p-4 border-b flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search room number..."
            className="pl-9 bg-muted/50 border-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredRooms.length} rooms
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[120px]">Room No</TableHead>
            <TableHead className="w-[200px]">Occupancy</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Access</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRooms.slice(0, 50).map((room) => (
             <RoomRow key={room._id} room={room} />
          ))}
          {filteredRooms.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No rooms found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function RoomRow({ room }: { room: HostelRoomJson }) {
  const [loading, setLoading] = useState(false);
  const occupancyPercent = (room.occupied_seats / room.capacity) * 100;
  
  // Status Logic
  const isFull = room.occupied_seats >= room.capacity;
  const isEmpty = room.occupied_seats === 0;

  const toggleLock = async () => {
    setLoading(true);
    try {
      await lockToggleRoom(room._id);
      toast.success(`Room ${room.roomNumber} ${room.isLocked ? "Unlocked" : "Locked"}`);
    } catch(e) { toast.error("Action failed"); }
    setLoading(false);
  };

  return (
    <TableRow className="group">
      <TableCell className="font-medium font-mono">
        {room.roomNumber}
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{room.occupied_seats} / {room.capacity}</span>
            <span>{Math.round(occupancyPercent)}%</span>
          </div>
          <Progress 
            value={occupancyPercent} 
            className="h-2"
            // Dynamic coloring based on fullness
            indicatorClassName={cn(
              isFull ? "bg-amber-500" : "bg-green-500",
              room.isLocked && "bg-gray-300"
            )}
          />
        </div>
      </TableCell>

      <TableCell>
        {isFull ? (
          <Badge variant="warning_soft" className="text-xs">Full</Badge>
        ) : isEmpty ? (
          <Badge variant="success_soft" className="text-xs">Vacant</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Partial</Badge>
        )}
      </TableCell>

      <TableCell>
        {room.isLocked ? (
          <div className="flex items-center text-red-600 text-xs font-medium">
            <Lock className="w-3 h-3 mr-1" /> Locked
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground text-xs">
            <Unlock className="w-3 h-3 mr-1" /> Open
          </div>
        )}
      </TableCell>

      <TableCell className="text-right">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={toggleLock}
          disabled={loading}
        >
          <span className="sr-only">Toggle Lock</span>
          {room.isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
          ) : (
            <Unlock className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}