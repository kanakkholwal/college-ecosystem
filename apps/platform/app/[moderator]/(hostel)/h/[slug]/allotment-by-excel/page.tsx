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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import toast from "react-hot-toast";
import readXlsxFile from "read-excel-file";
import { baseUrl, serverIdentity } from "~/lib/fetch-client";
import { hostels } from "~/lib/server-apis/endpoints";
import { downloadAllotmentAsExcelNative } from "./utils";

const GENDER_VALUES = ["male", "female"];
const FIELD_ROLES = [
  "ignore",
  "rollNo",
  "name",
  "gender",
  "soe",
  "fatherName",
  "motherName",
  "program",
] as const;
type FieldRole = (typeof FIELD_ROLES)[number];
type Student = {
  name: string;
  rollNo: string;
  soe: string;
  gender: string;
  [key: string]: string;
};

type RoomDistribution = Record<number, number>;


type AllottedRoom = {
  capacity: number;
  students: Student[];
};

export default function AllotmentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [gender, setGender] = useState<string>("");
  const [soePriority, setSoePriority] = useState<string>();
  const [headerKeys, setHeaderKeys] = useState<string[]>([]);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [genderKey, setGenderKey] = useState<number>();
  const [soeKey, setSoeKey] = useState<number>();
  const [roomDistribution, setRoomDistribution] = useState({
    "4": 94,
    "3": 110,
  });
  const [loading, setLoading] = useState(false);

  const [selectedFields, setSelectedFields] = useState<
    Record<string, FieldRole>
  >({});
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const [headers, ...rows] = await readXlsxFile(file);
    const validHeaders = headers.filter(
      (h) => typeof h === "string" && h.trim()
    ) as string[];
    setHeaderKeys(validHeaders);
    setSheetData(rows as string[][]);

    // Auto-detect gender and SOE columns
    const lowerHeaders = validHeaders.map((h) => h.toLowerCase());
    const gIndex = lowerHeaders.findIndex((h) =>
      ["gender", "sex"].some((k) => h.includes(k))
    );
    const sIndex = lowerHeaders.findIndex((h) =>
      ["soe", "state"].some((k) => h.includes(k))
    );

    if (gIndex !== -1) setGenderKey(gIndex);
    if (sIndex !== -1) setSoeKey(sIndex);
  };

  const validateGenderColumn = (): boolean => {
    if (genderKey === undefined) return false;
    const values = sheetData
      .slice(0, 10)
      .map((row) => row[genderKey]?.toLowerCase());
    return values.every((val) => GENDER_VALUES.includes(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || genderKey === undefined || soeKey === undefined) {
      toast.error("Missing required selections or file.");
      return;
    }

    if (!validateGenderColumn()) {
      toast.error('Gender column must only contain "Male"/"Female" values.');
      return;
    }
    if (gender.trim() === "") {
      toast.error("Please select a gender.");
      return;
    }
    const requiredFields: FieldRole[] = ["gender", "soe", "name", "rollNo"];
    const missing = requiredFields.filter(
      (f) => !Object.values(selectedFields).includes(f)
    );

    if (missing.length) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return;
    }
    const genderCol = headerKeys[genderKey];
    const soeCol = headerKeys[soeKey];

    const formData = new FormData();
    const fieldMapping: Record<FieldRole, string> = Object.entries(
      selectedFields
    ).reduce(
      (acc, [header, role]) => {
        if (role !== "ignore") acc[role] = header;
        return acc;
      },
      {} as Record<FieldRole, string>
    );

    formData.append("fieldMapping", JSON.stringify(fieldMapping));
    formData.append("file", file);
    formData.append("roomDistribution", JSON.stringify(roomDistribution));
    formData.append("genderKey", headerKeys[genderKey]);
    formData.append("gender", gender);
    formData.append("soeKey", headerKeys[soeKey]);
    formData.append("soePriority", "Home State"); // e.g., "Rajasthan"

    formData.append("extraFields", JSON.stringify([genderCol, soeCol]));

    setLoading(true);
    fetch(
      process.env.NEXT_PUBLIC_BASE_SERVER_URL + hostels.allotRoomsFromExcel.url,
      {
        method: "POST",
        body: formData,
        headers: {
          "X-Authorization": serverIdentity,
          Origin: baseUrl,
        },
      }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Server Error");

        const data = (await res.json()) as { success: boolean; message?: string; allocation: AllottedRoom[] };
        if (!data.success)
          throw new Error(data.message || "Failed to allot rooms");
        console.log(data);
        toast.success("Rooms allotted successfully! Downloading file...");
        // Download the allotment file
        await downloadAllotmentAsExcelNative(data.allocation, gender, []);
        toast.success("File downloaded successfully!");
      })
      .catch((error) => {
        console.error("Error during allotment:", error);
        toast.error(error.message || "Failed to allot rooms");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">
        🏢 Room Allotment Tool by SOE for Freshers
      </h1>
      <div className="grid gap-4 @lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="file">Excel File</Label>
          <Input
            id="file"
            type="file"
            accept=".xlsx"
            onChange={handleExcelUpload}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            onValueChange={(value) => setGender(value)}
            disabled={!file || genderKey === undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="soe">SOE Priority</Label>
          <Select
            value={soePriority}
            name="soe"
            disabled={!file || soeKey === undefined}
            onValueChange={(value) => setSoePriority(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select SOE Priority (Home State)" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(new Set(sheetData.map((row) => row[soeKey!]))).map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {headerKeys.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>
              Select Labels of Columns you want to return in the allotment file.
              <span className="text-xs text-muted-foreground">
                {" "}
                (Gender, SOE, Name, Roll No)
              </span>
            </Label>
            <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4 pl-2 border-l">
              {headerKeys.map((key) => (
                <div key={key} className="space-y-1">
                  <Label>{key} Column</Label>
                  <Select
                    value={selectedFields[key] || "ignore"}
                    onValueChange={(role) =>
                      setSelectedFields((prev) => ({
                        ...prev,
                        [key]: role as FieldRole,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role === "ignore" ? "Ignore" : role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-distribution">
              Room Distribution (JSON) - Format:{" "}
              {`"<room_capacity>": <count>, ...`}
            </Label>
            <Textarea
              id="room-distribution"
              placeholder='{"4": 94, "3": 110}'
              value={JSON.stringify(roomDistribution)}
              onChange={(e) => setRoomDistribution(JSON.parse(e.target.value))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Preview (first 5 rows)</Label>
            <div className="border rounded overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headerKeys.map((key, idx) => (
                      <TableHead key={idx}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sheetData.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headerKeys.map((_, colIdx) => (
                        <TableCell key={colIdx}>{row[colIdx]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading || !file}>
            {loading ? "Processing..." : "Submit & Download"}
          </Button>
        </>
      )}
    </div>
  );
}
