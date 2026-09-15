import { z } from "zod";
import { generateCoursesByDoc, generateEventsByDoc } from "~/ai/actions";
import { getSession } from "~/auth/server";

const bodySchema = z.object({
  files: z.array(z.union([z.string(), z.instanceof(ArrayBuffer)])),
  type: z.enum(["events", "courses"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return Response.json(
      { error: "Unauthorized: admin role required" },
      { status: 403 }
    );
  }
  const res = await request.json().catch(() => null);
  const body = bodySchema.safeParse(res);
  if (!body.success) {
    return Response.json(
      { error: "Send files and a type of events or courses" },
      { status: 400 }
    );
  }
  const { files, type } = body.data;
  if (type === "events") {
    console.log("[parsing] events");
    const { events, error, message } = await generateEventsByDoc(
      files as string[]
    );
    return Response.json({ events, error, message }, { status: 200 });
  }
  if (type === "courses") {
    console.log("[parsing] courses");
    const { courses, error, message } = await generateCoursesByDoc(
      files as string[]
    );
    return Response.json({ courses, error, message }, { status: 200 });
  }
  return Response.json({ error: "Invalid type" }, { status: 400 });
}
