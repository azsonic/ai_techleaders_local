"use client";

import type { ApiResult } from "@devmentor/core";

import { useForm } from "../../hooks/use-form";
import { FormFeedback } from "../form-feedback";
import { Button } from "../ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import {
  DAY_END,
  DAY_START,
  ZONE,
  validateWindow,
  type WindowValues,
} from "./windows";

const emptyWindow: WindowValues = { date: "", start: "", end: "" };

/*
 * Adds one availability window (E01-S02). The zone and the 10:00 to 22:00 limit are written in the form, not only in
 * the error (R08, D24). Times are typed in Europe/Warsaw, whatever the mentor's own zone. After a confirmed save the
 * fields clear so the next window can be added; after a failure everything stays.
 */
export function WindowForm({
  onSubmit,
  now = new Date(),
  onAdded,
}: {
  onSubmit: (values: WindowValues) => Promise<ApiResult<unknown>>;
  /** The current time, for refusing windows in the past. Defaults to the real clock. */
  now?: Date;
  onAdded?: () => void;
}) {
  const form = useForm<WindowValues>({
    initialValues: emptyWindow,
    validate: (values) => validateWindow(values, now),
    submit: onSubmit,
    onSuccess: () => {
      form.reset({ keepStatus: true });
      onAdded?.();
    },
  });
  const { errors } = form;

  return (
    <form
      onSubmit={form.handleSubmit}
      noValidate
      className="flex w-full max-w-prose flex-col gap-between-groups"
    >
      <p className="text-interface text-muted-foreground">
        Times are in {ZONE}. Windows run from {DAY_START} to {DAY_END} on one
        day.
      </p>
      <FieldGroup>
        <Field>
          <FieldLabel>Date</FieldLabel>
          <Input type="date" {...form.register("date")} />
          <FieldError>{errors.date}</FieldError>
        </Field>
        <div className="grid grid-cols-2 gap-between-groups">
          <Field>
            <FieldLabel>Start</FieldLabel>
            <Input type="time" {...form.register("start")} />
            <FieldError>{errors.start}</FieldError>
          </Field>
          <Field>
            <FieldLabel>End</FieldLabel>
            <Input type="time" {...form.register("end")} />
            <FieldError>{errors.end}</FieldError>
          </Field>
        </div>
        <FieldDescription>
          Mentees can book a slot only if it starts at least two hours from now.
        </FieldDescription>
      </FieldGroup>
      <FormFeedback
        status={form.status}
        serverError={form.serverError}
        successTitle="Window added"
        failureTitle="Could not add the window"
      />
      <Button
        type="submit"
        loading={form.status === "pending"}
        loadingLabel="Adding…"
        className="w-full sm:w-fit"
      >
        Add window
      </Button>
    </form>
  );
}
