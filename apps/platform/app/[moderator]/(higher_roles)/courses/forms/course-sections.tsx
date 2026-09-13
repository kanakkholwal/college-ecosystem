"use client";

import { EmptyNote } from "@/components/application/dashboard/primitives";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  BookMarked,
  Check,
  FileText,
  Layers,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import {
  type FieldPath,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import toast from "react-hot-toast";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import {
  COURSE_TYPES,
  type CourseFormValues,
  EXAM_TYPES,
  LIMITS,
  paperYears,
  REFERENCE_TYPES,
} from "./schema";

const labelClass = "mb-0 text-body font-medium text-foreground";

export function Section({
  id,
  title,
  description,
  meta,
  children,
}: {
  id: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-6 rounded-2xl border border-border bg-card p-5 md:p-6 dark:bg-background"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0 space-y-1">
          <h2
            id={`${id}-title`}
            className="text-body-lg font-medium text-foreground"
          >
            {title}
          </h2>
          <p className="text-body text-muted-foreground">{description}</p>
        </div>
        {meta && (
          <p className="shrink-0 text-caption tabular-nums text-muted-foreground">
            {meta}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function undoableRemove(what: string, restore: () => void) {
  toast(
    (t) => (
      <span className="flex items-center gap-3 text-body">
        {what} removed
        <button
          type="button"
          className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            restore();
            toast.dismiss(t.id);
          }}
        >
          Undo
        </button>
      </span>
    ),
    { duration: 6000 }
  );
}

function ItemToolbar({
  noun,
  index,
  count,
  onMove,
  onRemove,
}: {
  noun: string;
  index: number;
  count: number;
  onMove?: (to: number) => void;
  onRemove: () => void;
}) {
  const name = `${noun} ${index + 1}`;
  return (
    <div className="flex shrink-0 items-center gap-1">
      {onMove && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon_sm"
            disabled={index === 0}
            aria-label={`Move ${name} up`}
            onClick={() => onMove(index - 1)}
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon_sm"
            disabled={index === count - 1}
            aria-label={`Move ${name} down`}
            onClick={() => onMove(index + 1)}
          >
            <ArrowDown />
          </Button>
        </>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon_sm"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

function AddButton({
  children,
  onClick,
  count,
  limit,
}: {
  children: React.ReactNode;
  onClick: () => void;
  count: number;
  limit: number;
}) {
  const full = count >= limit;
  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        disabled={full}
        className="w-full border-dashed"
      >
        <Plus />
        {children}
      </Button>
      {full && (
        <p className="text-center text-caption text-muted-foreground">
          That's the limit of {limit}.
        </p>
      )}
    </div>
  );
}

function ArrayError({ name }: { name: keyof CourseFormValues }) {
  const {
    formState: { errors },
  } = useFormContext<CourseFormValues>();
  const error = errors[name] as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const message = error?.root?.message ?? error?.message;
  if (!message) return null;
  return (
    <p role="alert" className="text-caption font-medium text-destructive">
      {message}
    </p>
  );
}

function TextField({
  name,
  label,
  description,
  placeholder,
  className,
  inputClassName,
}: {
  name: FieldPath<CourseFormValues>;
  label: string;
  description?: React.ReactNode;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const { control } = useFormContext<CourseFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={(field.value as string) ?? ""}
              placeholder={placeholder}
              className={cn("aria-invalid:border-destructive", inputClassName)}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumberField({
  name,
  label,
  min,
  max,
  className,
}: {
  name: FieldPath<CourseFormValues>;
  label: string;
  min: number;
  max: number;
  className?: string;
}) {
  const { control } = useFormContext<CourseFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              step={1}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={Number.isNaN(field.value) ? "" : (field.value as number)}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              className="tabular-nums aria-invalid:border-destructive"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function BasicsSection({
  mode,
  initialCode,
}: {
  mode: "create" | "edit";
  initialCode?: string;
}) {
  const { control } = useFormContext<CourseFormValues>();
  const code = useWatch({ control, name: "code" });
  const department = useWatch({ control, name: "department" });
  const departments = DEPARTMENTS_LIST.map((d) => d.name);
  if (department && !departments.includes(department)) {
    departments.push(department);
  }
  const codeChanged = mode === "edit" && initialCode && code !== initialCode;

  return (
    <Section
      id="basics"
      title="Basics"
      description="How students find the course in the syllabus."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField
          name="name"
          label="Course name"
          placeholder="e.g. Data Structures and Algorithms"
          className="md:col-span-2"
        />
        <TextField
          name="code"
          label="Course code"
          placeholder="e.g. CS-201"
          inputClassName="font-mono"
          description={
            codeChanged ? (
              <span className="text-warning">
                Changing the code moves the public page to /syllabus/
                {code || "..."}. Old links stop working.
              </span>
            ) : (
              <>
                Public page: <span className="font-mono">/syllabus/</span>
                <span className="font-mono">{code || "..."}</span>
              </>
            )
          }
        />
        <FormField
          control={control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Department</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="aria-invalid:border-destructive"
                  >
                    <SelectValue placeholder="Pick a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Section>
  );
}

export function CreditsSection() {
  const { control } = useFormContext<CourseFormValues>();
  const type = useWatch({ control, name: "type" });
  const types: string[] = [...COURSE_TYPES];
  if (type && !types.includes(type)) types.push(type);

  return (
    <Section
      id="credits"
      title="Credits and type"
      description="Shown on the course card and used by the type filter."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_10rem]">
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <fieldset className="flex flex-col gap-2 border-0 p-0">
                <legend className={cn(labelClass, "mb-2")}>Course type</legend>
                <div className="flex flex-wrap gap-2">
                  {types.map((option) => {
                    const checked = field.value === option;
                    return (
                      <label
                        key={option}
                        className={cn(
                          "flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-body transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
                          checked
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-border bg-card text-foreground hover:bg-muted dark:bg-background"
                        )}
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={option}
                          checked={checked}
                          onChange={() => field.onChange(option)}
                          onBlur={field.onBlur}
                          className="sr-only"
                        />
                        {checked && (
                          <Check className="size-4" aria-hidden="true" />
                        )}
                        {option}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <FormMessage />
            </FormItem>
          )}
        />
        <NumberField name="credits" label="Credits" min={0} max={10} />
      </div>
    </Section>
  );
}

export function OutcomesSection() {
  const { control, getValues } = useFormContext<CourseFormValues>();
  const { fields, append, remove, move, insert } = useFieldArray({
    control,
    name: "outcomes",
  });

  return (
    <Section
      id="outcomes"
      title="Learning outcomes"
      description="What a student can do after the course. One outcome per line item."
      meta={`${fields.length} of ${LIMITS.outcomes}`}
    >
      <div className="flex flex-col gap-3">
        {fields.length === 0 ? (
          <EmptyNote
            icon={<ListChecks />}
            title="No outcomes yet"
            description="Optional, but they help students judge the course."
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {fields.map((item, index) => (
              <li key={item.id} className="flex items-start gap-2">
                <span className="mt-2.5 w-6 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
                  {index + 1}.
                </span>
                <FormField
                  control={control}
                  name={`outcomes.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="min-w-0 flex-1 space-y-1">
                      <FormLabel className="sr-only">
                        Outcome {index + 1}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={1}
                          placeholder="e.g. Analyse the running time of recursive algorithms"
                          className="min-h-10 resize-y aria-invalid:border-destructive"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ItemToolbar
                  noun="outcome"
                  index={index}
                  count={fields.length}
                  onMove={(to) => move(index, to)}
                  onRemove={() => {
                    const value = getValues(`outcomes.${index}`);
                    remove(index);
                    undoableRemove(`Outcome ${index + 1}`, () =>
                      insert(index, value)
                    );
                  }}
                />
              </li>
            ))}
          </ol>
        )}
        <ArrayError name="outcomes" />
        <AddButton
          count={fields.length}
          limit={LIMITS.outcomes}
          onClick={() =>
            append(
              { value: "" },
              { focusName: `outcomes.${fields.length}.value` }
            )
          }
        >
          Add an outcome
        </AddButton>
      </div>
    </Section>
  );
}

export function UnitsSection() {
  const { control, getValues } = useFormContext<CourseFormValues>();
  const { fields, append, remove, move, insert } = useFieldArray({
    control,
    name: "chapters",
  });
  const chapters = useWatch({ control, name: "chapters" }) ?? [];
  const lectures = chapters.reduce(
    (sum, c) => sum + (Number.isFinite(c?.lectures) ? c.lectures : 0),
    0
  );

  return (
    <Section
      id="units"
      title="Syllabus units"
      description="Units appear on the public syllabus in this order."
      meta={`${fields.length} ${fields.length === 1 ? "unit" : "units"}, ${lectures} ${lectures === 1 ? "lecture" : "lectures"}`}
    >
      <div className="flex flex-col gap-3">
        {fields.length === 0 ? (
          <EmptyNote
            icon={<Layers />}
            title="No units yet"
            description="Add each unit with its topics and planned lectures."
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {fields.map((item, index) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-body font-medium text-foreground">
                    Unit {index + 1}
                    {chapters[index]?.title && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {chapters[index].title}
                      </span>
                    )}
                  </h3>
                  <ItemToolbar
                    noun="unit"
                    index={index}
                    count={fields.length}
                    onMove={(to) => move(index, to)}
                    onRemove={() => {
                      const value = getValues(`chapters.${index}`);
                      remove(index);
                      undoableRemove(`Unit ${index + 1}`, () =>
                        insert(index, value)
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                  <TextField
                    name={`chapters.${index}.title`}
                    label="Title"
                    placeholder="e.g. Trees and graphs"
                  />
                  <NumberField
                    name={`chapters.${index}.lectures`}
                    label="Lectures"
                    min={0}
                    max={100}
                  />
                </div>
                <FormField
                  control={control}
                  name={`chapters.${index}.topics`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Topics</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder={
                            "Binary search trees\nAVL rotations\nBFS and DFS"
                          }
                          className="resize-y aria-invalid:border-destructive"
                        />
                      </FormControl>
                      <FormDescription>One topic per line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </li>
            ))}
          </ol>
        )}
        <ArrayError name="chapters" />
        <AddButton
          count={fields.length}
          limit={LIMITS.chapters}
          onClick={() =>
            append(
              { title: "", lectures: 0, topics: "" },
              { focusName: `chapters.${fields.length}.title` }
            )
          }
        >
          Add a unit
        </AddButton>
      </div>
    </Section>
  );
}

export function ReferencesSection() {
  const { control, getValues } = useFormContext<CourseFormValues>();
  const books = useFieldArray({ control, name: "books", keyName: "key" });
  const papers = useFieldArray({ control, name: "papers", keyName: "key" });
  const years = paperYears();

  return (
    <Section
      id="references"
      title="References"
      description="Books, links and previous papers listed on the public syllabus."
      meta={`${books.fields.length} links, ${papers.fields.length} papers`}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h3 className="text-body font-medium text-foreground">
            Books and links
          </h3>
          {books.fields.length === 0 ? (
            <EmptyNote
              icon={<BookMarked />}
              title="No books or links yet"
              description="Textbooks, reference sites, Drive folders or playlists."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {books.fields.map((item, index) => (
                <li
                  key={item.key}
                  className="flex flex-col gap-4 rounded-xl border border-border p-4"
                >
                  <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
                    <TextField
                      name={`books.${index}.name`}
                      label="Title"
                      placeholder="e.g. Introduction to Algorithms"
                    />
                    <FormField
                      control={control}
                      name={`books.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger ref={field.ref}>
                                <SelectValue placeholder="Pick a type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REFERENCE_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="sm:mt-7">
                      <ItemToolbar
                        noun="link"
                        index={index}
                        count={books.fields.length}
                        onRemove={() => {
                          const value = getValues(`books.${index}`);
                          books.remove(index);
                          undoableRemove(`Link ${index + 1}`, () =>
                            books.insert(index, value)
                          );
                        }}
                      />
                    </div>
                  </div>
                  <TextField
                    name={`books.${index}.link`}
                    label="Link"
                    placeholder="https://"
                  />
                </li>
              ))}
            </ul>
          )}
          <ArrayError name="books" />
          <AddButton
            count={books.fields.length}
            limit={LIMITS.books}
            onClick={() =>
              books.append(
                { name: "", type: "book", link: "" },
                { focusName: `books.${books.fields.length}.name` }
              )
            }
          >
            Add a book or link
          </AddButton>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-medium text-foreground">
            Previous papers
          </h3>
          {papers.fields.length === 0 ? (
            <EmptyNote
              icon={<FileText />}
              title="No papers yet"
              description="Link a public copy of each paper, for example a Drive file."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {papers.fields.map((item, index) => (
                <li
                  key={item.key}
                  className="grid grid-cols-1 items-start gap-4 rounded-xl border border-border p-4 sm:grid-cols-[7rem_10rem_minmax(0,1fr)_auto]"
                >
                  <FormField
                    control={control}
                    name={`papers.${index}.year`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Year</FormLabel>
                        <Select
                          value={
                            Number.isFinite(field.value)
                              ? String(field.value)
                              : ""
                          }
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger ref={field.ref}>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`papers.${index}.exam`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Exam</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger ref={field.ref}>
                              <SelectValue placeholder="Exam" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXAM_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TextField
                    name={`papers.${index}.link`}
                    label="Link"
                    placeholder="https://drive.google.com/..."
                  />
                  <div className="sm:mt-7">
                    <ItemToolbar
                      noun="paper"
                      index={index}
                      count={papers.fields.length}
                      onRemove={() => {
                        const value = getValues(`papers.${index}`);
                        papers.remove(index);
                        undoableRemove(`Paper ${index + 1}`, () =>
                          papers.insert(index, value)
                        );
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <ArrayError name="papers" />
          <AddButton
            count={papers.fields.length}
            limit={LIMITS.papers}
            onClick={() =>
              papers.append(
                {
                  year: new Date().getFullYear(),
                  exam: "endsem",
                  link: "",
                },
                { focusName: `papers.${papers.fields.length}.link` }
              )
            }
          >
            Add a paper
          </AddButton>
        </div>
      </div>
    </Section>
  );
}
