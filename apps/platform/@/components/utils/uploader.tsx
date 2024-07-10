"use client";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/extended/file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { Paperclip, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgSpinner } from "react-icons/cg";
import ConditionalRender from "./conditional-render";

interface UploadImageProps {
  onUpload?: (fileUrl: string) => void;
}

const dropZoneConfig = {
  maxFiles: 1,
  maxSize: 1024 * 1024 * 4,
  multiple: false,
};

export function UploadImage({ onUpload }: UploadImageProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({
    name: "",
    path: "",
  });

  const uploadImage = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", selectedFile!);
    formData.append("name", meta.name);
    formData.append("path", meta.path);
    formData.append(
      "tags",
      JSON.stringify(meta.path.split("/").filter(Boolean))
    );

    try {
      const response = await axios.post("/api/storage/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
          }
        },
      });

      setUploading(false);
      setUploadSuccess(true);
      console.log(response.data);
      onUpload?.(response.data.publicUrl); // Ensure this matches your response structure
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error(error);
      setUploadError("Error uploading file");
      toast.error("Error uploading file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  useEffect(() => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setMeta({
        name: files[0].name,
        path: `uploads/${files[0].name}`,
      });
    }
  }, [files]);

  return (
    <div className="flex justify-center gap-6 flex-wrap w-full max-w-5xl mx-auto pt-5">
      <div className="flex-auto p-3 space-y-4">
        <FileUploader
          value={files}
          onValueChange={(files) => setFiles(files)}
          dropzoneOptions={dropZoneConfig}
          className="relative bg-background rounded-lg p-2"
        >
          <FileInput className="outline-dashed outline-1 outline-white">
            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
              <FileSvgDraw />
            </div>
          </FileInput>
          <FileUploaderContent>
            {files &&
              files.length > 0 &&
              files.map((file, i) => (
                <FileUploaderItem key={i} index={i}>
                  <Paperclip className="h-4 w-4 stroke-current" />
                  <span>{file.name}</span>
                </FileUploaderItem>
              ))}
          </FileUploaderContent>
        </FileUploader>

        <ConditionalRender condition={uploading}>
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertTitle>
              {uploadProgress === 100 ? "Finishing up..." : "Uploading..."} (
              {uploadProgress}%)
            </AlertTitle>
            <AlertDescription>
              <Progress value={uploadProgress} className="mt-5" />
            </AlertDescription>
          </Alert>
        </ConditionalRender>
        <ConditionalRender condition={!!uploadError}>
          <Alert variant="destructive">
            <Upload className="h-4 w-4" />
            <AlertTitle>Error uploading file</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        </ConditionalRender>
        <ConditionalRender condition={!!uploadSuccess}>
          <Alert variant="success">
            <Upload className="h-4 w-4" />
            <AlertTitle>Upload successful!</AlertTitle>
            <AlertDescription>File uploaded successfully</AlertDescription>
          </Alert>
        </ConditionalRender>
      </div>
      <div className="grid gap-3 flex-auto @3xl:max-w-sm">
        <div className="grid w-full">
          <Label htmlFor="name">File Name</Label>
          <Input
            id="name"
            placeholder="Enter name"
            value={meta.name}
            onChange={(e) => setMeta({ ...meta, name: e.target.value })}
          />
        </div>
        <div className="grid w-full">
          <Label htmlFor="path">File Path</Label>
          <Input
            id="path"
            placeholder="Enter path"
            value={meta.path}
            onChange={(e) => setMeta({ ...meta, path: e.target.value })}
          />
        </div>

        <Button
          disabled={uploading || !selectedFile}
          onClick={() => {
            console.log(meta);

            if (!selectedFile) {
              toast.error("No file selected");
              return;
            }
            console.log(selectedFile);
            uploadImage();
          }}
        >
          {uploading ? <CgSpinner className="animate-spin" /> : <Upload />}
          Upload{uploading ? "ing" : ""} File
        </Button>
      </div>
    </div>
  );
}

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF
      </p>
    </>
  );
};
