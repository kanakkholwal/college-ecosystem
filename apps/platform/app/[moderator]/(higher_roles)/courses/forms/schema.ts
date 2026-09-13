import { z } from "zod";

export const COURSE_TYPES = [
  "Core",
  "Elective",
  "Lab",
  "Seminar",
  "Humanities",
] as const;

// Column widths: books_and_references.type and previous_papers.exam are varchar(10).
export const REFERENCE_TYPES = [
  { value: "book", label: "Book" },
  { value: "reference", label: "Reference" },
  { value: "drive", label: "Drive folder" },
  { value: "youtube", label: "YouTube" },
  { value: "others", label: "Other link" },
] as const;

export const EXAM_TYPES = [
  { value: "midsem", label: "Mid semester" },
  { value: "endsem", label: "End semester" },
  { value: "others", label: "Other" },
] as const;

export const LIMITS = { outcomes: 20, chapters: 30, books: 30, papers: 40 };

const FIRST_PAPER_YEAR = 2000;

// Links render on the public syllabus, so only http(s) URLs pass.
const httpUrl = z
  .string()
  .trim()
  .url("Enter a full link, starting with https://")
  .refine((v) => /^https?:\/\//i.test(v), "Only http(s) links are allowed");

const wholeNumber = (label: string, min: number, max: number) =>
  z
    .number({ invalid_type_error: `Enter ${label}` })
    .int(`${label[0].toUpperCase()}${label.slice(1)} must be a whole number`)
    .min(min, `Use ${min} or more`)
    .max(max, `Use ${max} or fewer`);

export const courseFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Use the full course name, at least 5 characters")
    .max(200, "Keep the name under 200 characters"),
  code: z
    .string()
    .trim()
    .min(3, "Course codes have at least 3 characters")
    .max(10, "Course codes fit in 10 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and hyphens only"),
  department: z.string().trim().min(1, "Pick a department"),
  type: z.string().trim().min(1, "Pick a course type"),
  credits: wholeNumber("credits", 0, 10),
  outcomes: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(5, "Describe the outcome in a few words")
          .max(500, "Keep each outcome under 500 characters"),
      })
    )
    .max(LIMITS.outcomes, `Up to ${LIMITS.outcomes} outcomes`),
  chapters: z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .min(2, "Name the unit")
          .max(200, "Keep the title under 200 characters"),
        lectures: wholeNumber("lectures", 0, 100),
        topics: z.string().max(4000, "That's a lot of topics; split the unit"),
      })
    )
    .max(LIMITS.chapters, `Up to ${LIMITS.chapters} units`),
  books: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        name: z
          .string()
          .trim()
          .min(2, "Enter the title")
          .max(200, "Keep the title under 200 characters"),
        type: z.enum(["book", "reference", "drive", "youtube", "others"], {
          errorMap: () => ({ message: "Pick a type" }),
        }),
        link: httpUrl,
      })
    )
    .max(LIMITS.books, `Up to ${LIMITS.books} references`),
  papers: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        year: z
          .number({ invalid_type_error: "Pick a year" })
          .int()
          .min(FIRST_PAPER_YEAR, `Papers from ${FIRST_PAPER_YEAR} onwards`)
          .max(new Date().getFullYear() + 1, "That year hasn't happened yet"),
        exam: z.enum(["midsem", "endsem", "others"], {
          errorMap: () => ({ message: "Pick the exam" }),
        }),
        link: httpUrl,
      })
    )
    .max(LIMITS.papers, `Up to ${LIMITS.papers} papers`),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const paperYears = () => {
  const now = new Date().getFullYear();
  return Array.from(
    { length: now - FIRST_PAPER_YEAR + 1 },
    (_, i) => now - i
  );
};

/** Topics are edited one per line; commas stay inside a topic. */
export const splitTopics = (text: string) =>
  text
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);

export const EMPTY_COURSE: CourseFormValues = {
  name: "",
  code: "",
  department: "",
  type: "Core",
  credits: 4,
  outcomes: [],
  chapters: [],
  books: [],
  papers: [],
};
