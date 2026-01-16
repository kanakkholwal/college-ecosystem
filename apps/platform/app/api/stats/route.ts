import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sessions_CountAndGrowth, users_CountAndGrowth } from "~/actions/dashboard.admin";
import { extractVisitorCount } from "~/lib/third-party/github";
import { TimeInterval } from "~/utils/process";

export async function GET(request: Request) {
    try {
        const headersList = await headers()

        const x_authorization = headersList.get("x-authorization");
        if (!x_authorization || x_authorization !== process.env.SERVER_IDENTITY) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const period = (searchParams.get("period") || "last_week") as TimeInterval;
        // Simulate fetching stats data
        const [usersStats, sessionsStats] = await Promise.all(
            [
                users_CountAndGrowth(period),
                sessions_CountAndGrowth(period),
            ]
        )
        const visitors = await extractVisitorCount();
        const statsData = {
            users: usersStats,
            sessions: sessionsStats,
            visitors,
        }
        return NextResponse.json({
            data: statsData,
            message: "Stats fetched successfully",
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
