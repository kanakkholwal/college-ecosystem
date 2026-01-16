"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { PiBriefcaseDuotone, PiBuildingsDuotone, PiPaperPlaneRightDuotone, PiPlusDuotone, PiTrashDuotone } from "react-icons/pi";
import { toast } from "sonner";
import { useSession } from "~/auth/client";
import { placementStorySchema, type PlacementStoryInput } from "~/constants/placement-story";



export default function ShareExperiencePage() {
  const {data:session} = useSession();
  const form = useForm<PlacementStoryInput>({
    resolver: zodResolver(placementStorySchema),
    defaultValues: {
      author: {
        id: session?.user.id,
        name: session?.user.name,
        username: session?.user.username,
      },
      resources: [],
      isVerified: false,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resources",
  });

  async function onSubmit(data: PlacementStoryInput) {
    try {
      console.log("Submitting Payload:", data);
      // await submitAction(data);
      toast.success("Experience submitted for verification!");
    } catch (error) {
      toast.error("Failed to submit.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Share Your Journey</h1>
        <p className="text-muted-foreground text-lg">Help juniors navigate their career path by documenting your interview experience.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* 1. Job Details */}
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PiBuildingsDuotone className="text-primary h-6 w-6" /> Offer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input placeholder="e.g. Google, Microsoft" {...form.register("companyName")} />
              {form.formState.errors.companyName && <p className="text-xs text-red-500">{form.formState.errors.companyName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Input placeholder="e.g. SDE-1, Data Analyst" {...form.register("role")} />
              {form.formState.errors.role && <p className="text-xs text-red-500">{form.formState.errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Offer Type</Label>
              <Select onValueChange={(val: any) => form.setValue("offerType", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {["Internship", "FTE", "PPO", "Intern+FTE", "Other"].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.offerType && <p className="text-xs text-red-500">{form.formState.errors.offerType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>CTC / Stipend (Optional)</Label>
              <Input placeholder="e.g. 1.5L/mo or 20 LPA" {...form.register("ctc")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Location (Optional)</Label>
              <Input placeholder="e.g. Bangalore, Remote" {...form.register("location")} />
            </div>
          </CardContent>
        </Card>

        {/* 2. Experience */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PiBriefcaseDuotone className="text-primary h-6 w-6" /> The Process
            </CardTitle>
            <CardDescription>
              Be detailed about rounds, questions asked, and the difficulty level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Selection Process & Rounds</Label>
              <Textarea 
                className="min-h-[200px] font-mono text-sm leading-relaxed bg-muted/20 focus:bg-background transition-colors" 
                placeholder="Round 1: Online Assessment (2 Leetcode Hards)...&#10;Round 2: Technical Interview..."
                {...form.register("selectionProcess")} 
              />
              {form.formState.errors.selectionProcess && <p className="text-xs text-red-500">{form.formState.errors.selectionProcess.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Preparation Strategy</Label>
              <Textarea 
                className="min-h-[150px] font-mono text-sm leading-relaxed bg-muted/20 focus:bg-background transition-colors" 
                placeholder="I focused on Graphs and DP. I used Striver's sheet..."
                {...form.register("preparationStrategy")} 
              />
              {form.formState.errors.preparationStrategy && <p className="text-xs text-red-500">{form.formState.errors.preparationStrategy.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* 3. Resources */}
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Helpful Resources</Label>
                <Button type="button" variant="secondary" size="sm" onClick={() => append({ title: "", url: "" })}>
                  <PiPlusDuotone className="mr-2" /> Add Link
                </Button>
              </div>
              
              {fields.length === 0 && (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4 text-center">
                  No resources added yet.
                </div>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-left-2 duration-300">
                  <div className="grid gap-2 flex-1 md:grid-cols-2">
                    <Input placeholder="Resource Title (e.g. Blind 75)" {...form.register(`resources.${index}.title`)} />
                    <Input placeholder="URL (https://...)" {...form.register(`resources.${index}.url`)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-0.5">
                    <PiTrashDuotone className="text-destructive h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20">
            Submit Experience <PiPaperPlaneRightDuotone className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}