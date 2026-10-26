"use client";

import { useState } from "react";

import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type CopyState = "idle" | "copied" | "failed";

/*
 * The mentor's own link, with a copy action (D05). "Copied" appears as text beside the button and is announced;
 * a failed copy says what to do instead. Nothing here is a toast: the result belongs next to the button.
 */
export function ShareLink({
  url,
  label = "Your share link",
  description = "Anyone with this link can open your page, even if you are not listed.",
}: {
  url: string;
  label?: string;
  /** What the link does, in one sentence. The default is for a mentor's own page. */
  description?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <div className="flex flex-col gap-within-group sm:flex-row">
        <Input
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button type="button" variant="secondary" onClick={copy}>
          Copy link
        </Button>
      </div>
      {state === "copied" && (
        <p role="status" className="text-interface">
          Link copied.
        </p>
      )}
      {state === "failed" && (
        <FieldError>
          Could not copy. Select the link and copy it yourself.
        </FieldError>
      )}
    </Field>
  );
}
