import { type NextRequest, NextResponse } from "next/server";
import { authorizeHostelManager } from "~/lib/hostel-access";
import { OutPassModel, type OutPassType } from "~/models/hostel_n_outpass";

const toInt = (value: string | null, fallback: number) =>
  Number.parseInt(value ?? "", 10) || fallback;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { message: "No hostel slug provided" },
      { status: 400 }
    );
  }

  const access = await authorizeHostelManager(slug);
  if (!access.ok) {
    return NextResponse.json(
      { message: access.error },
      { status: access.status }
    );
  }

  try {
    const page = Math.max(1, toInt(searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, toInt(searchParams.get("limit"), 10)));
    const hostelId = access.hostel._id;

    const [outPasses, totalCount] = await Promise.all([
      OutPassModel.find({ hostel: hostelId })
        .populate("hostel", "_id name slug gender")
        .populate("student", "_id name email rollNumber")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OutPassModel.countDocuments({ hostel: hostelId }),
    ]);

    const groupedOutPasses: Record<string, OutPassType[]> = {};
    const rows = JSON.parse(JSON.stringify(outPasses)) as OutPassType[];
    for (const outPass of rows) {
      groupedOutPasses[outPass.status] ??= [];
      groupedOutPasses[outPass.status].push(outPass);
    }

    return NextResponse.json(
      {
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        totalCount,
        groupedOutPasses,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching outpass list:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}
