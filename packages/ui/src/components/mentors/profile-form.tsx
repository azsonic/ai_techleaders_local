"use client";

import type { ApiResult } from "@devmentor/core";

import { useForm } from "../../hooks/use-form";
import { FormFeedback } from "../form-feedback";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { PRICE_BOUNDS, STACKS, type Stack } from "./pricing";

export type ProfileValues = {
  experience: string;
  stacks: Stack[];
  price25: string;
  price50: string;
  listed: boolean;
};

const EXPERIENCE_MAX = 1000;

const priceError = (value: string, length: 25 | 50): string | undefined => {
  if (value === "") return undefined;
  const { min, max } = PRICE_BOUNDS[length];
  const amount = Number(value);
  if (!Number.isInteger(amount)) return "Enter a whole number of zloty.";
  if (amount < min || amount > max)
    return `Enter a price from ${min} to ${max} PLN.`;
  return undefined;
};

/** Pure checks for the profile. Prices may stay empty: an unlisted mentor can save before pricing (E01 spec). */
export function validateProfile(values: ProfileValues) {
  const errors: Partial<Record<keyof ProfileValues, string>> = {};
  if (values.experience.length > EXPERIENCE_MAX)
    errors.experience = `Use at most ${EXPERIENCE_MAX} characters.`;
  const price25 = priceError(values.price25, 25);
  if (price25) errors.price25 = price25;
  const price50 = priceError(values.price50, 50);
  if (price50) errors.price50 = price50;
  return errors;
}

export const emptyProfile: ProfileValues = {
  experience: "",
  stacks: [],
  price25: "",
  price50: "",
  listed: false,
};

/*
 * Mentor profile form (E01-S01): the form pattern with the product's own fields. Both price bounds are written next to
 * the fields (R05). Listing stays off until the saved profile has both prices and a stack (D06, D24); the switch says
 * why while it is off.
 */
export function ProfileForm({
  initialValues = emptyProfile,
  canList,
  onSubmit,
}: {
  initialValues?: ProfileValues;
  /** True when the saved profile already has both prices and at least one stack. */
  canList: boolean;
  onSubmit: (values: ProfileValues) => Promise<ApiResult<unknown>>;
}) {
  const form = useForm<ProfileValues>({
    initialValues,
    validate: validateProfile,
    submit: onSubmit,
  });
  const { errors, values } = form;

  return (
    <form
      onSubmit={form.handleSubmit}
      noValidate
      className="flex w-full max-w-prose flex-col gap-section"
    >
      <FieldGroup>
        <Field>
          <FieldLabel optional>Experience</FieldLabel>
          <FieldDescription>
            What you have built and where. Up to {EXPERIENCE_MAX} characters.
          </FieldDescription>
          <Textarea rows={5} {...form.register("experience")} />
          <FieldError>{errors.experience}</FieldError>
        </Field>

        <FieldSet>
          <FieldLegend>Stacks you mentor in</FieldLegend>
          <FieldDescription>Choose at least one to be listed.</FieldDescription>
          {STACKS.map((stack, index) => (
            <Field key={stack.value} orientation="horizontal">
              <Checkbox
                ref={index === 0 ? form.refFor("stacks") : undefined}
                checked={values.stacks.includes(stack.value)}
                onCheckedChange={(checked) =>
                  form.setValue(
                    "stacks",
                    checked
                      ? [...values.stacks, stack.value]
                      : values.stacks.filter((value) => value !== stack.value),
                  )
                }
              />
              <FieldLabel>{stack.label}</FieldLabel>
            </Field>
          ))}
        </FieldSet>

        <Field>
          <FieldLabel optional>Price for 25 minutes (PLN)</FieldLabel>
          <FieldDescription>
            {PRICE_BOUNDS[25].min} to {PRICE_BOUNDS[25].max} PLN, whole zloty.
            You receive this price minus a 20% commission.
          </FieldDescription>
          <Input inputMode="numeric" {...form.register("price25")} />
          <FieldError>{errors.price25}</FieldError>
        </Field>

        <Field>
          <FieldLabel optional>Price for 50 minutes (PLN)</FieldLabel>
          <FieldDescription>
            {PRICE_BOUNDS[50].min} to {PRICE_BOUNDS[50].max} PLN, whole zloty.
          </FieldDescription>
          <Input inputMode="numeric" {...form.register("price50")} />
          <FieldError>{errors.price50}</FieldError>
        </Field>

        <Field orientation="horizontal">
          <Switch
            checked={values.listed}
            disabled={!canList}
            onCheckedChange={(checked) => form.setValue("listed", checked)}
          />
          <FieldContent>
            <FieldLabel>Listed in the directory</FieldLabel>
            <FieldDescription>
              {canList
                ? "Off means only people with your link can find you."
                : "Save both prices and at least one stack first. Then you can list your profile."}
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <FormFeedback
        status={form.status}
        serverError={form.serverError}
        successTitle="Profile saved"
        successDescription="Mentees see these changes now."
      />
      <Button
        type="submit"
        loading={form.status === "pending"}
        loadingLabel="Saving…"
        className="w-full sm:w-fit"
      >
        Save profile
      </Button>
    </form>
  );
}
