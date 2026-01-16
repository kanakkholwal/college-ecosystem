"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddPrevModal, AddRefsModal } from "app/(common)/(academics)/syllabus/[code]/modal";
import { Book, FileText, Link as LinkIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { BookReferenceSelect, PreviousPaperSelect } from "src/db/schema/course";
import * as z from "zod";
import { updateBooksAndRefPublic, updatePrevPapersPublic } from "~/actions/common.course";

// Schemas
const bookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  link: z.string().url("Must be a valid URL"),
  type: z.string().min(1, "Type is required"),
});

const paperSchema = z.object({
  year: z.coerce.number().min(2000).max(new Date().getFullYear()),
  exam: z.string().min(1, "Exam type is required"),
  link: z.string().url("Must be a valid URL"),
});

export function ResourceManager({
  courseId,
  initialBooks,
  initialPapers,
  courseCode,
}: {
  courseId: string;
  courseCode: string;
  initialBooks: BookReferenceSelect[];
  initialPapers: PreviousPaperSelect[];
}) {
  const [books, setBooks] = useState(initialBooks);
  const [papers, setPapers] = useState(initialPapers);

  const [bookOpen, setBookOpen] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);

  // Book Form
  const bookForm = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: { name: "", link: "", type: "book" },
  });

  const onBookSubmit = async (data: z.infer<typeof bookSchema>) => {
    try {
      const newBooks = await updateBooksAndRefPublic(courseId, data);
      setBooks((prev) => [...prev, ...newBooks]); // Add newly created items
      setBookOpen(false);
      bookForm.reset();
      toast.success("Resource added");
    } catch (e: any) {
      toast.error(e.message || "Failed to add resource");
    }
  };

  // Paper Form
  const paperForm = useForm<z.infer<typeof paperSchema>>({
    resolver: zodResolver(paperSchema),
    defaultValues: { year: new Date().getFullYear(), exam: "endsem", link: "" },
  });

  const onPaperSubmit = async (data: z.infer<typeof paperSchema>) => {
    try {
      const newPapers = await updatePrevPapersPublic(courseId, data);
      setPapers((prev) => [...prev, ...newPapers]); // Add newly created items
      setPaperOpen(false);
      paperForm.reset();
      toast.success("Paper added");
    } catch (e: any) {
      toast.error(e.message || "Failed to add paper");
    }
  };

  // Note: No delete action provided for individual resources yet
  const handleDeleteMock = () => toast.error("Delete functionality not available yet");

  return (
    <div className="grid gap-8">
      {/* --- Books Section --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" /> Reference Material
            </CardTitle>
            <CardDescription>Textbooks and external links.</CardDescription>
          </div>
         <AddRefsModal courseId={courseId} code={courseCode} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border divide-y">
            {books.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No books added.
              </div>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <span className="font-serif font-bold text-amber-700 dark:text-amber-500 text-xs">
                        Bk
                      </span>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{book.name}</p>
                      <a
                        href={book.link}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" /> {book.link}
                      </a>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={handleDeleteMock}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Papers Section --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Archives & PYQs
            </CardTitle>
            <CardDescription>Previous year question papers.</CardDescription>
          </div>
          <AddPrevModal courseId={courseId} code={courseCode} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border divide-y">
            {papers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No papers uploaded.
              </div>
            ) : (
              papers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                      {paper.year}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {paper.exam.replace("_", " ")} Exam
                      </p>
                      <a
                        href={paper.link}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                      >
                        View PDF <LinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={handleDeleteMock}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}