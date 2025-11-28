"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { ChapterSelect } from "src/db/schema/course";
// 👇 Import your new server action here
import { deleteChapter, updateOrInsertChapterForCourseId } from "~/actions/common.course";
// 👇 Assuming you still have a delete action from previous steps

export function CurriculumManager({
  courseId,
  initialChapters,
}: {
  courseId: string;
  initialChapters: ChapterSelect[];
}) {
  const [chapters, setChapters] = useState<ChapterSelect[]>(initialChapters);
  const [isPending, startTransition] = useTransition();

  // 1. ADD CHAPTER (Updated to use your "insert" action)
  const handleAdd = () => {
    startTransition(async () => {
      try {
        const newChapter = await updateOrInsertChapterForCourseId(
            courseId, 
            "insert", 
            { 
                title: "Untitled Chapter", 
                lectures: 0, 
                topics: [] 
            }
        );
        
        if (newChapter) {
            setChapters((prev) => [...prev, newChapter as ChapterSelect]);
            toast.success("Chapter created");
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to create chapter");
      }
    });
  };

  // 2. UPDATE CHAPTER (Updated to use your "update" action)
  const handleUpdate = async (id: string, field: keyof ChapterSelect, value: any) => {
    // Prevent unnecessary API calls if value hasn't changed
    const current = chapters.find(c => c.id === id);
    if (current && current[field] === value) return;

    // Optimistic UI Update: Update local state immediately
    setChapters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

    try {
        await updateOrInsertChapterForCourseId(
            courseId, 
            "update", 
            { [field]: value }, 
            id // Pass ID as the last argument as per your function signature
        );
        toast.success("Saved", { id: "autosave", duration: 1000 });
    } catch (e) {
        toast.error("Failed to save changes");
        // Optional: Revert local state here if strict consistency is needed
    }
  };

  // 3. DELETE CHAPTER (Kept from previous logic)
  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    
    // Optimistic UI Update
    const previousChapters = chapters;
    setChapters((prev) => prev.filter((c) => c.id !== id));

    startTransition(async () => {
      try {
        await deleteChapter(id, courseId);
        toast.success("Chapter deleted");
      } catch (e) {
        setChapters(previousChapters); // Revert on error
        toast.error("Failed to delete");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Syllabus Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Manage chapters, topics, and lecture distribution.
          </p>
        </div>
        <Button onClick={handleAdd} disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Chapter
        </Button>
      </div>

      {/* Empty State */}
      {chapters.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/30">
          <Layers className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>No chapters defined yet.</p>
          <Button variant="link" onClick={handleAdd}>
            Create your first chapter
          </Button>
        </div>
      ) : (
        /* Accordion List */
        <Accordion type="multiple" className="space-y-4">
          {chapters.map((chapter) => (
            <AccordionItem
              key={chapter.id}
              value={chapter.id}
              className="border rounded-xl bg-card px-4 data-[state=open]:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4 py-4">
                <span className="cursor-move text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </span>

                <div className="flex-1 grid grid-cols-[1fr_auto] gap-4 items-center mr-2">
                  <AccordionTrigger className="hover:no-underline py-0 text-base font-semibold text-left">
                    <span className="truncate mr-4">{chapter.title || "Untitled Chapter"}</span>
                  </AccordionTrigger>
                  <Badge variant="default" className="w-fit shrink-0">
                    {chapter.lectures || 0} Lectures
                  </Badge>
                </div>
              </div>

              <AccordionContent className="pb-6 pl-9 pr-4 space-y-6 border-t pt-6 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Title Input */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Chapter Title
                    </label>
                    <Input 
                        defaultValue={chapter.title} 
                        onBlur={(e) => handleUpdate(chapter.id, "title", e.target.value)}
                    />
                  </div>

                  {/* Lectures Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Est. Lectures
                    </label>
                    <Input 
                        type="number" 
                        defaultValue={chapter.lectures || 0} 
                        onBlur={(e) => handleUpdate(chapter.id, "lectures", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Topics Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Topics Covered
                  </label>
                  <Textarea 
                    defaultValue={chapter.topics?.join(", ")} 
                    placeholder="e.g. Introduction, Installation, Hello World"
                    className="min-h-[80px]"
                    onBlur={(e) => {
                        // Convert comma-separated string back to array for DB
                        const raw = e.target.value;
                        const topicsArray = raw.split(",").map(t => t.trim()).filter(t => t.length > 0);
                        handleUpdate(chapter.id, "topics", topicsArray);
                    }}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Separate topics with commas. Changes save automatically.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(chapter.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete Chapter
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}