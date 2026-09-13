"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleCheck,
  CircleDot,
  History,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { type FieldErrors, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { saveCourse } from "../actions";
import {
  BasicsSection,
  CreditsSection,
  OutcomesSection,
  ReferencesSection,
  UnitsSection,
} from "./course-sections";
import { type CourseFormValues, courseFormSchema, EMPTY_COURSE } from "./schema";
import { useUnsavedGuard } from "./use-unsaved-guard";

const ImportCourses = dynamic(() => import("./import-courses"), {
  ssr: false,
});

const DRAFT_KEY = "course-editor:new-draft";

const SECTIONS = [
  { id: "basics", label: "Basics", fields: ["name", "code", "department"] },
  { id: "credits", label: "Credits and type", fields: ["type", "credits"] },
  { id: "outcomes", label: "Outcomes", fields: ["outcomes"] },
  { id: "units", label: "Syllabus units", fields: ["chapters"] },
  { id: "references", label: "References", fields: ["books", "papers"] },
] as const;

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
});

/** Counts leaf messages; skips `ref`, which holds a DOM node. */
function countErrors(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  if ("message" in node && typeof node.message === "string") return 1;
  return Object.entries(node).reduce(
    (sum, [key, value]) => (key === "ref" ? sum : sum + countErrors(value)),
    0
  );
}

type Draft = { savedAt: number; values: CourseFormValues };

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft;
    return draft?.values ? draft : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // storage blocked; nothing to clear
  }
}

type CourseEditorProps = {
  moderator: string;
  readOnly?: boolean;
} & (
  | { mode: "create"; allowImport?: boolean }
  | {
      mode: "edit";
      courseId: string;
      initialCode: string;
      defaultValues: CourseFormValues;
    }
);

export function CourseEditor(props: CourseEditorProps) {
  const { mode, moderator, readOnly = false } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: mode === "edit" ? props.defaultValues : EMPTY_COURSE,
    mode: "onTouched",
  });
  const { errors, isDirty, submitCount } = form.formState;
  const values = useWatch({ control: form.control });

  useUnsavedGuard(mode === "edit" && isDirty && !isPending);

  useEffect(() => {
    if (mode !== "create") return;
    setPendingDraft(readDraft());
  }, [mode]);

  // Drafts live in this browser only; a successful create clears them.
  useEffect(() => {
    if (mode !== "create" || readOnly) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const subscription = form.watch((next) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const savedAt = Date.now();
          window.localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ savedAt, values: next })
          );
          setDraftSavedAt(savedAt);
          setPendingDraft(null);
        } catch {
          // storage full or blocked; the form still works without drafts
        }
      }, 800);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [form, mode, readOnly]);

  useEffect(() => {
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting);
        }
        const first = SECTIONS.find((s) => visible.get(s.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-10% 0px -55% 0px" }
    );
    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const onValid = (data: CourseFormValues) => {
    startTransition(async () => {
      const result = await saveCourse(
        data,
        mode === "edit" ? props.courseId : undefined
      );
      if (!result.ok) {
        if (result.field) {
          form.setError(
            result.field,
            { message: result.error },
            { shouldFocus: true }
          );
        }
        toast.error(result.error);
        return;
      }
      if (mode === "create") {
        clearDraft();
        form.reset(data);
        toast.success(`${result.code} created`);
        router.push(`/${moderator}/courses/${encodeURIComponent(result.code)}`);
        return;
      }
      form.reset(data);
      toast.success("Changes saved");
      if (result.code !== props.initialCode) {
        router.replace(
          `/${moderator}/courses/${encodeURIComponent(result.code)}`
        );
      } else {
        router.refresh();
      }
    });
  };

  const onInvalid = (invalid: FieldErrors<CourseFormValues>) => {
    const n = countErrors(invalid);
    toast.error(`Fix ${n} ${n === 1 ? "field" : "fields"} before saving`);
  };

  const discard = () => {
    if (!window.confirm("Discard your unsaved changes?")) return;
    form.reset();
  };

  const status = isPending ? (
    <>
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      Saving...
    </>
  ) : submitCount > 0 && Object.keys(errors).length > 0 ? (
    <>
      <TriangleAlert className="size-4 text-destructive" aria-hidden="true" />
      {countErrors(errors)} to fix
    </>
  ) : mode === "edit" ? (
    isDirty ? (
      <>
        <CircleDot className="size-4 text-warning" aria-hidden="true" />
        Unsaved changes
      </>
    ) : (
      <>
        <CircleCheck className="size-4 text-success" aria-hidden="true" />
        All changes saved
      </>
    )
  ) : draftSavedAt ? (
    <>
      <CircleCheck className="size-4 text-success" aria-hidden="true" />
      Draft kept on this device at {timeFormat.format(draftSavedAt)}
    </>
  ) : (
    "Not saved yet"
  );

  const sectionMeta = (id: (typeof SECTIONS)[number]["id"]) => {
    if (id === "outcomes") return values.outcomes?.length ?? 0;
    if (id === "units") return values.chapters?.length ?? 0;
    if (id === "references")
      return (values.books?.length ?? 0) + (values.papers?.length ?? 0);
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {pendingDraft && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-background"
        >
          <p className="flex items-start gap-3 text-body text-foreground">
            <History
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span>
              You have an unsaved draft from{" "}
              {new Date(pendingDraft.savedAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              {pendingDraft.values.name ? `: ${pendingDraft.values.name}` : ""}.
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                clearDraft();
                setPendingDraft(null);
              }}
            >
              Discard draft
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                form.reset({ ...EMPTY_COURSE, ...pendingDraft.values });
                setPendingDraft(null);
              }}
            >
              Restore draft
            </Button>
          </div>
        </div>
      )}

      {mode === "create" && props.allowImport && !readOnly && (
        <ImportCourses
          onReview={(course) => {
            form.reset(course);
            document.getElementById("basics")?.scrollIntoView();
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav
          aria-label="Course form sections"
          className="sticky top-6 hidden self-start lg:block"
        >
          <ol className="flex flex-col gap-0.5">
            {SECTIONS.map((section, i) => {
              const sectionErrors = section.fields.reduce(
                (sum, field) => sum + countErrors(errors[field]),
                0
              );
              const meta = sectionMeta(section.id);
              const current = active === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? "location" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-lg px-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                      current
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="w-4 shrink-0 text-caption tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {section.label}
                    </span>
                    {sectionErrors > 0 ? (
                      <span className="flex items-center gap-1 text-caption font-medium text-destructive">
                        <TriangleAlert className="size-3.5" aria-hidden="true" />
                        {sectionErrors}
                        <span className="sr-only"> to fix</span>
                      </span>
                    ) : (
                      meta !== null && (
                        <span className="text-caption tabular-nums text-muted-foreground">
                          {meta}
                        </span>
                      )
                    )}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onValid, onInvalid)}
            className="flex min-w-0 flex-col gap-6"
          >
            <fieldset
              disabled={readOnly || isPending}
              className="flex min-w-0 flex-col gap-6 border-0 p-0"
            >
              <BasicsSection
                mode={mode}
                initialCode={mode === "edit" ? props.initialCode : undefined}
              />
              <CreditsSection />
              <OutcomesSection />
              <UnitsSection />
              <ReferencesSection />
            </fieldset>

            {!readOnly && (
              <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between dark:bg-background">
                <p
                  aria-live="polite"
                  className="flex min-w-0 items-center gap-2 px-1 text-body text-muted-foreground"
                >
                  {status}
                </p>
                <div className="flex shrink-0 items-center justify-end gap-2">
                  {mode === "edit" && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!isDirty || isPending}
                      onClick={discard}
                    >
                      Discard changes
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isPending || (mode === "edit" && !isDirty)}
                  >
                    {isPending && (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    )}
                    {mode === "create" ? "Create course" : "Save changes"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
