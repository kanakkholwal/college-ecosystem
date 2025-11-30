"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Box, Hash, Loader2, Plus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";
import { roomSchema, roomTypes } from "~/constants/common.room";
import { RoomSelect } from "~/db/schema/room";

type RoomType = z.infer<typeof roomSchema>;

export default function CreateRoomForm({
  onSubmit,
}: {
  onSubmit: (room: RoomType) => Promise<
    Omit<RoomSelect, "currentStatus"> & {
      currentStatus: RoomType["currentStatus"];
    }
  >;
}) {
  const form = useForm<RoomType>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: "",
      roomType: "classroom",
      capacity: 1,
      currentStatus: "occupied",
      lastUpdatedTime: new Date(),
    },
  });

  async function handleSubmit(data: RoomType) {
    await toast.promise(onSubmit(data), {
      loading: "Registering facility...",
      success: (data) => `Room ${data.roomNumber} registered`,
      error: "Failed to register room",
    });
    form.reset();
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-border/50 bg-card/60 backdrop-blur-lg shadow-lg">
      <CardHeader className="space-y-1 border-b border-border/40 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Box className="size-5 text-primary" />
          Register Facility
        </CardTitle>
        <CardDescription>
          Add a new physical space to the campus registry.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="grid gap-6 pt-6">
            {/* Primary Identifier */}
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Hash className="size-3.5" /> Room Identifier
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 304-A, Lab-01"
                      className="font-mono"
                      autoCapitalize="characters"
                      autoComplete="off"
                      {...field}
                      value={field.value as string}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique code or number for this room.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Type */}
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Box className="size-3.5" /> Classification
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value.trim())}
                      defaultValue={field.value}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capacity */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Users className="size-3.5" /> Max Capacity
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        min={1}
                        {...field}
                        value={field.value as number}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t border-border/40 bg-muted/10 pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="min-w-[140px]"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              {form.formState.isSubmitting ? "Registering..." : "Create Room"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}