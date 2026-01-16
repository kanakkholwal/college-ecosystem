"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TestPage() {
  const [file, setFile] = useState<string | ArrayBuffer | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    console.log("Input changed:", selectedFile);
    // convert file to base64  and log it
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Base64:", !!reader.result);
        setFile(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
    // You can also handle the file upload here if needed
  };
  const handleUpload = async () => {
    if (file) {
      console.log("File to upload:", !!file);
      // Here you can implement the upload logic, e.g., sending the file to a server
      // const response = await generateEventsByDoc([file as string]);
      // console.log("Response from AI:", response);
    }
  };
  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a test page for the moderator admin section.</p>
      <div className="flex gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          placeholder="Upload an image"
        />
        <Button
          onClick={() => {
            if (!file) {
              console.error("No file selected");
              return;
            }
            handleUpload();
          }}
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
