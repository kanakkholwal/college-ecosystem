"use client";

import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  FileSpreadsheet,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import toast from "@/lib/toast";
import { readSheet as readXlsxFile } from "read-excel-file/browser";
import BaseSearchBox from "@/components/application/base-search";
import type { FilterOption } from "@/components/application/filter-panel";
import { TableFrame, Td, Th } from "@/components/application/hostel/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  importResidents,
  previewResidentImport,
  type ResidentImportRow,
  type ResidentImportRowResult,
} from "~/actions/hostel.core";
import { callAction } from "~/lib/call-action";

const FILTERS: FilterOption[] = [
  {
    key: "status",
    label: "Outpass access",
    values: [
      { value: "active", label: "Allowed" },
      { value: "banned", label: "Barred" },
    ],
  },
  {
    key: "room",
    label: "Room",
    values: [
      { value: "assigned", label: "Room set" },
      { value: "unknown", label: "Room not set" },
    ],
  },
];

export function ResidentSearch() {
  return (
    <BaseSearchBox
      id="resident-search"
      searchPlaceholder="Search by name, roll number or room"
      filterOptions={FILTERS}
      filterDialogTitle="Filter residents"
      filterDialogDescription="Narrow by outpass access or whether a room is set."
      className="max-w-none"
    />
  );
}

type Mapping = { rollNo: string; name: string; cgpi: string };

const STATUS_WORD: Record<ResidentImportRowResult["status"], string> = {
  new: "New resident",
  update: "Updates CGPI",
  move: "Moves here",
  invalid: "Problem",
  duplicate: "Duplicate",
};

const guess = (headers: string[], test: (h: string) => boolean) =>
  headers.find((h) => test(h.toLowerCase())) ?? "";

export function ImportResidents({ slug }: { slug: string }) {
  const router = useRouter();
  const fileId = useId();
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<unknown[][]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    rollNo: "",
    name: "",
    cgpi: "",
  });
  const [preview, setPreview] = useState<ResidentImportRowResult[] | null>(
    null
  );
  const [problemsOnly, setProblemsOnly] = useState(false);
  const [busy, setBusy] = useState<"check" | "import" | null>(null);
  const [result, setResult] = useState<{
    written: number;
    failed: ResidentImportRowResult[];
  } | null>(null);

  const reset = () => {
    setFileName("");
    setHeaders([]);
    setRows([]);
    setPreview(null);
    setResult(null);
    setMapping({ rollNo: "", name: "", cgpi: "" });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const [head, ...body] = await readXlsxFile(file);
      const names = head.map((h) => String(h ?? "").trim());
      const data = body.filter((r) =>
        r.some((c) => c !== null && String(c).trim() !== "")
      );
      if (data.length === 0) {
        toast.error("That sheet has a header row but no data");
        return;
      }
      setFileName(file.name);
      setHeaders(names);
      setRows(data);
      setPreview(null);
      setResult(null);
      setMapping({
        rollNo: guess(names, (h) => h.includes("roll")),
        name: guess(
          names,
          (h) =>
            h.includes("name") && !h.includes("father") && !h.includes("mother")
        ),
        cgpi: guess(names, (h) => h.includes("cgp")),
      });
    } catch {
      toast.error("Couldn't read that file. Upload an .xlsx sheet.");
    }
  };

  const payload = (): ResidentImportRow[] => {
    const at = (key: keyof Mapping) => headers.indexOf(mapping[key]);
    return rows.map((r) => ({
      rollNo: String(r[at("rollNo")] ?? ""),
      name: String(r[at("name")] ?? ""),
      cgpi: r[at("cgpi")],
    }));
  };

  const check = async () => {
    setBusy("check");
    const res = await callAction(() => previewResidentImport(slug, payload()));
    setBusy(null);
    if (!res.ok) toast.error(res.error);
    else setPreview(res.data);
  };

  const commit = async () => {
    setBusy("import");
    const res = await callAction(() => importResidents(slug, payload()));
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setResult(res.data);
    router.refresh();
  };

  const counts = useMemo(() => {
    const c = { new: 0, update: 0, move: 0, problems: 0 };
    for (const row of preview ?? []) {
      if (row.status === "invalid" || row.status === "duplicate") c.problems++;
      else c[row.status]++;
    }
    return c;
  }, [preview]);

  const mapped = Boolean(mapping.rollNo && mapping.name && mapping.cgpi);
  const step = result ? 4 : preview ? 3 : fileName ? 2 : 1;

  return (
    <section
      aria-labelledby="import-heading"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 dark:bg-background"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="import-heading"
            className="text-subheading font-medium text-foreground"
          >
            Import residents from a sheet
          </h2>
          <p className="text-body text-muted-foreground">
            Nothing is saved until you confirm. Existing residents keep their
            room and get the new CGPI.
          </p>
        </div>
        <ol className="flex gap-2 text-caption" aria-label="Import steps">
          {["Upload", "Match columns", "Review", "Done"].map((label, i) => (
            <li
              key={label}
              aria-current={step === i + 1 ? "step" : undefined}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5",
                step === i + 1
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : step > i + 1
                    ? "border-border text-foreground"
                    : "border-border text-muted-foreground"
              )}
            >
              {step > i + 1 && (
                <CircleCheck className="size-3.5" aria-hidden="true" />
              )}
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      </div>

      {step === 1 && (
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
          <span className="text-body text-muted-foreground">
            First row is the header. It needs roll number, name and CGPI
            columns.
          </span>
          <input
            id={fileId}
            type="file"
            accept=".xlsx"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-body text-muted-foreground">
            <span className="font-medium text-foreground">{fileName}</span>,{" "}
            {rows.length} rows. We matched columns by their names; check them.
          </p>
          <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-3">
            {(
              [
                ["rollNo", "Roll number"],
                ["name", "Name"],
                ["cgpi", "CGPI"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label htmlFor={`map-${key}`}>{label}</Label>
                <Select
                  value={mapping[key]}
                  onValueChange={(v) => setMapping((m) => ({ ...m, [key]: v }))}
                >
                  <SelectTrigger id={`map-${key}`}>
                    <SelectValue placeholder="Pick a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.filter(Boolean).map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="truncate text-caption text-muted-foreground">
                  First value:{" "}
                  {mapping[key]
                    ? String(
                        rows[0]?.[headers.indexOf(mapping[key])] ?? "empty"
                      )
                    : "none"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              Choose another file
            </Button>
            <Button
              variant="primary"
              onClick={check}
              disabled={!mapped || busy !== null}
            >
              {busy === "check" && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              Check rows
            </Button>
          </div>
        </div>
      )}

      {step === 3 && preview && (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-wrap gap-2 text-body" aria-label="Summary">
            <SummaryChip label="New" value={counts.new} />
            <SummaryChip label="CGPI updates" value={counts.update} />
            <SummaryChip
              label="Moving from another hostel"
              value={counts.move}
            />
            <SummaryChip
              label="Problems, skipped"
              value={counts.problems}
              problem
            />
          </ul>
          {counts.move > 0 && (
            <p className="flex items-start gap-2 text-body text-warning">
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {counts.move} students are currently in another hostel and will be
              moved here.
            </p>
          )}
          {counts.problems > 0 && (
            <label className="flex w-fit cursor-pointer items-center gap-2 text-body text-foreground">
              <input
                type="checkbox"
                checked={problemsOnly}
                onChange={(e) => setProblemsOnly(e.target.checked)}
                className="size-4 accent-primary"
              />
              Show only rows with problems
            </label>
          )}
          <PreviewTable
            rows={
              problemsOnly
                ? preview.filter(
                    (r) => r.status === "invalid" || r.status === "duplicate"
                  )
                : preview
            }
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setPreview(null)}>
              <ArrowLeft aria-hidden="true" />
              Back to columns
            </Button>
            <Button
              variant="primary"
              onClick={commit}
              disabled={
                busy !== null || counts.new + counts.update + counts.move === 0
              }
            >
              {busy === "import" && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              Import {counts.new + counts.update + counts.move} rows
            </Button>
          </div>
        </div>
      )}

      {step === 4 && result && (
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-body-lg font-medium text-foreground">
            <CircleCheck className="size-5 text-success" aria-hidden="true" />
            Saved {result.written} residents
            {result.failed.length > 0 &&
              `, ${result.failed.length} rows skipped`}
          </p>
          {result.failed.length > 0 && <PreviewTable rows={result.failed} />}
          <div className="flex justify-end">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryChip({
  label,
  value,
  problem,
}: {
  label: string;
  value: number;
  problem?: boolean;
}) {
  return (
    <li className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          problem && value > 0 ? "text-destructive" : "text-foreground"
        )}
      >
        {value}
      </span>
    </li>
  );
}

function PreviewTable({ rows }: { rows: ResidentImportRowResult[] }) {
  const shown = rows.slice(0, 200);
  return (
    <div className="flex flex-col gap-2">
      <TableFrame
        caption="Rows in the file"
        className="max-h-96 overflow-y-auto"
      >
        <thead>
          <tr>
            <Th className="w-16">Row</Th>
            <Th>Roll number</Th>
            <Th>Name</Th>
            <Th>CGPI</Th>
            <Th>Result</Th>
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => {
            const problem =
              row.status === "invalid" || row.status === "duplicate";
            return (
              <tr key={row.row} className="group/row">
                <Td className="tabular-nums text-muted-foreground">
                  {row.row}
                </Td>
                <Td className="font-mono">{row.rollNo || "empty"}</Td>
                <Td>{row.name || "empty"}</Td>
                <Td className="tabular-nums">{row.cgpi ?? "none"}</Td>
                <Td>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 font-medium",
                      problem ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {problem ? (
                      <CircleAlert className="size-4" aria-hidden="true" />
                    ) : (
                      <CircleCheck
                        className="size-4 text-success"
                        aria-hidden="true"
                      />
                    )}
                    {STATUS_WORD[row.status]}
                  </span>
                  {row.message && (
                    <span className="block text-caption text-muted-foreground">
                      {row.message}
                    </span>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableFrame>
      {rows.length > shown.length && (
        <p className="text-caption text-muted-foreground">
          Showing the first {shown.length} of {rows.length} rows.
        </p>
      )}
    </div>
  );
}
