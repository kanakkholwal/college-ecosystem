"use client";

import { Panel } from "@/components/application/dashboard/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  CircleSlash,
  FileSpreadsheet,
  UploadCloud,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CountTile,
  ErrorTable,
  InlineError,
  JobProgress,
  StepIndicator,
} from "../_components/job-ui";
import {
  type ImportRow,
  importFreshersChunk,
  previewFreshersImport,
  type SkippedRow,
} from "./actions";

const STEPS = ["Upload", "Map columns", "Review", "Import", "Summary"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 3000;
const CHUNK = 100;
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const NOT_MAPPED = "__none__";

type Field = "name" | "rollNo" | "gender";
const FIELDS: { key: Field; label: string; required: boolean; hint: string }[] =
  [
    {
      key: "rollNo",
      label: "Roll number",
      required: true,
      hint: "e.g. 25bcs001",
    },
    { key: "name", label: "Student name", required: true, hint: "Full name" },
    {
      key: "gender",
      label: "Gender",
      required: false,
      hint: "male/female or M/F; blank becomes not specified",
    },
  ];

const SYNONYMS: Record<
  Field,
  { exact: string[]; contains: string[]; avoid: string[] }
> = {
  rollNo: {
    exact: ["roll no", "roll number", "rollno", "roll", "roll no."],
    contains: ["roll", "enrol"],
    avoid: [],
  },
  name: {
    exact: ["name", "student name", "full name", "name of student"],
    contains: ["name"],
    avoid: ["father", "mother", "guardian", "branch", "course", "file"],
  },
  gender: { exact: ["gender", "sex"], contains: ["gender", "sex"], avoid: [] },
};

type Mapping = Record<Field, string>;
type Sheet = {
  fileName: string;
  size: number;
  headers: string[];
  rows: string[][];
};
type Phase = "upload" | "map" | "review" | "import" | "summary";

function guessMapping(headers: string[]): Mapping {
  const normal = headers.map((h) =>
    h
      .toLowerCase()
      .replace(/[_\s]+/g, " ")
      .trim()
  );
  const pick = (field: Field) => {
    const { exact, contains, avoid } = SYNONYMS[field];
    const exactIdx = normal.findIndex((h) => exact.includes(h));
    if (exactIdx >= 0) return headers[exactIdx];
    const looseIdx = normal.findIndex(
      (h) =>
        contains.some((c) => h.includes(c)) && !avoid.some((a) => h.includes(a))
    );
    return looseIdx >= 0 ? headers[looseIdx] : "";
  };
  return { rollNo: pick("rollNo"), name: pick("name"), gender: pick("gender") };
}

function toGender(value: string): ImportRow["gender"] {
  const v = value.trim().toLowerCase();
  if (v === "male" || v === "m") return "male";
  if (v === "female" || v === "f") return "female";
  return "not_specified";
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toErrorRows(rows: SkippedRow[]) {
  return rows.map((r) => ({
    rollNo: `${r.rollNo || "(empty)"}, row ${r.row}`,
    error: r.reason,
  }));
}

export function FreshersImporter({ scrapeHref }: { scrapeHref: string }) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [mapping, setMapping] = useState<Mapping>({
    name: "",
    rollNo: "",
    gender: "",
  });
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [plan, setPlan] = useState<{
    ready: ImportRow[];
    skipped: SkippedRow[];
  } | null>(null);
  const [progress, setProgress] = useState({ done: 0, imported: 0 });
  const [report, setReport] = useState<{
    imported: number;
    skipped: SkippedRow[];
    failed: SkippedRow[];
    cancelled: boolean;
  } | null>(null);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase("upload");
    setSheet(null);
    setFileError(null);
    setPlan(null);
    setReport(null);
    setCheckError(null);
    setMapping({ name: "", rollNo: "", gender: "" });
    if (inputRef.current) inputRef.current.value = "";
  };

  const readFile = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    if (
      !file.name.toLowerCase().endsWith(".xlsx") ||
      (file.type && file.type !== XLSX_MIME)
    ) {
      setFileError(
        `"${file.name}" isn't an .xlsx workbook. Save it as Excel Workbook (.xlsx) and try again.`
      );
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError(
        `"${file.name}" is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_BYTES)}.`
      );
      return;
    }
    setReading(true);
    try {
      const { readSheet } = await import("read-excel-file/browser");
      const raw = await readSheet(file);
      const cells = raw
        .map((row) =>
          row.map((cell) => (cell == null ? "" : String(cell).trim()))
        )
        .filter((row) => row.some((cell) => cell !== ""));
      const headers = (cells[0] ?? []).map((h, i) => h || `Column ${i + 1}`);
      const rows = cells.slice(1);
      if (headers.length === 0 || rows.length === 0) {
        setFileError(
          "The first sheet needs a header row and at least one student row."
        );
        return;
      }
      if (rows.length > MAX_ROWS) {
        setFileError(
          `The sheet has ${rows.length.toLocaleString("en-IN")} rows; split it into files of ${MAX_ROWS.toLocaleString("en-IN")} or fewer.`
        );
        return;
      }
      if (new Set(headers).size !== headers.length) {
        setFileError(
          "Two columns share the same header. Rename one so each column can be mapped."
        );
        return;
      }
      setSheet({ fileName: file.name, size: file.size, headers, rows });
      setMapping(guessMapping(headers));
      setPhase("map");
    } catch {
      setFileError(
        "Couldn't read that workbook. It may be password protected or damaged."
      );
    } finally {
      setReading(false);
    }
  };

  const mappedRows = (): ImportRow[] => {
    if (!sheet) return [];
    const idx = (field: Field) =>
      mapping[field] ? sheet.headers.indexOf(mapping[field]) : -1;
    const [n, r, g] = [idx("name"), idx("rollNo"), idx("gender")];
    return sheet.rows.map((row, i) => ({
      row: i + 2,
      name: n >= 0 ? (row[n] ?? "") : "",
      rollNo: r >= 0 ? (row[r] ?? "") : "",
      gender: g >= 0 ? toGender(row[g] ?? "") : "not_specified",
    }));
  };

  const mappingComplete = FIELDS.every((f) => !f.required || mapping[f.key]);
  const mappingClash =
    new Set(Object.values(mapping).filter(Boolean)).size !==
    Object.values(mapping).filter(Boolean).length;

  const check = async () => {
    setChecking(true);
    setCheckError(null);
    const res = await previewFreshersImport(mappedRows());
    setChecking(false);
    if (!res.ok) {
      setCheckError(res.error);
      return;
    }
    setPlan(res.data);
    setPhase("review");
  };

  const runImport = async () => {
    if (!plan) return;
    cancelRef.current = false;
    setPhase("import");
    setProgress({ done: 0, imported: 0 });
    toast.info(`Importing ${plan.ready.length} students`);
    const failed: SkippedRow[] = [];
    const skipped = [...plan.skipped];
    let imported = 0;
    let done = 0;
    for (let i = 0; i < plan.ready.length; i += CHUNK) {
      if (cancelRef.current) break;
      const chunk = plan.ready.slice(i, i + CHUNK);
      const res = await importFreshersChunk(chunk);
      if (res.ok) {
        imported += res.data.imported;
        skipped.push(...res.data.skipped);
      } else {
        failed.push(
          ...chunk.map((r) => ({
            row: r.row,
            rollNo: r.rollNo,
            reason: res.error,
          }))
        );
      }
      done += chunk.length;
      setProgress({ done, imported });
    }
    const notSent = plan.ready.slice(done).map((r) => ({
      row: r.row,
      rollNo: r.rollNo,
      reason: "Not sent, import was cancelled",
    }));
    setReport({
      imported,
      skipped: skipped.sort((a, b) => a.row - b.row),
      failed: [...failed, ...notSent],
      cancelled: cancelRef.current,
    });
    setPhase("summary");
  };

  const stepIndex = { upload: 0, map: 1, review: 2, import: 3, summary: 4 }[
    phase
  ];
  const preview = phase === "map" ? mappedRows().slice(0, 5) : [];
  const unknownGender =
    plan?.ready.filter((r) => r.gender === "not_specified").length ?? 0;

  return (
    <Panel as="section" className="flex flex-col gap-6">
      <StepIndicator steps={STEPS} current={stepIndex} label="Import steps" />

      {phase === "upload" && (
        <div className="flex flex-col gap-4">
          <label
            htmlFor="freshers-file"
            className={cn(
              "flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-10 text-center transition-colors duration-150 hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring",
              reading && "pointer-events-none opacity-60"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              readFile(e.dataTransfer.files?.[0]);
            }}
          >
            <span className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground">
              <UploadCloud className="size-5" aria-hidden="true" />
            </span>
            <span className="text-body-lg font-medium text-foreground">
              {reading ? "Reading workbook" : "Choose or drop an Excel file"}
            </span>
            <span className="text-body text-muted-foreground">
              .xlsx only, up to {formatBytes(MAX_BYTES)} and{" "}
              {MAX_ROWS.toLocaleString("en-IN")} rows. The first sheet&apos;s
              first row must be headers.
            </span>
            <input
              ref={inputRef}
              id="freshers-file"
              type="file"
              accept={`.xlsx,${XLSX_MIME}`}
              className="sr-only"
              disabled={reading}
              onChange={(e) => readFile(e.target.files?.[0])}
            />
          </label>
          {fileError && <InlineError>{fileError}</InlineError>}
          <p className="text-caption text-muted-foreground">
            Needed columns: roll number and name. Gender is optional. Nothing is
            saved until the Import step.
          </p>
        </div>
      )}

      {phase === "map" && sheet && (
        <div className="flex flex-col gap-6">
          <FileChip sheet={sheet} onRemove={reset} />

          <div className="flex flex-col gap-2">
            <p className="text-caption text-muted-foreground">Columns found</p>
            <ul className="flex flex-wrap gap-1.5">
              {sheet.headers.map((h) => (
                <li
                  key={h}
                  className="rounded-md border border-border px-2 py-0.5 text-caption text-foreground"
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-body-lg font-medium text-foreground">
              Match columns to fields
            </legend>
            {FIELDS.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-1 items-center gap-2 @xl:grid-cols-[12rem_1fr]"
              >
                <Label
                  htmlFor={`map-${field.key}`}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="text-body font-medium text-foreground">
                    {field.label}
                    {field.required ? (
                      <span className="text-destructive">
                        {" "}
                        *<span className="sr-only">required</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground"> (optional)</span>
                    )}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {field.hint}
                  </span>
                </Label>
                <Select
                  value={mapping[field.key] || NOT_MAPPED}
                  onValueChange={(value) =>
                    setMapping((prev) => ({
                      ...prev,
                      [field.key]: value === NOT_MAPPED ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger id={`map-${field.key}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NOT_MAPPED}>Not mapped</SelectItem>
                    {sheet.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </fieldset>
          {mappingClash && (
            <InlineError>Each column can map to one field only.</InlineError>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-body font-medium text-foreground">
              First {preview.length} of{" "}
              {sheet.rows.length.toLocaleString("en-IN")} rows
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-md text-left text-body">
                <thead className="border-b border-border text-caption text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Row
                    </th>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Roll number
                    </th>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Gender
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((row) => (
                    <tr key={row.row}>
                      <td className="px-4 py-2 tabular-nums text-muted-foreground">
                        {row.row}
                      </td>
                      <td className="px-4 py-2 font-mono text-foreground">
                        {row.rollNo || <Missing />}
                      </td>
                      <td className="max-w-48 truncate px-4 py-2 text-foreground">
                        {row.name || <Missing />}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {row.gender === "not_specified"
                          ? "Not specified"
                          : row.gender === "male"
                            ? "Male"
                            : "Female"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {checking && (
            <JobProgress
              done={0}
              total={null}
              label={`Checking ${sheet.rows.length.toLocaleString("en-IN")} rows against the database`}
            />
          )}
          {checkError && <InlineError>{checkError}</InlineError>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={reset} disabled={checking}>
              Choose another file
            </Button>
            <Button
              variant="primary"
              onClick={check}
              disabled={!mappingComplete || mappingClash || checking}
            >
              Check rows
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {phase === "review" && plan && sheet && (
        <div className="flex flex-col gap-4">
          <FileChip sheet={sheet} onRemove={reset} />
          <dl className="grid grid-cols-1 gap-2 @xl:grid-cols-3">
            <CountTile
              label="Will be created"
              value={plan.ready.length}
              tone="success"
            />
            <CountTile
              label="Will be skipped"
              value={plan.skipped.length}
              tone={plan.skipped.length > 0 ? "warning" : "neutral"}
            />
            <CountTile label="Gender not specified" value={unknownGender} />
          </dl>
          <ul className="flex flex-col gap-2 rounded-xl border border-border p-4 text-body text-foreground">
            <li>
              Creates one record per ready row with no semesters, and branch,
              batch and programme read from the roll number.
            </li>
            <li>
              Existing records are never overwritten; they are listed as
              skipped.
            </li>
            <li>New records get results once you scrape the Freshers list.</li>
          </ul>
          {plan.skipped.length > 0 && (
            <ErrorTable errors={toErrorRows(plan.skipped)} />
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setPhase("map")}>
              Back to mapping
            </Button>
            <Button
              variant="primary"
              onClick={runImport}
              disabled={plan.ready.length === 0}
            >
              Import {plan.ready.length.toLocaleString("en-IN")} students
            </Button>
          </div>
        </div>
      )}

      {phase === "import" && plan && (
        <div className="flex flex-col gap-4" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-body-lg font-medium text-foreground">
              Importing students
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                cancelRef.current = true;
                toast.info("Stopping after the current batch");
              }}
            >
              Cancel
            </Button>
          </div>
          <JobProgress
            done={progress.done}
            total={plan.ready.length}
            label="Rows sent"
          />
          <dl className="grid grid-cols-2 gap-2">
            <CountTile
              label="Created"
              value={progress.imported}
              tone="success"
            />
            <CountTile
              label="Remaining"
              value={plan.ready.length - progress.done}
            />
          </dl>
          <p className="text-caption text-muted-foreground">
            Sent in batches of {CHUNK}. Cancelling stops before the next batch;
            rows already sent stay created.
          </p>
        </div>
      )}

      {phase === "summary" && report && (
        <div className="flex flex-col gap-4" aria-live="polite">
          <div className="flex items-start gap-3">
            {report.cancelled ? (
              <CircleSlash
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-success"
                aria-hidden="true"
              />
            )}
            <div>
              <h2 className="text-body-lg font-medium text-foreground">
                {report.cancelled ? "Import cancelled" : "Import finished"}
              </h2>
              <p className="text-body text-muted-foreground">
                {report.imported.toLocaleString("en-IN")} records created from{" "}
                {sheet?.fileName}.
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-2 @xl:grid-cols-3">
            <CountTile label="Created" value={report.imported} tone="success" />
            <CountTile
              label="Skipped"
              value={report.skipped.length}
              tone={report.skipped.length > 0 ? "warning" : "neutral"}
            />
            <CountTile
              label="Failed"
              value={report.failed.length}
              tone={report.failed.length > 0 ? "destructive" : "neutral"}
            />
          </dl>
          {report.failed.length + report.skipped.length > 0 && (
            <ErrorTable
              errors={toErrorRows([...report.failed, ...report.skipped])}
            />
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
            {report.imported > 0 && (
              <ButtonLink href={scrapeHref} variant="primary">
                Scrape their results
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

function Missing() {
  return <span className="text-destructive">Missing</span>;
}

function FileChip({ sheet, onRemove }: { sheet: Sheet; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground">
          <FileSpreadsheet className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-foreground">
            {sheet.fileName}
          </p>
          <p className="text-caption text-muted-foreground">
            {formatBytes(sheet.size)},{" "}
            {sheet.rows.length.toLocaleString("en-IN")} rows,{" "}
            {sheet.headers.length} columns
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon_sm"
        onClick={onRemove}
        aria-label="Remove file and start over"
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}
