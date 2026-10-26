"use client";

import { useId, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

import { Label } from "@devmentor/ui/components/ui/label";
import {
  FieldContext,
  useFieldContext,
  useRegisterPart,
} from "@devmentor/ui/components/ui/field-context";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-between-groups", className)}
      {...props}
    />
  );
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("mb-within-group text-interface font-emphasis", className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-between-groups", className)}
      {...props}
    />
  );
}

const fieldVariants = cva("flex w-full gap-within-group", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal:
        "flex-row items-start [&>[data-slot=field-label]]:py-inline [&>[role=checkbox]]:mt-inline [&>[role=radio]]:mt-inline [&>[role=switch]]:mt-inline",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

/**
 * One labelled control with an optional hint and error. Label, hint and error are connected to the
 * control through context; the error is announced and marks the control invalid.
 */
function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  const base = useId();
  const [hasDescription, setHasDescription] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <FieldContext.Provider
      value={{
        id: `${base}-control`,
        descriptionId: `${base}-description`,
        errorId: `${base}-error`,
        hasDescription,
        hasError,
        setHasDescription,
        setHasError,
      }}
    >
      <div
        data-slot="field"
        data-orientation={orientation}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      />
    </FieldContext.Provider>
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-1 flex-col gap-inline", className)}
      {...props}
    />
  );
}

/** Always visible. A placeholder is an example, never the field name. Required is the default; optional fields say so. */
function FieldLabel({
  className,
  optional = false,
  children,
  ...props
}: React.ComponentProps<typeof Label> & { optional?: boolean }) {
  const field = useFieldContext();

  return (
    <Label
      data-slot="field-label"
      htmlFor={field?.id}
      className={cn("w-fit", className)}
      {...props}
    >
      {children}
      {optional && (
        <>
          {" "}
          <span className="font-body text-muted-foreground">(optional)</span>
        </>
      )}
    </Label>
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  const field = useFieldContext();
  useRegisterPart(field?.setHasDescription, true);

  return (
    <p
      data-slot="field-description"
      id={field?.descriptionId}
      className={cn("text-interface text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const field = useFieldContext();
  const messages = [
    ...new Set((errors ?? []).map((error) => error?.message).filter(Boolean)),
  ] as string[];
  const content =
    children ??
    (messages.length === 1 ? (
      messages[0]
    ) : messages.length > 1 ? (
      <ul className="ml-between-groups flex list-disc flex-col gap-inline">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    ) : null);
  useRegisterPart(field?.setHasError, Boolean(content));

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      id={field?.errorId}
      className={cn("text-interface text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldContent,
};
