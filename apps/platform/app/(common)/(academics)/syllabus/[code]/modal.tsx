"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { TbSend } from "react-icons/tb";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useRouter } from "next/navigation";
import {
  updateBooksAndRefPublic,
  updatePrevPapersPublic,
} from "~/actions/common.course";

const yearOptions: readonly string[] = Array.from({ length: 6 }, (_, index) =>
  (new Date().getFullYear() - index).toString()
) as unknown as readonly [string, ...string[]];

const formSchema = z.object({
  exam: z.enum(["midsem", "endsem", "others"]),
  link: z.string(),
  year: z.string().refine((val) => yearOptions.includes(val)),
});

export function AddPrevModal({
  code,
  courseId,
}: {
  code: string;
  courseId: string;
}) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam: "midsem",
      link: "",
      year: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(data);
    toast.promise(
      updatePrevPapersPublic(courseId, {
        exam: data.exam,
        link: data.link,
        year: Number(data.year),
      }),
      {
        loading: "Adding Previous Paper",
        success: () => {
          form.reset();
          router.refresh();
          // Optionally, you can also navigate to the course page or show a success message
          return "Previous Paper Added";
        },
        error: "Failed to add Previous Paper",
      }
    );
  };

  return (
    <ResponsiveDialog
      title={`Add Previous Paper for ${code}`}
      description="Fill the form below to add a previous paper."
      btnProps={{
        children: "Add Previous Paper",
        type: "submit",
        variant: "dark",
        size: "sm",
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-2"
        >
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Select required onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  This is the name of the paper.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input
                    variant="outline"
                    type="url"
                    placeholder="Enter Link"
                    required
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the link to the paper.(drive link with public access)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  required
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="midsem">Midterm Exam</SelectItem>
                    <SelectItem value="endsem">End Semester Exam</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>This is the type of exam.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            width="content"
            size="sm"
            variant="dark"
            className="ml-2 md:mx-auto my-3"
          >
            Submit Paper
            <TbSend />
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
const typeOptions = [
  "book",
  "reference",
  "drive",
  "youtube",
  "others",
] as unknown as readonly [string, ...string[]];

const refFormSchema = z.object({
  type: z.enum(typeOptions),
  link: z.string(),
  name: z.string(),
});

export function AddRefsModal({
  code,
  courseId,
}: {
  code: string;
  courseId: string;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof refFormSchema>>({
    resolver: zodResolver(refFormSchema),
    defaultValues: {
      type: typeOptions[0],
      name: "",
      link: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof refFormSchema>) => {
    // Handle form submission
    console.log(data);
    toast.promise(updateBooksAndRefPublic(courseId, data), {
      loading: "Adding Reference",
      success: () => {
        form.reset();
        router.refresh();
        return "Reference Added";
      },
      error: "Failed to add Reference",
    });
  };

  return (
    <ResponsiveDialog
      title={`Add new reference or book for ${code}`}
      description="Fill the form below to add a new reference."
      btnProps={{
        children: "Submit Resources",
        type: "submit",
        variant: "dark",
        size: "sm",
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    variant="outline"
                    type="text"
                    placeholder="Enter Name of the resource"
                    required
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the name of the resource.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input
                    variant="outline"
                    type="url"
                    placeholder="Enter Link"
                    required
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the link to the reference.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select required onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ref type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="capitalize"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  This is the type of reference.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            width="content"
            size="sm"
            variant="dark"
            className="ml-2 md:mx-auto my-3"
          >
            Submit Resources
            <TbSend />
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
