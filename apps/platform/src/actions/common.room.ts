"use server";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { z } from "zod";
import { auth } from "~/auth";
import { roomSchema } from "~/constants/common.room";
import { db } from "~/db/connect";
import { roomUsageHistory, rooms, users } from "~/db/schema";

type RoomSelect = InferSelectModel<typeof rooms>;
type RoomInsert = InferInsertModel<typeof rooms>;
type UsageHistoryInsert = InferInsertModel<typeof roomUsageHistory>;
type RoomType = z.infer<typeof roomSchema>;

const ROOM_STATUSES = ["available", "occupied"];

// Mirrors RoomCard's toggle rule so the UI and the server agree.
async function getRoomSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  return {
    user,
    isAdmin: user?.role === "admin",
    canToggle:
      !!user &&
      (user.role === "admin" ||
        user.other_roles.includes("cr") ||
        user.other_roles.includes("faculty")),
  };
}

function revalidateRoomPages() {
  revalidatePath("/classroom-availability", "page");
  revalidatePath("/[moderator]/rooms", "page");
}

export async function getRoomsInfo(): Promise<{
  totalRooms: number;
  totalAvailableRooms: number;
  totalOccupiedRooms: number;
}> {
  const [row] = await db
    .select({
      totalRooms: sql<number>`count(*)`.mapWith(Number),
      totalAvailableRooms:
        sql<number>`count(*) filter (where ${rooms.currentStatus} = 'available')`.mapWith(
          Number
        ),
      totalOccupiedRooms:
        sql<number>`count(*) filter (where ${rooms.currentStatus} = 'occupied')`.mapWith(
          Number
        ),
    })
    .from(rooms);

  return {
    totalRooms: row?.totalRooms ?? 0,
    totalAvailableRooms: row?.totalAvailableRooms ?? 0,
    totalOccupiedRooms: row?.totalOccupiedRooms ?? 0,
  };
}

export async function listAllRoomsWithHistory(filters?: {
  status?: string;
  roomNumber?: string;
  roomType?: string;
}): Promise<
  (RoomSelect & {
    latestUsageHistory: { username: string; name: string } | null;
  })[]
> {
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(rooms.currentStatus, filters.status));
  }
  if (filters?.roomNumber) {
    conditions.push(ilike(rooms.roomNumber, `%${filters.roomNumber}%`));
  }
  if (filters?.roomType) {
    conditions.push(eq(rooms.roomType, filters.roomType));
  }

  const [filteredRooms, latestHistories] = await Promise.all([
    conditions.length
      ? db
          .select()
          .from(rooms)
          .where(and(...conditions))
      : db.select().from(rooms),
    // One row per room instead of the whole usage log.
    db
      .selectDistinctOn([roomUsageHistory.roomId], {
        roomId: roomUsageHistory.roomId,
        username: users.username,
        name: users.name,
      })
      .from(roomUsageHistory)
      .innerJoin(users, eq(users.id, roomUsageHistory.userId))
      .orderBy(roomUsageHistory.roomId, desc(roomUsageHistory.createdAt)),
  ]);

  const latestHistoryMap = new Map(
    latestHistories.map((history) => [
      history.roomId,
      { username: history.username, name: history.name },
    ])
  );

  return filteredRooms.map((room) => ({
    ...room,
    latestUsageHistory: latestHistoryMap.get(room.id) ?? null,
  }));
}

export async function createRoom(roomData: z.infer<typeof roomSchema>): Promise<
  Omit<RoomSelect, "currentStatus"> & {
    currentStatus: RoomType["currentStatus"];
  }
> {
  const { isAdmin } = await getRoomSession();
  if (!isAdmin) {
    throw new Error("Unauthorized: Only admins can create rooms");
  }
  const response = roomSchema.safeParse(roomData);
  if (!response.success) {
    throw new Error(
      `Invalid room data: ${response.error.issues.map((issue) => issue.message).join(", ")}`
    );
  }

  const [newRoom] = await db.insert(rooms).values(response.data).returning();

  if (!newRoom) {
    throw new Error("Failed to create room");
  }
  revalidateRoomPages();

  return newRoom as Omit<RoomSelect, "currentStatus"> & {
    currentStatus: RoomType["currentStatus"];
  };
}

/** CRs and faculty may only change the status; admins may edit any room field. */
export async function updateRoom(
  roomId: string,
  updatedData: Partial<RoomInsert>,
  _usageHistoryData?: Partial<UsageHistoryInsert>
): Promise<RoomSelect> {
  const { user, isAdmin, canToggle } = await getRoomSession();
  if (!user || !canToggle) {
    throw new Error("Unauthorized: you can't update rooms");
  }
  if (
    updatedData.currentStatus !== undefined &&
    !ROOM_STATUSES.includes(updatedData.currentStatus)
  ) {
    throw new Error("Invalid room status");
  }

  const changes: Partial<RoomInsert> = isAdmin
    ? {
        roomNumber: updatedData.roomNumber,
        roomType: updatedData.roomType,
        capacity: updatedData.capacity,
        currentStatus: updatedData.currentStatus,
      }
    : { currentStatus: updatedData.currentStatus };

  const [updatedRoom] = await db
    .update(rooms)
    .set({ ...changes, lastUpdatedTime: new Date(), updatedAt: new Date() })
    .where(eq(rooms.id, roomId))
    .returning();

  if (!updatedRoom) {
    throw new Error(`Failed to update room with ID: ${roomId}`);
  }

  // The log records who acted from the session, never from the client payload.
  await db.insert(roomUsageHistory).values({ roomId, userId: user.id });
  revalidateRoomPages();

  return updatedRoom;
}

export async function deleteRoom(roomId: string): Promise<RoomSelect> {
  const { isAdmin } = await getRoomSession();
  if (!isAdmin) {
    throw new Error("Unauthorized: Only admins can delete rooms");
  }
  try {
    const deletedRoom = await db.transaction(async (tx) => {
      await tx
        .delete(roomUsageHistory)
        .where(eq(roomUsageHistory.roomId, roomId));

      const [room] = await tx
        .delete(rooms)
        .where(eq(rooms.id, roomId))
        .returning();

      if (!room) {
        throw new Error(`Failed to delete room with ID: ${roomId}`);
      }

      return room;
    });

    revalidateRoomPages();

    return deletedRoom;
  } catch (error) {
    console.error("Failed to delete room:", error);
    throw new Error(
      `Failed to delete room: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
