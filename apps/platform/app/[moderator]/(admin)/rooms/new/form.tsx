"use client";

import RoomCard from "@/components/application/room/card";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Lock, Plus, TriangleAlert } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import toast from "@/lib/toast";
import { z } from "zod";
import { createRoom } from "~/actions/common.room";
import { roomTypes } from "~/constants/common.room";
import { callAction } from "~/lib/call-action";

const formSchema = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Enter the room number as it appears on the door")
    .max(60, "Keep it under 60 characters"),
  roomType: z.enum(roomTypes),
  capacity: z
    .number({ invalid_type_error: "Enter the number of seats" })
    .int("Use a whole number")
    .min(1, "A room needs at least 1 seat"),
  currentStatus: z.enum(["available", "occupied"]),
});
type RoomFormValues = z.infer<typeof formSchema>;

const DEFAULTS = {
  roomNumber: "",
  roomType: "classroom",
  capacity: Number.NaN,
  currentStatus: "available",
} satisfies RoomFormValues;

const STATUS_OPTIONS = [
  { value: "available", label: "Available", Icon: Check },
  { value: "occupied", label: "Occupied", Icon: Lock },
] as const;

const typeLabel = (type: string) =>
  type.charAt(0).toUpperCase() + type.slice(1);

export default function CreateRoomForm() {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });
  const values = useWatch({ control: form.control }) as RoomFormValues;
  const { isSubmitting, errors } = form.formState;

  async function onSubmit(data: RoomFormValues) {
    const res = await callAction(() =>
      createRoom({ ...data, lastUpdatedTime: new Date() })
    );
    if (!res.ok) {
      form.setError("root", { message: res.error });
      return;
    }
    toast.success(`Room ${res.data.roomNumber} added`);
    // Keep the type so a run of similar rooms is quick to enter.
    form.reset({ ...DEFAULTS, roomType: data.roomType });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="grid grid-cols-1 items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <section
          aria-labelledby="room-details"
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background"
        >
          <h2
            id="room-details"
            className="text-body-lg font-medium text-foreground"
          >
            Room details
          </h2>
          <FormField
            control={form.control}
            name="roomNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="LH-101"
                    className="font-mono"
                    autoCapitalize="characters"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Students search by this, so match the sign on the door.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
            <FormField
              control={form.control}
              name="roomType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {typeLabel(type)}
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
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      placeholder="60"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="currentStatus"
            render={({ field }) => (
              <FormItem>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-body font-medium text-foreground">
                    Status right now
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map(({ value, label, Icon }) => (
                      <label
                        key={value}
                        className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-body text-foreground transition-colors duration-150 hover:bg-muted has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-2 has-focus-visible:ring-ring"
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={value}
                          checked={field.value === value}
                          onChange={() => field.onChange(value)}
                          className="sr-only"
                        />
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <FormDescription>
                  CRs and faculty update this later from the rooms page.
                </FormDescription>
              </FormItem>
            )}
          />

          {errors.root?.message && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/40 p-3"
            >
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p className="text-body text-foreground">{errors.root.message}</p>
            </div>
          )}

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Plus aria-hidden="true" />
              )}
              {isSubmitting ? "Adding room" : "Add room"}
            </Button>
          </div>
        </section>

        <aside
          aria-labelledby="room-preview"
          className="flex flex-col gap-3 @4xl:sticky @4xl:top-4"
        >
          <div className="space-y-1">
            <h2
              id="room-preview"
              className="text-body-lg font-medium text-foreground"
            >
              Preview
            </h2>
            <p className="text-body text-muted-foreground">
              How the room shows in the classroom finder.
            </p>
          </div>
          <RoomCard
            room={{
              id: "preview",
              roomNumber: values.roomNumber?.trim() || "Room number",
              roomType: values.roomType,
              capacity: Number.isNaN(values.capacity) ? null : values.capacity,
              currentStatus: values.currentStatus,
              lastUpdatedTime: null,
              createdAt: null,
              updatedAt: null,
              latestUsageHistory: null,
            }}
          />
        </aside>
      </form>
    </Form>
  );
}
