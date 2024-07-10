import { getSession } from "src/lib/auth";
import admin from "src/lib/firebaseAdmin";

import dbConnect from "src/lib/dbConnect";
import FileModel, { FileWithID } from "src/models/file";

interface UploadFileProps {
  name: string;
  file: File;
  path: string;
  tags?: string[];
}

export async function UploadFile({
  name,
  file,
  path,
  tags = [],
}: UploadFileProps): Promise<FileWithID> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const uploadedAt = new Date();
  const uploadedBy = session.user._id;

  const bucket = admin
    .storage()
    .bucket(`gs://` + process.env.FIREBASE_STORAGE_BUCKET);

  // Read the file content as a buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileRef = bucket.file(path);
  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
      metadata: {
        name,
        uploadedAt,
        uploadedBy,
      },
    },
  });

  // Get the file metadata after upload
  const [metadata] = await fileRef.getMetadata();

  // Make the file public
  await fileRef.makePublic();

  // Get the public URL
  const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${path}`;

  console.log("File uploaded successfully:", publicUrl);
  await dbConnect();
  const newFile = new FileModel({
    name,
    path,
    contentType: file.type,
    uploadedAt,
    uploadedBy,
    publicUrl,
    tags,
    metadata,
  });

  await newFile.save();
  return Promise.resolve(JSON.parse(JSON.stringify(newFile)));
}

export async function DeleteFile(
  path: string
): Promise<{ success: boolean; message: string }> {
  try {
    const bucket = admin
      .storage()
      .bucket(`gs://` + process.env.FIREBASE_STORAGE_BUCKET);
    const file = bucket.file(path);
    await file.delete();
    await dbConnect();
    await FileModel.deleteOne({ path });
    return Promise.resolve({
      success: true,
      message: "File deleted successfully",
    });
  } catch (e) {
    console.log(e);
    return Promise.reject({
      success: false,
      message: "An error occurred while deleting the file",
    });
  }
}

interface GetFilesProps {
  query?: string;
  offset?: number;
  type?: string;
}

export async function GetFiles({
  query,
  offset = 1,
  type,
}: GetFilesProps): Promise<FileWithID[]> {
  await dbConnect();
  const searchQuery = {} as Record<string, any>;
  if (query) {
    // searchQuery.$text = { $search: query };
    searchQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { path: { $regex: query, $options: "i" } },
    ];
  }
  if (type) {
    searchQuery.contentType = type;
  }

  const files = await FileModel.find(searchQuery)
    .sort({ uploadedAt: -1 })
    .skip((offset - 1) * 10)
    .limit(10);

  return Promise.resolve(JSON.parse(JSON.stringify(files)));
}
export async function GetFileByPath(path: string): Promise<FileWithID> {
  await dbConnect();
  const file = await FileModel.findOne({ path });
  if (!file) {
    return Promise.reject("File not found");
  }
  return Promise.resolve(JSON.parse(JSON.stringify(file)));
}
