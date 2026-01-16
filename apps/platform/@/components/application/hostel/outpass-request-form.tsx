"use client";

import { DateTimePicker } from "@/components/extended/date-n-time/date-time-picker";
import { Button } from "@/components/ui/button";
import {
  Form,
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
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { addHours, addMinutes } from "date-fns";
import { ArrowRight, Building, Clock, MapPin, Navigation } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import type z from "zod";
import { REASONS, requestOutPassSchema } from "~/constants/hostel.outpass";
import type { HostelStudentType } from "~/models/hostel_n_outpass";

interface RequestOutPassFormProps<T> {
  onSubmit: (data: z.infer<typeof requestOutPassSchema>) => Promise<T>;
  student: HostelStudentType;
}

const QUICK_DURATIONS = [
  { label: "2 Hours", hours: 2 },
  { label: "4 Hours", hours: 4 },
  { label: "6 Hours", hours: 6 },
  { label: "All Day", hours: 12 },
];

export default function RequestOutPassForm<T>({
  onSubmit,
  student,
}: RequestOutPassFormProps<T>) {
  const form = useForm<z.infer<typeof requestOutPassSchema>>({
    resolver: zodResolver(requestOutPassSchema),
    defaultValues: {
      roomNumber: student.roomNumber || "",
      reason: undefined,
      address: "",
      expectedOutTime: addMinutes(new Date(), 10).toISOString(),
      expectedInTime: addHours(new Date(), 2).toISOString(),
    },
  });

  const handleSubmit = async (data: z.infer<typeof requestOutPassSchema>) => {
    // ---------------------------------------------------------
    // 🛑 Custom Validation: 8:30 PM Curfew Check
    // ---------------------------------------------------------
    if (data.reason !== "home") {
      const inTime = new Date(data.expectedInTime);
      const hours = inTime.getHours();
      const minutes = inTime.getMinutes();

      // Check if time is strictly after 20:30 (8:30 PM)
      if (hours > 20 || (hours === 20 && minutes > 30)) {
        form.setError("expectedInTime", {
          type: "manual",
          message: "Curfew exceeded. You must return by 8:30 PM for local outings.",
        });

        toast.error("Local outings (Market/Outing) are not allowed past 8:30 PM.", {
          icon: "🚫",
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });

        // Stop execution here so the request isn't sent
        return;
      }
    }

    // Proceed if validation passes
    try {
      await toast.promise(onSubmit(data), {
        loading: "Submitting request...",
        success: "Outpass requested successfully",
        error: "Failed to request outpass",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const applyDuration = (hours: number) => {
    const start = addMinutes(new Date(), 10);
    const end = addHours(start, hours);
    form.setValue("expectedOutTime", start.toISOString());
    form.setValue("expectedInTime", end.toISOString());
    toast.success(`Time set for ${hours} hours duration`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="rounded-xl border bg-card shadow-sm"
      >
        {/* Section 1: User Context */}
        <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Room Details</p>
              <p className="text-xs text-muted-foreground">
                {student.roomNumber !== "UNKNOWN" ? `Room ${student.roomNumber}` : "Room Not Assigned"}
                {" • "}{student.hostelSlug?.toUpperCase()}
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="roomNumber"
            render={({ field }) => <Input type="hidden" {...field} />}
          />
        </div>

        <div className="p-6 space-y-8">
          {/* Section 2: Destination */}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select purpose" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason} className="capitalize">
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g. City Center Mall" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Section 3: Timing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Duration
              </FormLabel>
              <div className="flex gap-2">
                {QUICK_DURATIONS.map((d) => (
                  <button
                    key={d.hours}
                    type="button"
                    onClick={() => applyDuration(d.hours)}
                    className="text-[10px] font-medium px-2 py-1 rounded-md border bg-background hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <FormField
                control={form.control}
                name="expectedOutTime"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormDescription className="text-xs mb-1">Leaving at</FormDescription>
                    <FormControl>
                      <DateTimePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground mt-6" />

              <FormField
                control={form.control}
                name="expectedInTime"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormDescription className="text-xs mb-1">Returning by</FormDescription>
                    <FormControl>
                      <DateTimePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Reset Form
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Requesting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}