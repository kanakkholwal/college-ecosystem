'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Link as LinkIcon, Loader2, Minus, Plus } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Assuming you have these types/schema defined in your project
// import { ApplicationFormData, applicationSchema } from "@/lib/validation";
// Mocking schema for display purposes if you copy-paste this code directly
import { z } from "zod";
const applicationSchema = z.object({
    name: z.string().min(2),
    collegeId: z.string().email(),
    mobile: z.string().min(10),
    collegeYear: z.string(),
    workLinks: z.array(z.object({ url: z.string().url() })),
    bestProject: z.string().optional(),
    bestHack: z.string().optional(),
});
type ApplicationFormData = z.infer<typeof applicationSchema>;

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      collegeId: "",
      collegeYear: "1st",
      mobile: "",
      workLinks: [{ url: "" }],
      bestProject: "",
      bestHack: ""
    }
  });

  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workLinks",
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(data);
    toast.success("Application Transmitted", { description: "We'll be in touch shortly." });
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section: Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold">01</div>
            <h3 className="text-lg font-semibold tracking-tight">Identity</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-mono text-muted-foreground">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="bg-muted/30 focus:bg-background h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name="collegeYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-mono text-muted-foreground">Academic Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted/30 h-11">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["1st Year", "2nd Year", "3rd Year", "Final Year"].map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="collegeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-mono text-muted-foreground">College Email</FormLabel>
                  <FormControl>
                    <Input placeholder="rollno@nith.ac.in" className="bg-muted/30 focus:bg-background h-11 font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-mono text-muted-foreground">Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" className="bg-muted/30 focus:bg-background h-11 font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Section: Proof of Work */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold">02</div>
            <h3 className="text-lg font-semibold tracking-tight">Proof of Work</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <FormLabel className="uppercase text-xs font-mono text-muted-foreground">Links (GitHub, LinkedIn, Portfolio)</FormLabel>
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={control}
                  name={`workLinks.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://github.com/username" className="pl-9 bg-muted/30 focus:bg-background h-11 font-mono" {...field} />
                          </div>
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive h-11 w-11"
                          onClick={() => remove(index)} 
                          disabled={fields.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ url: "" })}
              className="text-xs border-dashed"
            >
              <Plus className="h-3 w-3 mr-2" /> Add another link
            </Button>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Section: The Build */}
        <div className="space-y-6">
           <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold">03</div>
            <h3 className="text-lg font-semibold tracking-tight">The Build</h3>
          </div>

          <FormField
            control={control}
            name="bestProject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-mono text-muted-foreground">What is the best thing you've built?</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about the stack, the problem, and how you solved it..." 
                    className="min-h-[120px] bg-muted/30 focus:bg-background resize-y" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bestHack"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-mono text-muted-foreground">Optional: Describe a technical 'Hack' you are proud of</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Did you reverse engineer an API? Optimize a slow query? Bypass a constraint?" 
                    className="min-h-[100px] bg-muted/30 focus:bg-background resize-y font-mono text-sm" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Area */}
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Transmitting...
              </>
            ) : (
              "Initialize Application"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            By clicking submit, you agree to commit 10 days to the build.
          </p>
        </div>

      </form>
    </Form>
  );
}