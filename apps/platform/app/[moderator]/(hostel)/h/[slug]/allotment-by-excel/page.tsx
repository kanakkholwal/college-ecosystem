"use client";

import {
  Circle,
  CircleCheck,
  FileSpreadsheet,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { readSheet as readXlsxFile } from "read-excel-file/browser";
import { HeaderBar } from "@/components/common/header-bar";
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
import { cn } from "@/lib/utils";
import { downloadAllotmentAsExcelNative } from "./utils";

const GENDER_VALUES = [
  { value: "male", label: "Boys" },
  { value: "female", label: "Girls" },
];
const REQUIRED_FIELDS = [
  { key: "rollNo", label: "Roll number" },
  { key: "name", label: "Name" },
  { key: "gender", label: "Gender" },
  { key: "soe", label: "State of eligibility" },
] as const;
const OPTIONAL_FIELDS = [
  { key: "fatherName", label: "Father's name" },
  { key: "motherName", label: "Mother's name" },
  { key: "program", label: "Programme" },
] as const;

type RoomType = { id: number; capacity: number; count: number };

export default function AllotmentByExcelPage() {
  const { slug } = useParams<{ slug: string }>();
  const fileId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [headerKeys, setHeaderKeys] = useState<string[]>([]);
  const [targetGender, setTargetGender] = useState("");
  const [soePriority, setSoePriority] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { id: 1, capacity: 2, count: 0 },
  ]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  const handleExcelUpload = async (picked: File | undefined) => {
    if (!picked) return;
    try {
      const [headers, ...rows] = await readXlsxFile(picked);
      const validHeaders = headers.filter(
        (h) => typeof h === "string" && h.trim()
      ) as string[];
      const mapping: Record<string, string> = {};
      for (const header of validHeaders) {
        const lower = header.toLowerCase();
        if (lower.includes("roll")) mapping.rollNo ??= header;
        else if (
          lower.includes("name") &&
          !lower.includes("father") &&
          !lower.includes("mother")
        )
          mapping.name ??= header;
        else if (lower.includes("gender") || lower.includes("sex"))
          mapping.gender ??= header;
        else if (lower.includes("soe") || lower.includes("state"))
          mapping.soe ??= header;
      }
      setFile(picked);
      setHeaderKeys(validHeaders);
      setSheetData(rows as string[][]);
      setFieldMapping(mapping);
    } catch {
      toast.error("Couldn't read that file. Upload an .xlsx sheet.");
    }
  };

  const updateRoom = (id: number, field: "capacity" | "count", value: string) =>
    setRoomTypes((types) =>
      types.map((t) =>
        t.id === id ? { ...t, [field]: Math.max(0, Number(value) || 0) } : t
      )
    );

  const uniqueSoeValues = useMemo(() => {
    const col = headerKeys.indexOf(fieldMapping.soe ?? "");
    if (col === -1) return [];
    return Array.from(new Set(sheetData.map((row) => row[col]))).filter(
      Boolean
    );
  }, [fieldMapping, headerKeys, sheetData]);

  const totalCapacity = roomTypes.reduce((a, r) => a + r.capacity * r.count, 0);
  const missing = REQUIRED_FIELDS.filter((f) => !fieldMapping[f.key]);
  const checks = [
    {
      done: !!file,
      label: `Student list uploaded${file ? ` (${sheetData.length} rows)` : ""}`,
    },
    { done: !!file && missing.length === 0, label: "Required columns matched" },
    { done: !!targetGender, label: "Hostel gender chosen" },
    { done: totalCapacity > 0, label: `Rooms defined (${totalCapacity} beds)` },
  ];
  const ready = checks.every((c) => c.done);

  const handleSubmit = async () => {
    if (!file || !ready) return;
    const apiMapping: Record<string, string> = {};
    for (const [role, header] of Object.entries(fieldMapping)) {
      if (header) apiMapping[header] = role;
    }
    const roomDistribution: Record<string, number> = {};
    for (const r of roomTypes) {
      if (r.count > 0 && r.capacity > 0) {
        roomDistribution[String(r.capacity)] =
          (roomDistribution[String(r.capacity)] ?? 0) + r.count;
      }
    }

    const formData = new FormData();
    formData.append("fieldMapping", JSON.stringify(apiMapping));
    formData.append("file", file);
    formData.append("roomDistribution", JSON.stringify(roomDistribution));
    formData.append("genderKey", fieldMapping.gender);
    formData.append("gender", targetGender);
    formData.append("soeKey", fieldMapping.soe);
    if (soePriority) formData.append("soePriority", soePriority);
    formData.append(
      "extraFields",
      JSON.stringify([fieldMapping.gender, fieldMapping.soe])
    );

    setLoading(true);
    try {
      const res = await fetch(
        `/api/hostel/allotment/rooms-from-excel?slug=${encodeURIComponent(slug)}`,
        { method: "POST", body: formData }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message ||
            `The allotment server returned an error (HTTP ${res.status})`
        );
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Allotment failed");
      await downloadAllotmentAsExcelNative(data.allocation, targetGender, []);
      toast.success("Allotment done. The sheet is downloading.");
    } catch (error) {
      // fetch rejects with a TypeError only when the server can't be reached at all.
      toast.error(
        error instanceof TypeError
          ? "Couldn't reach the allotment server. It may be down; try again in a minute."
          : error instanceof Error
            ? error.message
            : "Allotment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const panel =
    "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background";

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={FileSpreadsheet}
        titleNode="Allot rooms from a sheet"
        descriptionNode="Upload a fresher list, describe the rooms, and download a room-wise allotment grouped by state."
      />

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-3">
        <div className="flex flex-col gap-6 @4xl:col-span-2">
          <section className={panel} aria-labelledby="source-heading">
            <h2
              id="source-heading"
              className="text-subheading font-medium text-foreground"
            >
              1. Student list
            </h2>
            {!file ? (
              <label
                htmlFor={fileId}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-10 text-center transition-colors duration-150 hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring"
              >
                <span className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground">
                  <FileSpreadsheet className="size-5" aria-hidden="true" />
                </span>
                <span className="text-body font-medium text-foreground">
                  Choose an .xlsx file
                </span>
                <input
                  id={fileId}
                  type="file"
                  accept=".xlsx"
                  className="sr-only"
                  onChange={(e) => handleExcelUpload(e.target.files?.[0])}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {sheetData.length} rows
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  Remove
                </Button>
              </div>
            )}
          </section>

          {file && (
            <section className={panel} aria-labelledby="mapping-heading">
              <h2
                id="mapping-heading"
                className="text-subheading font-medium text-foreground"
              >
                2. Match columns
              </h2>
              <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
                {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map((field) => {
                  const required = REQUIRED_FIELDS.some(
                    (f) => f.key === field.key
                  );
                  return (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <Label htmlFor={`field-${field.key}`}>
                        {field.label}{" "}
                        <span className="font-normal text-muted-foreground">
                          {required ? "(required)" : "(optional)"}
                        </span>
                      </Label>
                      <Select
                        value={fieldMapping[field.key] || ""}
                        onValueChange={(val) =>
                          setFieldMapping((prev) => ({
                            ...prev,
                            [field.key]: val,
                          }))
                        }
                      >
                        <SelectTrigger id={`field-${field.key}`}>
                          <SelectValue placeholder="Pick a column" />
                        </SelectTrigger>
                        <SelectContent>
                          {headerKeys.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className={panel} aria-labelledby="rooms-heading">
            <div className="space-y-1">
              <h2
                id="rooms-heading"
                className="text-subheading font-medium text-foreground"
              >
                3. Rooms available
              </h2>
              <p className="text-body text-muted-foreground">
                How many rooms of each size this batch can fill.
              </p>
            </div>
            {roomTypes.map((room) => (
              <div key={room.id} className="flex items-end gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor={`cap-${room.id}`}>Beds per room</Label>
                  <Input
                    id={`cap-${room.id}`}
                    type="number"
                    min={1}
                    max={7}
                    value={room.capacity}
                    onChange={(e) =>
                      updateRoom(room.id, "capacity", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor={`count-${room.id}`}>Number of rooms</Label>
                  <Input
                    id={`count-${room.id}`}
                    type="number"
                    min={0}
                    value={room.count}
                    onChange={(e) =>
                      updateRoom(room.id, "count", e.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove this room size"
                  disabled={roomTypes.length === 1}
                  onClick={() =>
                    setRoomTypes((types) =>
                      types.filter((t) => t.id !== room.id)
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-fit"
              onClick={() =>
                setRoomTypes((types) => [
                  ...types,
                  { id: Date.now(), capacity: 2, count: 0 },
                ])
              }
            >
              <Plus aria-hidden="true" /> Add a room size
            </Button>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className={panel} aria-labelledby="config-heading">
            <h2
              id="config-heading"
              className="text-subheading font-medium text-foreground"
            >
              4. Batch settings
            </h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="target-gender">Hostel gender</Label>
              <Select value={targetGender} onValueChange={setTargetGender}>
                <SelectTrigger id="target-gender">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_VALUES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-caption text-muted-foreground">
                Only rows with this gender are allotted.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="soe-priority">Home state to group first</Label>
              <Select
                value={soePriority}
                onValueChange={setSoePriority}
                disabled={!fieldMapping.soe}
              >
                <SelectTrigger id="soe-priority">
                  <SelectValue
                    placeholder={
                      fieldMapping.soe
                        ? "Optional"
                        : "Match the state column first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSoeValues.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className={panel} aria-labelledby="ready-heading">
            <h2
              id="ready-heading"
              className="text-body-lg font-medium text-foreground"
            >
              Before you run
            </h2>
            <ul className="flex flex-col gap-2 text-body">
              {checks.map((c) => (
                <li
                  key={c.label}
                  className={cn(
                    "flex items-center gap-2",
                    c.done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {c.done ? (
                    <CircleCheck
                      className="size-4 text-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle className="size-4" aria-hidden="true" />
                  )}
                  <span>
                    {c.label}
                    <span className="sr-only">
                      {c.done ? ", done" : ", to do"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {file && missing.length > 0 && (
              <p className="text-caption text-muted-foreground">
                Still to match: {missing.map((m) => m.label).join(", ")}
              </p>
            )}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || !ready}
            >
              {loading && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              {loading ? "Allotting" : "Run allotment"}
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
