import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, desc, eq, like } from "drizzle-orm";
import { db } from "~/db/connect";
import { roomUsageHistory, rooms, users } from "~/db/schema";

// Define types for rooms and usage history
type RoomSelect = InferSelectModel<typeof rooms>;
type RoomInsert = InferInsertModel<typeof rooms>;
type UsageHistoryInsert = InferInsertModel<typeof roomUsageHistory>;
type UsageHistorySelect = InferSelectModel<typeof roomUsageHistory>;

// TODO: Add JSDoc comments for all functions
// Function to list all rooms with their usage history
export async function listAllRoomsWithHistory(
  filters?: { status?: string; roomNumber?: string }
): Promise<(RoomSelect & { latestUsageHistory: { username: string; name: string } | null })[]> {
  // Build the filters for the query
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(rooms.currentStatus, filters.status));
  }
  if (filters?.roomNumber) {
    conditions.push(like(rooms.roomNumber, `%${filters.roomNumber}%`));
  }

  // Apply filters if any
  const roomQuery = conditions.length
    ? db.select().from(rooms).where(and(...conditions))
    : db.select().from(rooms);

  const filteredRooms = await roomQuery;

  // Fetch latest usage history per room
  const latestHistories = await db
    .select({
      roomId: roomUsageHistory.roomId,
      userId: roomUsageHistory.userId,
      createdAt: roomUsageHistory.createdAt,
      username: users.username,
      name: users.name,
    })
    .from(roomUsageHistory)
    .innerJoin(users, eq(users.id, roomUsageHistory.userId))
    .orderBy(desc(roomUsageHistory.createdAt));

  // Map latest usage history by roomId
  const latestHistoryMap = latestHistories.reduce((acc, history) => {
    if (history.roomId && !acc[history.roomId]) {
      acc[history.roomId] = {
        username: history.username,
        name: history.name,
      };
    }
    return acc;
  }, {} as Record<string, { username: string; name: string }>);

  // Populate rooms with latest usage history
  return filteredRooms.map((room) => ({
    ...room,
    latestUsageHistory: latestHistoryMap[room.id] || null,
  }));
}


// Function to create a new room
export async function createRoom(
  roomData: RoomInsert,
  initialUsageHistory?: UsageHistoryInsert
): Promise<RoomSelect> {
  const [newRoom] = await db.insert(rooms).values(roomData).returning();

  if (!newRoom) {
    throw new Error("Failed to create room");
  }

  if (initialUsageHistory) {
    await db.insert(roomUsageHistory).values({
      ...initialUsageHistory,
      roomId: newRoom.id,
    });
  }

  return newRoom;
}

// Function to update a room
export async function updateRoom(
  roomId: string,
  updatedData: Partial<RoomInsert>,
  usageHistoryData?: UsageHistoryInsert
): Promise<RoomSelect> {
  const [updatedRoom] = await db
    .update(rooms)
    .set(updatedData)
    .where(eq(rooms.id, roomId))
    .returning();

  if (!updatedRoom) {
    throw new Error(`Failed to update room with ID: ${roomId}`);
  }

  if (usageHistoryData) {
    await db.insert(roomUsageHistory).values({
      ...usageHistoryData,
      roomId,
    });
  }

  return updatedRoom;
}

// Function to delete a room and its usage history
export async function deleteRoom(roomId: string): Promise<RoomSelect> {
  const [deletedRoom] = await db
    .delete(rooms)
    .where(eq(rooms.id, roomId))
    .returning();

  if (!deletedRoom) {
    throw new Error(`Failed to delete room with ID: ${roomId}`);
  }

  // Delete usage history associated with the room
  await db.delete(roomUsageHistory).where(eq(roomUsageHistory.roomId, roomId));

  return deletedRoom;
}

// Function to add usage history to a room
export async function addUsageHistory(
  usageHistoryData: UsageHistoryInsert
): Promise<UsageHistorySelect> {
  const [newHistory] = await db
    .insert(roomUsageHistory)
    .values(usageHistoryData)
    .returning();

  if (!newHistory) {
    throw new Error("Failed to add usage history");
  }

  return newHistory;
}

// Function to list usage history for a specific room
export async function listRoomUsageHistory(
  roomId: string
): Promise<UsageHistorySelect[]> {
  return await db
    .select()
    .from(roomUsageHistory)
    .where(eq(roomUsageHistory.roomId, roomId));
}