"use server";
import { ROLES_ENUMS } from "~/constants";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { getCurrentSession } from "~/auth/guards";
import { roomSchema } from "~/constants/common.room";
import { db } from "~/db/connect";
import { roomUsageHistory, rooms, users } from "~/db/schema";
import {
  type ActionResult,
  runAction,
  UserFacingError,
} from "~/lib/action-result";

type RoomSelect = InferSelectModel<typeof rooms>;
type RoomInsert = InferInsertModel<typeof rooms>;
type UsageHistoryInsert = InferInsertModel<typeof roomUsageHistory>;
type RoomType = z.infer<typeof roomSchema>;

const ROOM_STATUSES = ["available", "occupied"];
const ROOM_NOT_FOUND = "Room not found";

// Mirrors RoomCard's toggle rule so the UI and the server agree.
async function getRoomSession() {
  const session = await getCurrentSession();
  const user = session?.user;
  return {
    user,
    isAdmin: user?.role === ROLES_ENUMS.ADMIN,
    canToggle:
      !!user &&
      (user.role === ROLES_ENUMS.ADMIN ||
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

type CreatedRoom = Omit<RoomSelect, "currentStatus"> & {
  currentStatus: RoomType["currentStatus"];
};

export async function createRoom(
  roomData: z.infer<typeof roomSchema>
): Promise<ActionResult<CreatedRoom>> {
  return runAction(
    `Room ${roomData?.roomNumber ?? ""} couldn't be added. It may already be listed; check the rooms page and try again.`,
    async () => {
      const { isAdmin } = await getRoomSession();
      if (!isAdmin) {
        throw new UserFacingError("Unauthorized: Only admins can create rooms");
      }
      const response = roomSchema.safeParse(roomData);
      if (!response.success) {
        throw new UserFacingError(
          `Invalid room data: ${response.error.issues.map((issue) => issue.message).join(", ")}`
        );
      }

      const [newRoom] = await db
        .insert(rooms)
        .values(response.data)
        .returning();
      if (!newRoom) throw new Error("Failed to create room");
      revalidateRoomPages();

      return newRoom as CreatedRoom;
    }
  );
}

/** CRs and faculty may only change the status; admins may edit any room field. */
export async function updateRoom(
  roomId: string,
  updatedData: Partial<RoomInsert>,
  _usageHistoryData?: Partial<UsageHistoryInsert>
): Promise<ActionResult<RoomSelect>> {
  return runAction("Couldn't update the room", async () => {
    const { user, isAdmin, canToggle } = await getRoomSession();
    if (!user || !canToggle) {
      throw new UserFacingError("Unauthorized: you can't update rooms");
    }
    if (
      updatedData.currentStatus !== undefined &&
      !ROOM_STATUSES.includes(updatedData.currentStatus)
    ) {
      throw new UserFacingError("Invalid room status");
    }

    const changes: Partial<RoomInsert> = isAdmin
      ? {
          roomNumber: updatedData.roomNumber,
          roomType: updatedData.roomType,
          capacity: updatedData.capacity,
          currentStatus: updatedData.currentStatus,
        }
      : { currentStatus: updatedData.currentStatus };

    const updatedRoom = await db.transaction(async (tx) => {
      const [room] = await tx
        .update(rooms)
        .set({ ...changes, lastUpdatedTime: new Date(), updatedAt: new Date() })
        .where(eq(rooms.id, roomId))
        .returning();

      if (!room) throw new UserFacingError(ROOM_NOT_FOUND);

      // The log records who acted from the session, never from the client payload.
      await tx.insert(roomUsageHistory).values({ roomId, userId: user.id });
      return room;
    });
    revalidateRoomPages();

    return updatedRoom;
  });
}

export async function deleteRoom(
  roomId: string
): Promise<ActionResult<RoomSelect>> {
  return runAction("Couldn't delete the room", async () => {
    const { isAdmin } = await getRoomSession();
    if (!isAdmin) {
      throw new UserFacingError("Unauthorized: Only admins can delete rooms");
    }
    const deletedRoom = await db.transaction(async (tx) => {
      await tx
        .delete(roomUsageHistory)
        .where(eq(roomUsageHistory.roomId, roomId));

      const [room] = await tx
        .delete(rooms)
        .where(eq(rooms.id, roomId))
        .returning();

      if (!room) throw new UserFacingError(ROOM_NOT_FOUND);

      return room;
    });

    revalidateRoomPages();

    return deletedRoom;
  });
}
