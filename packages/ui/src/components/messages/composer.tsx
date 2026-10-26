"use client";

import { useRef, useState, type FormEvent } from "react";

import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";

/*
 * The box a participant writes in (E04-S01, R02.2): always visible beside the conversation, with a visible label (a
 * placeholder is not a field name). Enter adds a line; sending is the button, because no keyboard shortcut is decided.
 * It sends and clears at once; the message's own state ("Sending", "Not sent") lives in the conversation, so a person
 * can keep writing while one message is in flight and a failure never loses the text (P12.1, P12.2).
 * When writing is not possible the reason is written beside it and read with the field (WCAG 3.3.2).
 */
export function Composer({
  onSend,
  disabledReason,
}: {
  onSend: (body: string) => void;
  /** Set when nobody can write now, for example "This session has ended." */
  disabledReason?: string;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const field = useRef<HTMLTextAreaElement>(null);
  const disabled = Boolean(disabledReason);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = value.trim();
    if (!body) {
      setError("Write a message to send.");
      field.current?.focus();
      return;
    }
    setError(undefined);
    setValue("");
    onSend(body);
  };

  return (
    <form
      data-slot="composer"
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-within-group"
    >
      <Field>
        <FieldLabel>Message</FieldLabel>
        {disabledReason && (
          <FieldDescription>{disabledReason}</FieldDescription>
        )}
        <Textarea
          ref={field}
          rows={2}
          value={value}
          disabled={disabled}
          className="max-h-40"
          onChange={(event) => {
            setValue(event.target.value);
            setError(undefined);
          }}
        />
        <FieldError>{error}</FieldError>
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={disabled}>
          Send message
        </Button>
      </div>
    </form>
  );
}
