"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  Unlock, User, Users
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner, or use react-hot-toast

// Actions
import { addRoomMembers, joinRoom } from "~/actions/hostel.allotment-process";

// UI Config
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import type { HostelRoomJson } from "~/models/allotment";
import { orgConfig } from "~/project.config";

// --- Header Component ---
export function AllotmentHeader({ status, joinedRoom }: { status: string, joinedRoom?: string }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Room Selection</h1>
        <p className="text-muted-foreground mt-1">
          Select your preferred room. Coordinate with your squad for group allocation.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {joinedRoom ? (
          <Badge variant="default" className="px-3 py-1 bg-muted text-green-700 border-green-200">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Allocated: {joinedRoom}
          </Badge>
        ) : (
          <Badge variant="default" className={cn(
            "px-3 py-1 capitalize whitespace-nowrap",
            status === "open" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-muted"
          )}>
            Status: {status}
          </Badge>
        )}
      </div>
    </div>
  );
}

// --- Grid Component ---
export function RoomGrid({ rooms, hostId, userRoomId }: { rooms: HostelRoomJson[], hostId: string, userRoomId?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {rooms.map((room) => (
        <RoomCard 
          key={room._id} 
          room={room} 
          hostId={hostId} 
          isUserRoom={userRoomId === room._id}
        />
      ))}
    </div>
  );
}

// --- Card Component (The "Stripe" Look) ---
function RoomCard({ room, hostId, isUserRoom }: { room: HostelRoomJson, hostId: string, isUserRoom: boolean }) {
  const isFull = room.occupied_seats >= room.capacity;
  const isLocked = room.isLocked;
  const percentage = (room.occupied_seats / room.capacity) * 100;

  // State Logic
  let statusColor = "bg-green-500";
  let borderColor = "hover:border-green-300";
  
  if (isLocked) {
    statusColor = "bg-gray-400";
    borderColor = "border-gray-100 opacity-80";
  } else if (isUserRoom) {
    statusColor = "bg-blue-600";
    borderColor = "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10";
  } else if (isFull) {
    statusColor = "bg-amber-500";
    borderColor = "hover:border-amber-300";
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "border border-border/60 shadow-sm hover:shadow-md",
      borderColor
    )}>
      {/* Top Highlight Bar */}
      <div className={cn("absolute top-0 left-0 w-full h-1", statusColor)} />

      <div className="p-5 flex flex-col h-full justify-between gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Room
            </span>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {room.roomNumber}
            </h3>
          </div>
          {isLocked ? (
            <Lock className="text-muted-foreground w-5 h-5" />
          ) : isUserRoom ? (
            <CheckCircle2 className="text-blue-600 w-5 h-5" />
          ) : isFull ? (
            <AlertCircle className="text-amber-500 w-5 h-5" />
          ) : (
            <Unlock className="text-green-500 w-5 h-5" />
          )}
        </div>

        {/* Occupancy Visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Occupancy</span>
            <span className={cn("font-medium", isFull ? "text-amber-600" : "text-foreground")}>
              {room.occupied_seats} / {room.capacity}
            </span>
          </div>
          <Progress value={percentage} className="h-2" indicatorClassName={statusColor} />
          
          {/* Avatar Stack Visual */}
          <div className="flex items-center gap-1 pt-1 h-6">
            {Array.from({ length: room.capacity }).map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i < room.occupied_seats ? statusColor : "bg-gray-100"
                )}
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <RoomDetailsDialog room={room} hostId={hostId} isLocked={isLocked} isFull={isFull} isUserRoom={isUserRoom} />
      </div>
    </Card>
  );
}

// --- Details Dialog (The Interaction) ---
// Note: Moved fetch logic inside for cleaner separation

async function fetchRoomDetails(roomId: string) {
  const res = await fetch(`/api/hostel/room-members?roomId=${roomId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load details");
  return res.json();
}

function RoomDetailsDialog({ room, hostId, isLocked, isFull, isUserRoom }: any) {
  const { data: roomDetails, isLoading } = useQuery({
    queryKey: ["room", room._id],
    queryFn: () => fetchRoomDetails(room._id),
    enabled: true, // You might want to toggle this on click if list is huge
  });

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  // Derive Host Logic
  const isMeHost = roomDetails?.hostStudent?.email === roomDetails?.members?.find((m: any) => m.email.includes(hostId))?.email 
                   || room.hostStudent === hostId; // Simplified check
  
  // Handlers
  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await joinRoom(room._id, hostId);
      if(res.error) toast.error(res.message);
      else toast.success(res.message);
    } catch(e) { toast.error("Failed to join"); }
    setLoading(false);
  };

  const handleAddMember = async () => {
    if(!inputVal) return;
    setLoading(true);
    const rolls = inputVal.split(',').map(s => s.trim()).filter(Boolean);
    const emails = rolls.map(r => `${r}${orgConfig.mailSuffix}`); // Ensure suffix logic matches your org
    
    try {
      const res = await addRoomMembers(room._id, hostId, emails);
      if(res.error) toast.error(res.message);
      else {
        toast.success("Members added");
        setInputVal("");
      }
    } catch(e) { toast.error("Failed to add members"); }
    setLoading(false);
  };

  return (
    <ResponsiveDialog
      btnProps={{
        variant: isUserRoom ? "default" : "outline",
        className: "w-full mt-2",
        disabled: isLocked,
        children: isUserRoom ? "Manage Room" : isLocked ? "Locked" : "View & Join",
      }}
      title={`Room ${room.roomNumber}`}
      description={isLocked ? "This room is currently locked by administration." : "Manage members and occupancy."}
    >
      <div className="space-y-6 py-4">
        
        {/* Host Section */}
        {roomDetails?.hostStudent && (
          <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Room Host</p>
              <p className="text-sm font-semibold">{roomDetails.hostStudent.name}</p>
              <p className="text-xs text-muted-foreground">{roomDetails.hostStudent.rollNumber}</p>
            </div>
          </div>
        )}

        {/* Member List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" /> Roommates
            </h4>
            <span className="text-xs text-muted-foreground">{room.occupied_seats}/{room.capacity}</span>
          </div>
          
          <div className="space-y-2">
            {isLoading ? (
              <div className="h-20 bg-muted animate-pulse rounded-md" />
            ) : roomDetails?.members?.length > 0 ? (
              roomDetails.members.map((m: any) => (
                <div key={m.email} className="flex items-center justify-between p-2 border rounded-md bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.rollNumber}</p>
                    </div>
                  </div>
                  {/* Optional: Add Remove Button here if (isMeHost) */}
                </div>
              ))
            ) : (
               <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-md">
                 No members yet. Be the first to join!
               </div>
            )}
          </div>
        </div>

        {/* Actions Area */}
        {!isLocked && (
          <div className="pt-2 border-t">
            {isMeHost ? (
              <div className="space-y-3">
                 <p className="text-xs font-medium text-muted-foreground uppercase">Invite Roommates</p>
                 <div className="flex gap-2">
                   <Input 
                     placeholder="Enter Roll Numbers (comma separated)" 
                     value={inputVal}
                     onChange={(e) => setInputVal(e.target.value)}
                     className="flex-1"
                   />
                   <Button onClick={handleAddMember} disabled={loading || !inputVal} size="icon">
                     <Plus className="w-4 h-4" />
                   </Button>
                 </div>
                 <p className="text-[10px] text-muted-foreground">
                   * Adding members will auto-reserve them into this room.
                 </p>
              </div>
            ) : (
              !isFull && !isUserRoom && (
                <Button onClick={handleJoin} disabled={loading} className="w-full">
                  {loading ? "Joining..." : "Join Room as Host"}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}