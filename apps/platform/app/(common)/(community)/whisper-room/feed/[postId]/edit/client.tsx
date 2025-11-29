"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ButtonLink } from "@/components/utils/link";
import { useActionState } from "@/hooks/useActionState";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content, JSONContent } from "@tiptap/react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  Dice5,
  Ghost,
  Hash,
  Loader2,
  Save,
  User,
  VenetianMask,
  X,
} from "lucide-react";
import { nanoid } from "nanoid";
import { NexoEditor } from "nexo-editor";
import "nexo-editor/index.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { editWhisperPost } from "~/actions/community.whisper";
import {
  CATEGORY_OPTIONS,
  rawWhisperPostSchema,
  WhisperPostT
} from "~/constants/community.whispers";

// --- Helpers ---
function generateRandomHandle() {
  const adjectives = ["Anonymous", "Secret", "Hidden", "Silent", "Shadow", "Misty"];
  const nouns = ["Student", "Voice", "Echo", "Whisper", "Observer", "Panda"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999);
  return `@${adjective}_${noun}_${number}`;
}

function contentJsonToText(content: JSONContent): string {
  if (!content || !content.content) return "";
  let text = "";
  content.content.forEach((node) => {
    if (node.type === "text" && node.text) {
      text += node.text + " ";
    }
    if (node.content) {
      text += contentJsonToText({ type: node.type, content: node.content });
    }
  });
  return text.trim();
}

export default function EditWhisperPostClient({ post }: { post: WhisperPostT }) {
  const [contentSize, setContentSize] = useState<number>(0);
  const [updatePost, state] = useActionState(editWhisperPost);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof rawWhisperPostSchema>>({
    resolver: zodResolver(rawWhisperPostSchema),
    defaultValues: {
      content_json: post.content_json,
      visibility: post.visibility,
      category: post.category,
      poll: post.poll || undefined,
      pseudo: post.pseudo || undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "poll.options",
  });

  const pollEnabled = form.watch("poll") !== undefined;

  async function onSubmit(values: z.infer<typeof rawWhisperPostSchema>) {
    try {
      setLoading(true);
      const result = await updatePost(post._id!, values);
      
      if (result.data) {
        toast.success("Whisper updated successfully.");
        router.push("/whisper-room/feed");
      } else if (result.error) {
        toast.error(result.error.message || "Failed to update.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-20 w-full max-w-7xl mx-auto ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <header className="sticky top-0 z-30 w-full border-b border-border/40 ">
            <div className="px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ButtonLink 
                    href="/whisper-room/feed" 
                    variant="ghost" 
                    size="icon_sm" 
                    className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                </ButtonLink>
                <h1 className="text-sm font-semibold">Edit Whisper</h1>
              </div>

              <div className="flex items-center gap-3">
                <ButtonLink href="/whisper-room/feed" variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground">
                  Cancel
                </ButtonLink>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 rounded-full px-6 shadow-lg shadow-primary/20"
                  disabled={loading || state.loading || !form.formState.isValid}
                >
                  {(loading || state.loading) ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </header>

    
          <main className="w-full px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 space-y-6">
              {/* Category Pills */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => field.onChange(cat.value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          field.value === cat.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Hash className="size-3" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              />

              {/* Editor */}
              <FormField
                control={form.control}
                name="content_json"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <div className="min-h-[300px] prose prose-zinc dark:prose-invert max-w-none">
                        <NexoEditor
                          content={field.value as Content}
                          onChange={(content) => {
                            field.onChange(content);
                            const size = contentJsonToText(content as JSONContent).length;
                            setContentSize(size);
                          }}
                        />
                      </div>
                    </FormControl>
                    <div className="flex justify-end pt-2">
                       <span className={cn("text-[10px] font-mono", contentSize > 5000 ? "text-red-500" : "text-muted-foreground/50")}>
                          {contentSize} / 5000
                       </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Poll Editor (Widget Style) */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                       <BarChart2 className="size-4" />
                       Poll Configuration
                    </div>
                    <Switch 
                        checked={pollEnabled}
                        onCheckedChange={(checked) => {
                            if (!checked) {
                                form.setValue("poll", undefined);
                            } else {
                                form.setValue("poll", { options: [], anonymousVotes: false });
                            }
                        }}
                    />
                 </div>

                 {pollEnabled && (
                    <Card className="border-dashed bg-muted/20 animate-in fade-in">
                       <CardContent className="p-4 space-y-4">
                          <FormField
                             control={form.control}
                             name="poll.anonymousVotes"
                             render={({ field }) => (
                                <div className="flex items-center gap-2">
                                   <Switch id="anon-vote" checked={field.value} onCheckedChange={field.onChange} />
                                   <Label htmlFor="anon-vote" className="text-xs text-muted-foreground">Anonymous Voting</Label>
                                </div>
                             )}
                          />
                          
                          <div className="space-y-2">
                             {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                   <Input 
                                      {...form.register(`poll.options.${index}.text` as const)}
                                      placeholder={`Option ${index + 1}`}
                                      className="h-9 text-sm bg-background"
                                   />
                                   <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                      onClick={() => remove(index)}
                                      disabled={fields.length <= 2}
                                   >
                                      <X className="size-4" />
                                   </Button>
                                </div>
                             ))}
                          </div>
                          
                          <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             className="w-full h-8 text-xs border-dashed"
                             onClick={() => append({ id: nanoid(), text: "", votes: [] })}
                             disabled={fields.length >= 10}
                          >
                             + Add Option
                          </Button>
                       </CardContent>
                    </Card>
                 )}
              </div>
            </div>

            {/* --- RIGHT: Identity Settings (5 Cols) --- */}
            <div className="lg:col-span-5 space-y-6">
              
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Edit Persona
                    </FormLabel>
                    <FormControl>
                        <div className="grid grid-cols-1 gap-3">
                            <IdentityCard 
                                active={field.value === 'REAL_NAME'}
                                onClick={() => field.onChange('REAL_NAME')}
                                icon={User}
                                title="Real Identity"
                                desc="Your actual name and profile."
                                colorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
                            />

                            <IdentityCard 
                                active={field.value === 'PSEUDO'}
                                onClick={() => field.onChange('PSEUDO')}
                                icon={VenetianMask}
                                title="Pseudo Handle"
                                desc="A custom alias for this post."
                                colorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
                            >
                                {field.value === 'PSEUDO' && (
                                    <div className="mt-3 flex gap-2 animate-in fade-in zoom-in-95">
                                        <Input 
                                            value={form.watch("pseudo.handle") || ""}
                                            onChange={(e) => form.setValue("pseudo.handle", e.target.value)}
                                            placeholder="@alias_name"
                                            className="h-8 text-xs font-mono bg-background"
                                        />
                                        <Button 
                                            type="button" 
                                            size="icon" 
                                            className="h-8 w-8 shrink-0" 
                                            variant="outline"
                                            onClick={() => form.setValue("pseudo.handle", generateRandomHandle())}
                                            title="Randomize"
                                        >
                                            <Dice5 className="size-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </IdentityCard>

                            <IdentityCard 
                                active={field.value === 'ANONYMOUS'}
                                onClick={() => field.onChange('ANONYMOUS')}
                                icon={Ghost}
                                title="Total Anonymity"
                                desc="Hide everything."
                                colorClass="text-rose-500 bg-rose-500/10 border-rose-500/20"
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600/80 text-xs leading-relaxed flex gap-3">
                 <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                 <p>
                    <strong>Note:</strong> Changing visibility on an existing post will update how it appears in the feed, but previous reactions remain attached to the post ID.
                 </p>
              </div>

            </div>
          </main>
        </form>
      </Form>
    </div>
  );
}

// --- Sub-component: Identity Selection Card ---
function IdentityCard({ 
    active, 
    onClick, 
    icon: Icon, 
    title, 
    desc, 
    colorClass,
    children 
}: { 
    active: boolean; 
    onClick: () => void; 
    icon: React.FC<React.SVGProps<SVGSVGElement>>; 
    title: string; 
    desc: string; 
    colorClass: string;
    children?: React.ReactNode;
}) {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "cursor-pointer rounded-xl border p-4 transition-all duration-200",
                active 
                    ? `ring-1 ring-offset-0 ${colorClass}` 
                    : "bg-card border-border hover:border-primary/30 hover:bg-muted/50"
            )}
        >
            <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg", active ? "bg-background/50" : "bg-muted")}>
                    <Icon className="size-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">{title}</h4>
                        {active && <div className="size-2 rounded-full bg-current" />}
                    </div>
                    <p className={cn("text-xs mt-1", active ? "opacity-90" : "text-muted-foreground")}>
                        {desc}
                    </p>
                    {children}
                </div>
            </div>
        </div>
    )
}