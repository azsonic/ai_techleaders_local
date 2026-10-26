"use client";

import type { ApiResult } from "@devmentor/core";

import { useForm } from "../../hooks/use-form";
import { FormFeedback } from "../form-feedback";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export type UsefulnessAnswer = "yes" | "no" | "no-deadline";

const OPTIONS: { value: UsefulnessAnswer; label: string }[] = [
  { value: "yes", label: "Yes, it arrived in time" },
  { value: "no", label: "No, it arrived too late" },
  { value: "no-deadline", label: "I had no deadline" },
];

const labelOf = (answer: UsefulnessAnswer) =>
  OPTIONS.find((option) => option.value === answer)?.label as string;

/*
 * The one question after a session (E04-S02, brief "User outcome check", D11): did the help arrive before the developer's
 * deadline. Three answers (the third is for a mentee with no deadline, so nobody has to give a false one), no stars and no scale (N02, N01). It is a form (Patterns / Form): the answer is required,
 * a missing one is named and takes focus, the button is busy while the server works, and "saved" appears only after the
 * server confirmed. An answered check shows the answer as text.
 */
export function UsefulnessCheck({
  mentorName,
  answered,
  onSubmit,
}: {
  mentorName: string;
  /** Set when the mentee has already answered. */
  answered?: UsefulnessAnswer;
  onSubmit: (answer: UsefulnessAnswer) => Promise<ApiResult<unknown>>;
}) {
  const form = useForm<{ answer: string }>({
    initialValues: { answer: "" },
    validate: ({ answer }) => (answer ? {} : { answer: "Choose an answer." }),
    submit: ({ answer }) => onSubmit(answer as UsefulnessAnswer),
  });

  const result =
    answered ?? (form.status === "success" ? form.values.answer : "");
  if (result) {
    return (
      <section
        data-slot="usefulness-check"
        aria-label="Your answer"
        className="flex flex-col gap-within-group text-interface"
      >
        <FormFeedback
          status={form.status}
          serverError={null}
          successTitle="Thank you. Your answer is saved."
        />
        <p>
          Did the help from {mentorName} arrive before your deadline?{" "}
          <strong className="font-emphasis">
            {labelOf(result as UsefulnessAnswer)}.
          </strong>
        </p>
      </section>
    );
  }

  return (
    <form
      data-slot="usefulness-check"
      onSubmit={form.handleSubmit}
      noValidate
      className="flex flex-col gap-between-groups"
    >
      <FieldSet>
        <FieldLegend>
          Did the help from {mentorName} arrive before your deadline?
        </FieldLegend>
        <RadioGroup
          value={form.values.answer}
          onValueChange={(next) => form.setValue("answer", next as string)}
        >
          {OPTIONS.map((option, index) => (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem
                value={option.value}
                ref={index === 0 ? form.refFor("answer") : undefined}
              />
              <FieldLabel>{option.label}</FieldLabel>
            </Field>
          ))}
        </RadioGroup>
        <FieldError>{form.errors.answer}</FieldError>
      </FieldSet>
      <FormFeedback
        status={form.status}
        serverError={form.serverError}
        successTitle="Thank you. Your answer is saved."
        failureTitle="Your answer was not saved"
      />
      <div>
        <Button
          type="submit"
          loading={form.status === "pending"}
          loadingLabel="Sending…"
        >
          Send answer
        </Button>
      </div>
    </form>
  );
}
