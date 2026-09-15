import mongoose from "mongoose";
import dbConnect from "~/lib/dbConnect";
import { HostelRoomModel, RoomMemberModel } from "~/models/allotment";
import { OPEN_OUTPASS_STATUSES, OutPassModel } from "~/models/hostel_n_outpass";
import Timetable from "~/models/time-table";

type Id = mongoose.Types.ObjectId;

const apply = process.argv.includes("--apply");
const log = (...args: unknown[]) => console.log(...args);

async function dedupeRoomMembers() {
  const groups = await RoomMemberModel.aggregate<{
    _id: Id;
    members: { _id: Id; room: Id }[];
  }>([
    { $sort: { _id: 1 } },
    {
      $group: {
        _id: "$student",
        members: { $push: { _id: "$_id", room: "$room" } },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);
  log(`\nRoomMember: ${groups.length} students in more than one room`);
  if (groups.length === 0) return;

  const affectedRooms = new Map<string, Id>();
  const extraIds: Id[] = [];
  for (const { _id: student, members } of groups) {
    // ObjectIds sort by creation time, so the first membership is the earliest.
    const [keep, ...extra] = members;
    log(
      `  student ${student}: keep ${keep._id} (room ${keep.room}), remove ${extra
        .map((m) => `${m._id} (room ${m.room})`)
        .join(", ")}`
    );
    for (const m of extra) {
      extraIds.push(m._id);
      affectedRooms.set(m.room.toString(), m.room);
    }
  }
  if (!apply) return;

  await RoomMemberModel.deleteMany({ _id: { $in: extraIds } });
  for (const roomId of affectedRooms.values()) {
    const members = await RoomMemberModel.find({ room: roomId })
      .select("student")
      .lean<{ student: Id }[]>();
    const room = await HostelRoomModel.findById(roomId);
    if (!room) continue;
    room.occupied_seats = members.length;
    if (
      room.hostStudent &&
      !members.some((m) => m.student.equals(room.hostStudent))
    ) {
      room.hostStudent = undefined;
    }
    await room.save();
    log(`  room ${roomId}: occupied_seats recomputed to ${members.length}`);
  }
  log(`  removed ${extraIds.length} duplicate memberships`);
}

async function dedupeOpenOutpasses() {
  const groups = await OutPassModel.aggregate<{
    _id: Id;
    passes: { _id: Id; status: string; createdAt: Date }[];
  }>([
    { $match: { status: { $in: [...OPEN_OUTPASS_STATUSES] } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$student",
        passes: {
          $push: { _id: "$_id", status: "$status", createdAt: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);
  log(`\nOutPass: ${groups.length} students with more than one open pass`);
  if (groups.length === 0) return;

  const now = new Date();
  for (const { _id: student, passes } of groups) {
    // A pass in use means the student is outside, so it wins over a newer pending request.
    const keep = passes.find((p) => p.status === "in_use") ?? passes[0];
    const extra = passes.filter((p) => !p._id.equals(keep._id));
    log(
      `  student ${student}: keep ${keep._id} (${keep.status}), close ${extra
        .map((p) => `${p._id} (${p.status})`)
        .join(", ")}`
    );
    if (!apply) continue;
    for (const p of extra) {
      const reason = `Closed automatically: duplicate open outpass, kept ${keep._id}`;
      // An older in_use pass can't be rejected after exit; mark it processed and flag it.
      const status = p.status === "in_use" ? "processed" : "rejected";
      await OutPassModel.updateOne(
        { _id: p._id, status: p.status },
        {
          $set: {
            status,
            rejectionReason: reason,
            reviewedBy: "system:dedupe-unique-indexes",
            reviewedAt: now,
          },
        }
      );
      if (status === "processed") {
        log(`    review ${p._id}: was in_use, marked processed`);
      }
    }
  }
}

async function reportTimetables() {
  const groups = await Timetable.aggregate<{
    _id: {
      department_code: string;
      year: number;
      semester: number;
      sectionName: string;
    };
    docs: { _id: Id; updatedAt?: Date }[];
  }>([
    {
      $group: {
        _id: {
          department_code: "$department_code",
          year: "$year",
          semester: "$semester",
          sectionName: "$sectionName",
        },
        docs: { $push: { _id: "$_id", updatedAt: "$updatedAt" } },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);
  log(`\nTimetable: ${groups.length} duplicated keys (never changed here)`);
  for (const { _id: key, docs } of groups) {
    log(
      `  ${key.department_code} y${key.year} s${key.semester} "${key.sectionName}": ${docs
        .map((d) => `${d._id} (updated ${d.updatedAt?.toISOString() ?? "?"})`)
        .join(", ")}`
    );
  }
  return groups.length === 0;
}

async function syncModelIndexes(name: string, model: mongoose.Model<unknown>) {
  if (!apply) {
    const diff = await model.diffIndexes();
    log(
      `  ${name}: would create [${diff.toCreate.map((i) => JSON.stringify(i)).join(", ")}], drop [${diff.toDrop.join(", ")}]`
    );
    return;
  }
  try {
    const dropped = await model.syncIndexes();
    log(
      `  ${name}: indexes synced${dropped.length ? `, dropped ${dropped.join(", ")}` : ""}`
    );
  } catch (err) {
    console.error(`  ${name}: syncIndexes failed`, err);
    process.exitCode = 1;
  }
}

async function main() {
  const conn = await dbConnect();
  log(
    `${apply ? "APPLY" : "DRY RUN"} on database "${conn.connection.db?.databaseName}"`
  );

  await dedupeRoomMembers();
  await dedupeOpenOutpasses();
  const timetablesClean = await reportTimetables();

  log(
    `\nIndexes${apply ? "" : " (diff only; syncIndexes also drops indexes missing from the schema)"}:`
  );
  await syncModelIndexes("RoomMember", RoomMemberModel);
  await syncModelIndexes("OutPass", OutPassModel);
  if (timetablesClean || !apply) {
    await syncModelIndexes("Timetable", Timetable);
  } else {
    log("  Timetable: skipped, resolve the duplicates above by hand first");
    process.exitCode = 1;
  }
  if (!apply) log("\nNothing was changed. Re-run with --apply to fix.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
