import Image from "next/image";
import React from "react";
import { FileWithID } from "src/models/file";

export function FileCard({ file }: { file: FileWithID }) {
  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-md shadow-sm">
      <div className="flex items-center gap-4">
        <Image
          src={file.publicUrl}
          alt={file.name}
          width={120}
          height={120}
          className="w-12 h-12 object-cover rounded-md"
        />
        <div>
          <h2 className="text-lg font-semibold">{file.name}</h2>
          <p className="text-sm text-gray-500">{file.contentType}</p>
        </div>
      </div>
      <div>
        <button className="btn">Delete</button>
      </div>
    </div>
  );
}
