"use client";

import { createContext, useContext, useEffect } from "react";

/** Wires a control to its label, hint and error inside a Field, so callers never pass ids by hand. */
type FieldContextValue = {
  id: string;
  descriptionId: string;
  errorId: string;
  hasDescription: boolean;
  hasError: boolean;
  setHasDescription: (value: boolean) => void;
  setHasError: (value: boolean) => void;
};

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return useContext(FieldContext);
}

/** Props a control (input, textarea, select trigger) spreads to be announced with its hint and error. */
function useFieldControl() {
  const field = useFieldContext();
  if (!field) return {};

  const describedBy = [
    field.hasDescription ? field.descriptionId : undefined,
    field.hasError ? field.errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: field.id,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": field.hasError || undefined,
  };
}

/** Registers that a hint or an error is on screen, for the lifetime of the calling component. */
function useRegisterPart(
  set: ((value: boolean) => void) | undefined,
  present: boolean,
) {
  useEffect(() => {
    if (!set || !present) return;
    set(true);
    return () => set(false);
  }, [set, present]);
}

export { FieldContext, useFieldContext, useFieldControl, useRegisterPart };
export type { FieldContextValue };
