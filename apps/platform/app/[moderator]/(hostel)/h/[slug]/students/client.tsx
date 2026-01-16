"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import toast from "react-hot-toast";
import readXlsxFile from "read-excel-file";

type importStudentsPayload = {
  rollNo: string;
  name: string;
  cgpi: number;
}[];

export function ImportStudents({
  importFn,
}: {
  importFn: (data: importStudentsPayload) => Promise<string>;
}) {
  const [extractedKeys, setExtractedKeys] = useState<string[]>([]);
  const [rollNoKey, setRollNoKey] = useState<number>();
  const [nameKey, setNameKey] = useState<number>();
  const [cgpiKey, setCgpiKey] = useState<number>();
  const [data, setData] = useState<string[][]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (!file) return;

    const [keys, ...data] = await readXlsxFile(file);
    console.log(keys);
    setExtractedKeys(
      keys.filter(
        (key) => typeof key === "string" && key.trim() !== ""
      ) as string[]
    );
    console.log(data);
    setData(data as string[][]);
  };

  const processData = () => {
    if (!rollNoKey || !nameKey || !cgpiKey) {
      console.error("Roll No Key or Name Key is not set");
      alert("Roll No Key or Name Key is not set");
      return;
    }
    const processedData: importStudentsPayload = data.map((row) => {
      const rollNo = row[rollNoKey].toLowerCase();
      const name = row[nameKey];
      const cgpi = Number.parseInt(row[cgpiKey]);
      return { rollNo, name, cgpi };
    });
    console.log(processedData);
    toast.promise(importFn(processedData), {
      loading: "Importing Students...",
      success: "Students Imported Successfully",
      error: (error: string) => {
        console.error(error);
        return "Error Importing Students";
      },
    });
  };

  return (
    <div className="my-5">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="excel">
          Import Excel file (Only .xlsx files are supported)
        </Label>
        <Input
          id="excel"
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
        />
      </div>
      {data.length > 0 && (
        <div className="flex w-full items-center gap-3 flex-wrap mt-5">
          <div className="grid w-full items-center gap-2.5 grid-cols-1 @lg:grid-cols-3">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="rollNoKey">Roll No Key</Label>

              <Select
                onValueChange={(value) => setRollNoKey(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Roll No Key" />
                </SelectTrigger>
                <SelectContent>
                  {extractedKeys.map((key, index) => (
                    <SelectItem key={key} value={index.toString()}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="nameKey">Name Key</Label>

              <Select
                onValueChange={(value) => setNameKey(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Name Key" />
                </SelectTrigger>
                <SelectContent>
                  {extractedKeys.map((key, index) => (
                    <SelectItem key={key} value={index.toString()}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="cgpiKey">CGPI Key</Label>

              <Select
                onValueChange={(value) => setCgpiKey(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="CGPI Key" />
                </SelectTrigger>
                <SelectContent>
                  {extractedKeys.map((key, index) => (
                    <SelectItem key={key} value={index.toString()}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Button
              onClick={processData}
              disabled={!rollNoKey || !nameKey || !cgpiKey}
            >
              Process Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
