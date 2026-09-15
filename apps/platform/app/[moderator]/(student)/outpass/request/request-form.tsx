"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import toast from "@/lib/toast";
import { requestOutpass } from "~/actions/student.outpass";
import {
  LOCAL_TRIP_REASONS,
  REASONS,
  requestOutPassSchema,
} from "~/constants/hostel.outpass";
import { formatIst, REASON_LABEL } from "../status";

type Reason = (typeof REASONS)[number];
type Values = {
  reason: Reason | "";
  address: string;
  out: string;
  in: string;
  roomNumber: string;
};
type Field = keyof Values;
type Errors = Partial<Record<Field | "form", string>>;

const FIELD_OF: Record<string, Field> = {
  reason: "reason",
  address: "address",
  expectedOutTime: "out",
  expectedInTime: "in",
  roomNumber: "roomNumber",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** A datetime-local value in IST, independent of the device timezone. */
function toIstInput(date: Date) {
  const ist = new Date(date.getTime() + 330 * 60_000);
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}T${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}`;
}

const fromIstInput = (value: string) =>
  value ? new Date(`${value}:00+05:30`) : null;

const roundedFromNow = (minutes: number) => {
  const d = new Date(Date.now() + minutes * 60_000);
  d.setUTCMinutes(Math.ceil(d.getUTCMinutes() / 15) * 15, 0, 0);
  return d;
};

function toPayload(v: Values, room: string) {
  const out = fromIstInput(v.out);
  const back = fromIstInput(v.in);
  return {
    reason: v.reason,
    address: v.address,
    expectedOutTime:
      out && !Number.isNaN(out.getTime()) ? out.toISOString() : "",
    expectedInTime:
      back && !Number.isNaN(back.getTime()) ? back.toISOString() : "",
    roomNumber: room === "UNKNOWN" ? v.roomNumber : room,
  };
}

function validate(v: Values, room: string): Errors {
  const parsed = requestOutPassSchema.safeParse(toPayload(v, room));
  if (parsed.success) return {};
  const errors: Errors = {};
  for (const issue of parsed.error.issues) {
    const field = FIELD_OF[String(issue.path[0])];
    if (field) errors[field] ??= issue.message;
  }
  return errors;
}

export function RequestOutpassForm({
  roomNumber,
  phoneNumber,
  successHref,
}: {
  roomNumber: string;
  phoneNumber: string | null;
  successHref: string;
}) {
  const id = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Values>(() => ({
    reason: "",
    address: "",
    out: toIstInput(roundedFromNow(15)),
    in: toIstInput(roundedFromNow(135)),
    roomNumber: "",
  }));
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const needsRoom = roomNumber === "UNKNOWN";
  const local = (LOCAL_TRIP_REASONS as readonly string[]).includes(
    values.reason
  );

  const set = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (Object.keys(touched).length > 0) setErrors(validate(next, roomNumber));
  };
  const touch = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values, roomNumber));
  };
  const shown = (field: Field) => (touched[field] ? errors[field] : undefined);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(values, roomNumber);
    setTouched({
      reason: true,
      address: true,
      out: true,
      in: true,
      roomNumber: true,
    });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = (
        ["reason", "address", "out", "in", "roomNumber"] as Field[]
      ).find((f) => found[f]);
      if (first) document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    startTransition(async () => {
      const payload = toPayload(values, roomNumber);
      const res = await requestOutpass(
        payload as Parameters<typeof requestOutpass>[0]
      ).catch(() => null);
      if (!res) {
        setErrors({
          form: "The server didn't answer. Check your connection and try again.",
        });
        return;
      }
      if (!res.ok) {
        setErrors({ form: res.error });
        return;
      }
      toast.success("Request sent to your warden.");
      router.push(successHref);
    });
  };

  const message = (field: Field, hint?: string) => {
    const error = shown(field);
    if (!error && !hint) return null;
    return (
      <p
        id={`${id}-${field}-msg`}
        className={cn(
          "text-caption",
          error ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {error ?? hint}
      </p>
    );
  };

  const preview = (value: string) => {
    const date = fromIstInput(value);
    return date && !Number.isNaN(date.getTime()) ? formatIst(date) : undefined;
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-body font-medium text-foreground">
          Reason
        </legend>
        <div
          id={`${id}-reason`}
          tabIndex={-1}
          className="grid grid-cols-2 gap-2 outline-none @md:grid-cols-5"
        >
          {REASONS.map((reason) => (
            <label
              key={reason}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-body font-medium transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                values.reason === reason
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={values.reason === reason}
                onChange={() => {
                  set("reason", reason);
                  setTouched((t) => ({ ...t, reason: true }));
                }}
                disabled={pending}
                className="sr-only"
              />
              {REASON_LABEL[reason]}
            </label>
          ))}
        </div>
        {message("reason")}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${id}-address`}
          className="text-body font-medium text-foreground"
        >
          Destination
        </label>
        <Input
          id={`${id}-address`}
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          onBlur={() => touch("address")}
          placeholder="Place and town, e.g. Main market, Hamirpur"
          autoComplete="off"
          maxLength={200}
          disabled={pending}
          aria-invalid={Boolean(shown("address"))}
          aria-describedby={`${id}-address-msg`}
        />
        {message("address", "Where the warden can expect you to be.")}
      </div>

      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
        {(
          [
            ["out", "Leaving at (IST)"],
            ["in", "Back by (IST)"],
          ] as const
        ).map(([field, label]) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label
              htmlFor={`${id}-${field}`}
              className="text-body font-medium text-foreground"
            >
              {label}
            </label>
            <Input
              id={`${id}-${field}`}
              type="datetime-local"
              value={values[field]}
              min={toIstInput(new Date())}
              step={300}
              onChange={(e) => set(field, e.target.value)}
              onBlur={() => touch(field)}
              disabled={pending}
              aria-invalid={Boolean(shown(field))}
              aria-describedby={`${id}-${field}-msg`}
              className="h-11 tabular-nums"
            />
            {message(field, preview(values[field]))}
          </div>
        ))}
      </div>

      {needsRoom && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${id}-roomNumber`}
            className="text-body font-medium text-foreground"
          >
            Room number
          </label>
          <Input
            id={`${id}-roomNumber`}
            value={values.roomNumber}
            onChange={(e) => set("roomNumber", e.target.value)}
            onBlur={() => touch("roomNumber")}
            autoComplete="off"
            disabled={pending}
            aria-invalid={Boolean(shown("roomNumber"))}
            aria-describedby={`${id}-roomNumber-msg`}
            className="font-mono"
          />
          {message(
            "roomNumber",
            "Your hostel record has no room yet. This also saves it to your record."
          )}
        </div>
      )}

      <div className="rounded-xl border border-border p-4">
        <p className="text-caption text-muted-foreground">Contact on file</p>
        <p className="text-body text-foreground">
          {phoneNumber ?? "No phone number on your hostel record."}
        </p>
        {!phoneNumber && (
          <p className="text-caption text-muted-foreground">
            Ask your hostel office to add one so the warden can reach you.
          </p>
        )}
      </div>

      <div
        className="rounded-xl border border-border bg-muted p-4"
        aria-live="polite"
      >
        <p className="text-body font-medium text-foreground">
          {values.reason
            ? `Rules for ${REASON_LABEL[values.reason].toLowerCase()}`
            : "Rules"}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-body text-muted-foreground">
          {local ? (
            <>
              <li>Leave by 6:00 PM and be back by 8:00 PM IST.</li>
              <li>Come back the same day.</li>
            </>
          ) : (
            <li>No fixed hours for this reason.</li>
          )}
          <li>
            You can't request another pass while one is waiting or in use.
          </li>
          <li>The gate only lets you out before your return time.</li>
        </ul>
      </div>

      {errors.form && (
        <p role="alert" className="text-body text-destructive">
          {errors.form}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 @md:flex-row @md:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() => router.push(successHref)}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Sending request" : "Send request"}
        </Button>
      </div>
    </form>
  );
}
