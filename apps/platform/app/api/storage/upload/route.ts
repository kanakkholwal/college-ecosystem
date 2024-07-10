import { NextRequest, NextResponse } from "next/server";
import { getSession } from "src/lib/auth";

import { UploadFile } from "src/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.formData();

    console.log(data);

    const file = data.get("file") as File;
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }
    const name = data.get("name") ? (data.get("name") as string) : file.name;
    const path = data.get("path") as string;
    const tags = data.get("tags")
      ? JSON.parse(data.get("tags") as string)
      : path.split("/").filter(Boolean);

    const newFile = await UploadFile({ name, file, path, tags });

    return NextResponse.json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "Error uploading file", error },
      { status: 500 }
    );
  }
}
