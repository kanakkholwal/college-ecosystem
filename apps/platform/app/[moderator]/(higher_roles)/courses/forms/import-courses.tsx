"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  CircleCheck,
  FileUp,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import toast from "@/lib/toast";
import type { z } from "zod";
import type { courseSchemaByOCR } from "~/constants/common.course";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import { importCourses } from "../actions";
import {
  type CourseFormValues,
  courseFormSchema,
  EMPTY_COURSE,
} from "./schema";

type Extracted = z.infer<typeof courseSchemaByOCR>;
type Candidate = {
  uid: string;
  values: CourseFormValues;
  problem: string | null;
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function matchDepartment(raw: string) {
  const needle = raw.trim().toLowerCase();
  const match = DEPARTMENTS_LIST.find(
    (d) =>
      d.name.toLowerCase() === needle ||
      d.short.toLowerCase() === needle ||
      d.code === needle
  );
  return match?.name ?? raw.trim();
}

function toCandidate(course: Extracted): Candidate {
  const values: CourseFormValues = {
    ...EMPTY_COURSE,
    name: course.name ?? "",
    code: course.code ?? "",
    department: matchDepartment(course.department ?? ""),
    type: course.type ?? "",
    credits: Number.isInteger(course.credits) ? course.credits : Number.NaN,
    outcomes: (course.outcomes ?? []).map((value) => ({ value })),
    chapters: (course.chapters ?? []).map((c) => ({
      title: c.title,
      lectures: Number.isInteger(c.lectures) ? c.lectures : 0,
      topics: (c.topics ?? []).join("\n"),
    })),
  };
  const parsed = courseFormSchema.safeParse(values);
  return {
    uid: crypto.randomUUID(),
    values,
    problem: parsed.success
      ? null
      : `${parsed.error.issues[0].path.join(" ")}: ${parsed.error.issues[0].message}`,
  };
}

/** Admin-only: the parsing API rejects everyone else. */
export default function ImportCourses({
  onReview,
}: {
  onReview: (values: CourseFormValues) => void;
}) {
  const router = useRouter();
  const inputId = useId();
  const [file, setFile] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [extracting, setExtracting] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    setCandidates(null);
    setFile(null);
    if (!picked) return;
    if (picked.size > MAX_FILE_BYTES) {
      toast.error("Pick a file under 8 MB");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () =>
      setFile(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(picked);
  };

  const extract = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      const response = await fetch("/api/parsing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: [file], type: "courses" }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Extraction failed"
        );
      }
      const list = ((data.courses ?? []) as Extracted[]).map(toCandidate);
      setCandidates(list);
      setSelected(
        new Set(list.flatMap((c, i) => (c.problem === null ? [i] : [])))
      );
      if (list.length === 0) toast.error("No courses found in that document");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't read the document"
      );
    } finally {
      setExtracting(false);
    }
  };

  const toggle = (index: number, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(index);
      else next.delete(index);
      return next;
    });

  const saveSelected = () => {
    if (!candidates) return;
    const items = [...selected].map((i) => candidates[i].values);
    startSaving(async () => {
      const { saved, failed } = await importCourses(items);
      if (saved.length) {
        toast.success(
          `Saved ${saved.length} ${saved.length === 1 ? "course" : "courses"}`
        );
      }
      if (failed.length) {
        toast.error(
          `Couldn't save ${failed.join(", ")}. Review them in the form.`
        );
      }
      setCandidates((prev) =>
        prev ? prev.filter((c) => !saved.includes(c.values.code)) : prev
      );
      setSelected(new Set());
      router.refresh();
    });
  };

  return (
    <details className="group rounded-2xl border border-border bg-card dark:bg-background">
      <summary className="flex h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <FileUp className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-body font-medium text-foreground">
            Import from a syllabus document
          </span>
          <span className="text-caption text-muted-foreground">
            PDF or image
          </span>
        </span>
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="flex flex-col gap-5 border-t border-border p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor={inputId} className="mb-0 text-body text-foreground">
              Document
            </Label>
            <Input
              id={inputId}
              type="file"
              accept="image/*,application/pdf"
              onChange={onFile}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={extract}
            disabled={!file || extracting}
          >
            {extracting && (
              <Loader2 className="animate-spin" aria-hidden="true" />
            )}
            {extracting ? "Reading document..." : "Find courses"}
          </Button>
        </div>
        <p className="text-caption text-muted-foreground">
          Extraction can take up to a minute. Nothing is saved until you choose.
        </p>

        {candidates && candidates.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-body font-medium text-foreground">
              {candidates.length} found, {selected.size} selected
            </h2>
            <ul className="flex flex-col gap-2">
              {candidates.map((candidate, index) => {
                const id = `${inputId}-${index}`;
                const ready = candidate.problem === null;
                return (
                  <li
                    key={candidate.uid}
                    className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
                  >
                    <Checkbox
                      id={id}
                      checked={selected.has(index)}
                      disabled={!ready || isSaving}
                      onCheckedChange={(on) => toggle(index, on === true)}
                    />
                    <label htmlFor={id} className="min-w-0 flex-1">
                      <span className="block truncate text-body font-medium text-foreground">
                        <span className="font-mono">
                          {candidate.values.code || "No code"}
                        </span>{" "}
                        {candidate.values.name || "Untitled"}
                      </span>
                      <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
                        {ready ? (
                          <>
                            <CircleCheck
                              className="size-3.5 text-success"
                              aria-hidden="true"
                            />
                            Ready, {candidate.values.chapters.length} units
                          </>
                        ) : (
                          <>
                            <TriangleAlert
                              className="size-3.5 text-warning"
                              aria-hidden="true"
                            />
                            Needs review: {candidate.problem}
                          </>
                        )}
                      </span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onReview(candidate.values)}
                    >
                      Review in form
                    </Button>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                disabled={selected.size === 0 || isSaving}
                onClick={saveSelected}
              >
                {isSaving && (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                )}
                Save {selected.size}{" "}
                {selected.size === 1 ? "course" : "courses"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
