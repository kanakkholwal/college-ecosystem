import { z } from "zod";
import { generateCoursesByDoc, generateEventsByDoc } from "~/ai/actions";
import { getSession } from "~/auth/server";

const bodySchema = z.object({
    files: z.array(z.union([z.string(), z.instanceof(ArrayBuffer)])),
    type: z.enum(["events", "courses"]),
})

export async function POST(request: Request) {

    const res = await request.json();
    const body = bodySchema.safeParse(res);
    if (!body.success) {
        return Response.json({ error: body.error.message }, { status: 400 })
    }
    const session = await getSession();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
        return Response.json({ error: "Unauthorized: admin role required" }, { status: 401 })
    }
    const { files, type } = body.data;
    if (type === "events") {
        console.log("[parsing] events")
        const { events, error, message } = await generateEventsByDoc(files as string[]);
        return Response.json({ events, error, message }, { status: 200 })
    }
    if (type === "courses") {
        console.log("[parsing] courses")
        const { courses, error, message } = await generateCoursesByDoc(files as string[]);
        return Response.json({ courses, error, message }, { status: 200 })
    }
    return Response.json({ error: "Invalid type" }, { status: 400 })
}