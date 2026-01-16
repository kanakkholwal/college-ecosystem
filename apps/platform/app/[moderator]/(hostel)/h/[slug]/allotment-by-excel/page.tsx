"use client";

import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    FileSpreadsheet,
    Plus,
    Settings2,
    Trash2,
    UploadCloud,
    Users
} from "lucide-react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import readXlsxFile from "read-excel-file";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Logic Imports
import { baseUrl, serverIdentity } from "~/lib/fetch-client";
import { hostels } from "~/lib/server-apis/endpoints";
import { downloadAllotmentAsExcelNative } from "./utils";

// --- Types ---
const GENDER_VALUES = ["male", "female"];
const REQUIRED_FIELDS = ["name", "rollNo", "gender", "soe"];
const OPTIONAL_FIELDS = ["fatherName", "motherName", "program"];

type FieldRole = "ignore" | "rollNo" | "name" | "gender" | "soe" | "fatherName" | "motherName" | "program";
type AllottedRoom = { capacity: number; students: any[] };

export default function AllotmentPage() {
  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [headerKeys, setHeaderKeys] = useState<string[]>([]);

  // Configuration State
  const [targetGender, setTargetGender] = useState<string>("");
  const [soePriority, setSoePriority] = useState<string>("");

  // Room Distribution State (Visual -> JSON)
  const [roomTypes, setRoomTypes] = useState<{ capacity: number; count: number }[]>([
    { capacity: 4, count: 94 },
    { capacity: 3, count: 110 }
  ]);

  // Mapping State: Key = System Field, Value = Excel Header Index
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});


  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    try {
      const [headers, ...rows] = await readXlsxFile(file);
      const validHeaders = headers.filter((h) => typeof h === "string" && h.trim()) as string[];
      setHeaderKeys(validHeaders);
      setSheetData(rows as string[][]);

      // Auto-Heuristics for Mapping
      const newMapping: Record<string, string> = {};
      validHeaders.forEach((header) => {
        const lower = header.toLowerCase();
        if (lower.includes("roll")) newMapping["rollNo"] = header;
        else if (lower.includes("name") && !lower.includes("father") && !lower.includes("mother")) newMapping["name"] = header;
        else if (lower.includes("gender") || lower.includes("sex")) newMapping["gender"] = header;
        else if (lower.includes("soe") || lower.includes("state")) newMapping["soe"] = header;
      });
      setFieldMapping(newMapping);
      toast.success("File loaded and columns auto-detected");
    } catch (err) {
      toast.error("Failed to parse Excel file");
    }
  };

  const handleRoomChange = (index: number, field: 'capacity' | 'count', value: string) => {
    const newTypes = [...roomTypes];
    newTypes[index][field] = Number(value);
    setRoomTypes(newTypes);
  };

  const addRoomType = () => setRoomTypes([...roomTypes, { capacity: 2, count: 0 }]);
  const removeRoomType = (index: number) => setRoomTypes(roomTypes.filter((_, i) => i !== index));

  // --- Submission Logic ---

  const handleSubmit = async () => {
    if (!file) return;

    // 1. Validation
    const missingFields = REQUIRED_FIELDS.filter(f => !fieldMapping[f]);
    if (missingFields.length > 0) {
      toast.error(`Please map the following required fields: ${missingFields.join(", ")}`);
      return;
    }
    if (!targetGender) {
      toast.error("Please select a target gender for this batch.");
      return;
    }

    // 2. Prepare Data
    // Convert mapping format back to what API expects (Header -> Role)
    // The API expects: { "Column A": "name", "Column B": "rollNo" }
    const apiMapping: Record<string, string> = {};
    Object.entries(fieldMapping).forEach(([role, header]) => {
      apiMapping[header] = role;
    });

    // Convert room types array to object: { "4": 94, "3": 110 }
    const roomDistObj: Record<string, number> = {};
    roomTypes.forEach(r => {
      if (r.count > 0) roomDistObj[r.capacity.toString()] = r.count;
    });

    const formData = new FormData();
    formData.append("fieldMapping", JSON.stringify(apiMapping));
    formData.append("file", file);
    formData.append("roomDistribution", JSON.stringify(roomDistObj));

    // Find keys for specific logic
    const genderHeader = fieldMapping["gender"];
    const soeHeader = fieldMapping["soe"];

    formData.append("genderKey", genderHeader);
    formData.append("gender", targetGender);
    formData.append("soeKey", soeHeader);
    if (soePriority) formData.append("soePriority", soePriority);
    formData.append("extraFields", JSON.stringify([genderHeader, soeHeader]));

    setLoading(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_SERVER_URL + hostels.allotRoomsFromExcel.url, {
        method: "POST",
        body: formData,
        headers: {
          "X-Authorization": serverIdentity,
          Origin: baseUrl,
        },
      });

      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed");

      await downloadAllotmentAsExcelNative(data.allocation, targetGender, []);
      toast.success("Allotment complete! Downloading results...");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to allot rooms");
    } finally {
      setLoading(false);
    }
  };

  // --- Computed ---
  const uniqueSoeValues = useMemo(() => {
    if (!fieldMapping["soe"]) return [];
    const colIndex = headerKeys.indexOf(fieldMapping["soe"]);
    if (colIndex === -1) return [];
    return Array.from(new Set(sheetData.map(row => row[colIndex]))).filter(Boolean);
  }, [fieldMapping, headerKeys, sheetData]);

  const totalCapacity = roomTypes.reduce((acc, curr) => acc + (curr.capacity * curr.count), 0);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Room Allocation Engine</h1>
        <p className="text-muted-foreground">
          Bulk allot rooms to freshers based on Excel data, gender, and state priority.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Source Data
              </CardTitle>
              <CardDescription>Upload the student list (.xlsx)</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">Click to upload student list</h3>
                  <p className="text-sm text-muted-foreground mt-1">Excel files only (.xlsx)</p>
                  <Input
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    id="file-upload"
                    onChange={handleExcelUpload}
                  />
                  <Label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-md">
                      <FileSpreadsheet className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{sheetData.length} rows found</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:bg-destructive/10">
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Mapping (Only shows after upload) */}
          {file && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Data Mapping
                </CardTitle>
                <CardDescription>Match Excel columns to system fields</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REQUIRED_FIELDS.map(field => (
                    <div key={field} className="space-y-2">
                      <Label className="capitalize flex items-center gap-2">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                        <Badge variant="outline" className="text-[10px] h-5 bg-red-50 text-red-600 border-red-200">Required</Badge>
                      </Label>
                      <Select
                        value={fieldMapping[field] || ""}
                        onValueChange={(val) => setFieldMapping(prev => ({ ...prev, [field]: val }))}
                      >
                        <SelectTrigger className={fieldMapping[field] ? "border-green-500 bg-green-50/20" : ""}>
                          <SelectValue placeholder="Select Column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {headerKeys.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {OPTIONAL_FIELDS.map(field => (
                    <div key={field} className="space-y-2">
                      <Label className="capitalize flex items-center gap-2">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                      </Label>
                      <Select
                        value={fieldMapping[field] || ""}
                        onValueChange={(val) => setFieldMapping(prev => ({ ...prev, [field]: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {headerKeys.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Room Distribution
              </CardTitle>
              <CardDescription>Define how many rooms of each capacity are available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomTypes.map((room, idx) => (
                <div key={idx} className="flex items-end gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Capacity (Seater)</Label>
                    <Input
                      type="number"
                      value={room.capacity}
                      onChange={(e) => handleRoomChange(idx, 'capacity', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Count (Rooms)</Label>
                    <Input
                      type="number"
                      value={room.count}
                      onChange={(e) => handleRoomChange(idx, 'count', e.target.value)}
                    />
                  </div>
                  <div className="pb-1">
                    <Button variant="ghost" size="icon" onClick={() => removeRoomType(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addRoomType} className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" /> Add Room Type
              </Button>
            </CardContent>
            <CardFooter className="bg-muted/30 py-3 border-t flex justify-between">
              <span className="text-sm text-muted-foreground">Total Capacity Generated:</span>
              <Badge variant="default_soft">{totalCapacity} Beds</Badge>
            </CardFooter>
          </Card>

        </div>

        <div className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              <div className="space-y-2">
                <Label>Target Gender</Label>
                <Select value={targetGender} onValueChange={setTargetGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_VALUES.map(g => (
                      <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  System will filter rows matching this gender from the file.
                </p>
              </div>

              <div className="space-y-2">
                <Label>State Priority (SOE)</Label>
                <Select value={soePriority} onValueChange={setSoePriority} disabled={!fieldMapping["soe"]}>
                  <SelectTrigger>
                    <SelectValue placeholder={fieldMapping["soe"] ? "Select Home State..." : "Map SOE Column first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSoeValues.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Students from this state will be grouped together if possible.
                </p>
              </div>

            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-none shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  {file ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                  <span>File Uploaded</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {targetGender ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                  <span>Gender Selected</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {totalCapacity > 0 ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                  <span>Rooms Defined</span>
                </div>

                <Separator />

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={loading || !file || !targetGender || totalCapacity === 0}
                >
                  {loading ? "Processing..." : "Run Allotment"}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}