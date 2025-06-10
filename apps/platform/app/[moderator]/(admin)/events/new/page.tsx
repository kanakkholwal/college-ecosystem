"use client";
import { DateTimePicker } from "@/components/extended/date-n-time";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";
import { createNewEvent } from "~/actions/events";
import { eventTypes, rawEventsSchema } from "~/constants/events";

export default function CreateNewEvent() {
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof rawEventsSchema>>({
    resolver: zodResolver(rawEventsSchema),
    defaultValues: {
      title: "",
      description: "",
      links: [],
      time: searchParams.get("time")
        ? new Date(searchParams.get("time") || "")
        : new Date(),
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate") || "")
        : undefined,
      eventType: eventTypes[0],
      location: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof rawEventsSchema>) => {
    console.log("Form Data:", data);
    toast.promise(createNewEvent(data), {
      loading: "Creating new event",
      success: "New Event created successfully",
      error: "Failed to create new event",
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold">Create New Event</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 my-5 p-4 bg-card"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event Title"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event Description"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      {...field}
                      disabled={form.formState.isSubmitting}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a event Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((event) => {
                        return (
                          <SelectItem
                            key={event}
                            value={event}
                            className="capitalize"
                          >
                            {event}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event Location"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date / Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value.toISOString()}
                      onChange={(date) => field.onChange(new Date(date))}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date / Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value ? field.value?.toISOString() : ""}
                      onChange={(date) => field.onChange(new Date(date))}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            Create Event
          </Button>
        </form>
      </Form>
    </div>
  );
}
