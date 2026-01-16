import { NextResponse, type NextRequest } from "next/server";



// get status of the mail server
export async function GET(request: NextRequest) {
    try {
        console.log("GET /status called", request);
        // Return a simple status message
        return NextResponse.json(
            { status: "Mail server is running" },
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in GET /status:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

}
