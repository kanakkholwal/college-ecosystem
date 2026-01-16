type Student = {
  name: string;
  rollNo: string;
  soe: string;
  gender: string;
  [key: string]: string;
};

type RoomDistribution = Record<number, number>;

export const FIELD_ROLES = ['ignore', 'rollNo', 'name', 'gender', 'soe', 'fatherName', 'motherName', 'program'] as const;
type FieldRole = typeof FIELD_ROLES[number];

type AllottedRoom = {
  capacity: number;
  students: Student[];
};

export async function allotRooms(
  students: Student[],
  roomDistribution: RoomDistribution,
  fieldMapping: Record<FieldRole, string>,
  targetGender: string,
  soePriority: string = 'Home State',
  extraFields: string[] = []
): Promise<AllottedRoom[]> {
  // 1. Filter by gender
  const filtered = students.filter(
    (s) => s[fieldMapping.gender]?.toLowerCase() === targetGender.toLowerCase()
  );

  if (filtered.length === 0) {
    console.warn(`No students found for ${fieldMapping.gender}: ${targetGender}`);
    return [];
  }

  // 2. Build empty room slots
  const roomList: AllottedRoom[] = [];
  const sizes: number[] = [];

  Object.entries(roomDistribution).forEach(([sizeStr, count]) => {
    const size = parseInt(sizeStr, 10);
    for (let i = 0; i < count; i++) {
      roomList.push({ capacity: size, students: [] });
      sizes.push(size);
    }
  });

  const totalRoomCount = roomList.length;

  // 3. Split by SOE Priority
  const priorityStudents = filtered.filter(
    (s) => s[fieldMapping.soe].toLowerCase() === soePriority.toLowerCase()
  );
  const nonPriorityStudents = filtered.filter(
    (s) => s[fieldMapping.soe].toLowerCase() !== soePriority.toLowerCase()
  );

  // 4. Place one priority student per room (if available)
  let roomIndex = 0;
  let priorityIndex = 0;

  while (priorityIndex < priorityStudents.length && roomIndex < roomList.length) {
    const room = roomList[roomIndex];
    if (room.students.length < room.capacity) {
      room.students.push(priorityStudents[priorityIndex++]);
    }
    if (priorityStudents.length < roomList.length) {
      console.warn(`Only ${priorityStudents.length} priority students for ${roomList.length} rooms`);
      // optionally: throw new Error or return early
    }

    roomIndex++;
  }

  // 5. Merge remaining (priority leftovers + non-priority) and shuffle
  const remainingStudents = [
    ...priorityStudents.slice(priorityIndex),
    ...nonPriorityStudents
  ].sort(() => Math.random() - 0.5);

  // 6. Fill remaining slots
  roomIndex = 0;
  for (const student of remainingStudents) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < totalRoomCount) {
      const room = roomList[roomIndex];
      if (room.students.length < room.capacity) {
        room.students.push(student);
        placed = true;
      }

      roomIndex = (roomIndex + 1) % totalRoomCount;
      attempts++;
    }
  }

  // 7. Map final structure to output
  return roomList.map(room => ({
    capacity: room.capacity,
    students: room.students.map(s => ({
      name: s[fieldMapping.name],
      rollNo: s[fieldMapping.rollNo],
      soe: s[fieldMapping.soe],
      gender: s[fieldMapping.gender],
      ...extraFields.reduce((acc, key) => {
        acc[key] = s[key];
        return acc;
      }, {} as Record<string, string>)
    }))
  }));
}
