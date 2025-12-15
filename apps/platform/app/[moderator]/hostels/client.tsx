"use client";
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
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import type z from "zod";
import { createHostel, importHostelsFromSite } from "~/actions/hostel.core";
import { IN_CHARGES_EMAILS } from "~/constants/hostel_n_outpass";

import { createHostelSchema } from "~/constants/hostel_n_outpass";

export function CreateHostelForm() {
  const form = useForm<z.infer<typeof createHostelSchema>>({
    resolver: zodResolver(createHostelSchema),
    defaultValues: {
      name: "",
      slug: "",
      gender: "male",
      administrators: [],
      warden: {
        name: "",
        email: "",
        userId: null,
      },
      students: [],
    },
  });
  const handleSubmit = async (data: z.infer<typeof createHostelSchema>) => {
    try {
      toast.promise(createHostel(data), {
        loading: "Creating Hostel",
        success: "Hostel created successfully",
        error: "Failed to create hostel",
      });

      toast.success("Hostel created successfully");
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 my-5 p-2"
      >
        <div className="grid grid-cols-1 gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hostel Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Hostel Name"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="name"
                    autoCorrect="off"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      form.setValue(
                        "slug",
                        value.toLowerCase().replace(" ", "_")
                      );
                      field.onChange(e);
                    }}
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <ToggleGroup
                    defaultValue={"guest_hostel"}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    className="justify-start"
                    type="single"
                  >
                    {["male", "female", "guest_hostel"].map((item) => (
                      <ToggleGroupItem
                        value={item}
                        key={item}
                        size="sm"
                        className="capitalize"
                      >
                        {item.replace("_", " ")}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FormControl>

                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warden.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warden Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Warden Name"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="name"
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
            name="warden.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warden Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Warden Email"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="email"
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
            name="administrators"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Administrators</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value.map((role) => role.email)}
                    onValuesChange={(values) => {
                      field.onChange(
                        values.map((email) => ({
                          email,
                          role: IN_CHARGES_EMAILS.find(
                            (inCharge) => inCharge.email === email
                          )?.role,
                          userId: null,
                        }))
                      );
                    }}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select Admins" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {IN_CHARGES_EMAILS.filter((inCharge) => {
                          const formGender = form.getValues("gender");
                          if (
                            inCharge.gender === "not_specified" ||
                            inCharge.gender === formGender
                          )
                            return true;
                          return false;
                        }).map((inCharge) => {
                          return (
                            <MultiSelectorItem
                              key={inCharge.email}
                              value={inCharge.email}
                              className="capitalize"
                            >
                              {inCharge.email}
                            </MultiSelectorItem>
                          );
                        })}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>

                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Add Hostel
        </Button>
      </form>
    </Form>
  );
}

export function ImportFromSiteButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="success_soft"
      size="sm"
      onClick={() => {
        setLoading(true);
        toast
          .promise(importHostelsFromSite(), {
            loading: "Importing Hostels",
            success: (data: string | undefined) => {
              console.log(data);
              return data || "Hostels imported successfully";
            },
            error: (msg: string | undefined) =>
              msg || "Failed to import hostels",
          })
          .finally(() => {
            setLoading(false);
          });
      }}
      disabled={loading}
    >
      {loading ? "Importing Hostels" : "Import Hostels"}
    </Button>
  );
}
