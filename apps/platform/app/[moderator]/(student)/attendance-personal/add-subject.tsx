"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ControlledResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Plus } from "lucide-react";
import { useId, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { createAttendance } from "~/actions/student.record_personal";
import {
  type AttendanceSubjectInput,
  attendanceSubjectSchema,
} from "~/constants/attendance.personal";

type Field = keyof AttendanceSubjectInput;
type Errors = Partial<Record<Field | "form", string>>;

const EMPTY: AttendanceSubjectInput = { subjectCode: "", subjectName: "" };

function validate(values: AttendanceSubjectInput): Errors {
  const parsed = attendanceSubjectSchema.safeParse(values);
  if (parsed.success) return {};
  const errors: Errors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as Field;
    errors[key] ??= issue.message;
  }
  return errors;
}

export function AddSubjectButton({
  size = "default",
}: {
  size?: "default" | "sm";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Add subject
      </Button>
      <ControlledResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add a subject"
        description="Use the code and name from your timetable. You can delete a subject later from its history page."
      >
        {open && <AddSubjectForm onDone={() => setOpen(false)} />}
      </ControlledResponsiveDialog>
    </>
  );
}

function AddSubjectForm({ onDone }: { onDone: () => void }) {
  const id = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [pending, startTransition] = useTransition();

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    setTouched({ subjectCode: true, subjectName: true });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    startTransition(async () => {
      const res = await createAttendance(values).catch(() => null);
      if (!res) {
        setErrors({ form: "The server didn't answer. Try again." });
        return;
      }
      if (!res.ok) {
        setErrors({ form: res.error });
        return;
      }
      toast.success(`${values.subjectName.trim()} added.`);
      onDone();
    });
  };

  const fields: {
    name: Field;
    label: string;
    placeholder: string;
    hint: string;
  }[] = [
    {
      name: "subjectCode",
      label: "Subject code",
      placeholder: "CS-301",
      hint: "Letters, then three digits.",
    },
    {
      name: "subjectName",
      label: "Subject name",
      placeholder: "Database Management Systems",
      hint: "As it appears on your timetable.",
    },
  ];

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 pb-4">
      {fields.map((f) => {
        const error = touched[f.name] ? errors[f.name] : undefined;
        const inputId = `${id}-${f.name}`;
        return (
          <div key={f.name} className="flex flex-col gap-1.5">
            <label
              htmlFor={inputId}
              className="text-body font-medium text-foreground"
            >
              {f.label}
            </label>
            <Input
              id={inputId}
              name={f.name}
              value={values[f.name]}
              placeholder={f.placeholder}
              autoComplete="off"
              autoCapitalize={f.name === "subjectCode" ? "characters" : "words"}
              onChange={(e) => update(f.name, e.target.value)}
              onBlur={() => blur(f.name)}
              disabled={pending}
              aria-invalid={Boolean(error)}
              aria-describedby={`${inputId}-msg`}
              className={f.name === "subjectCode" ? "font-mono" : undefined}
            />
            <p
              id={`${inputId}-msg`}
              className={
                error
                  ? "text-caption text-destructive"
                  : "text-caption text-muted-foreground"
              }
            >
              {error ?? f.hint}
            </p>
          </div>
        );
      })}
      {errors.form && (
        <p role="alert" className="text-body text-destructive">
          {errors.form}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} width="full">
        {pending ? "Adding subject" : "Add subject"}
      </Button>
    </form>
  );
}
