"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type { ApiErrorBody, ApiResult } from "@devmentor/core";

export type FormStatus = "idle" | "pending" | "success" | "error";

type StringKeys<V> = {
  [K in keyof V]: V[K] extends string ? K : never;
}[keyof V] &
  string;
type Errors<V> = Partial<Record<keyof V & string, string>>;

type UseFormOptions<V, T> = {
  initialValues: V;
  /** Pure check of the current values. Returns one message per invalid field, in plain words. */
  validate: (values: V) => Errors<V>;
  /** Sends the values. Resolves with the API envelope; it must not throw (use `apiCall`). */
  submit: (values: V) => Promise<ApiResult<T>>;
  /** Runs only after the server confirmed. */
  onSuccess?: (data: T) => void;
};

/**
 * The form pattern as one hook (see Patterns / Form): errors show after a field is left or after a submit,
 * the first invalid field takes focus, entered data is kept on every failure, a second submit is ignored
 * while one is pending, and success is reported only after the server confirmed.
 */
export function useForm<V extends Record<string, unknown>, T = unknown>({
  initialValues,
  validate,
  submit,
  onSuccess,
}: UseFormOptions<V, T>) {
  const [values, setValues] = useState<V>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<Errors<V>>({});
  const [serverError, setServerError] = useState<ApiErrorBody | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const pending = useRef(false);
  const elements = useRef<Partial<Record<string, HTMLElement | null>>>({});

  const names = Object.keys(initialValues) as Array<keyof V & string>;
  const clientErrors = validate(values);
  const errors: Errors<V> = {};
  for (const name of names) {
    const message =
      serverFieldErrors[name] ??
      (touched[name] || submitted ? clientErrors[name] : undefined);
    if (message) errors[name] = message;
  }

  const focusFirst = (found: Errors<V>) => {
    const first = names.find((name) => found[name]);
    if (first) elements.current[first]?.focus();
  };

  const setValue = useCallback(
    <K extends keyof V & string>(name: K, value: V[K]) => {
      setValues((current) => ({ ...current, [name]: value }));
      setServerFieldErrors((current) => ({ ...current, [name]: undefined }));
      setStatus((current) => (current === "success" ? "idle" : current));
    },
    [],
  );

  const touch = useCallback((name: string) => {
    setTouched((current) => ({ ...current, [name]: true }));
  }, []);

  /** Ref for a control that is not a plain text field, so the first error can take focus. */
  const refFor = (name: keyof V & string) => (element: HTMLElement | null) => {
    elements.current[name] = element;
  };

  /** Props for an Input or Textarea whose value is a string. */
  const register = (name: StringKeys<V>) => ({
    name,
    value: values[name] as string,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(name, event.target.value as V[typeof name]),
    onBlur: () => touch(name),
    ref: refFor(name),
  });

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (pending.current) return;

    setSubmitted(true);
    const found = validate(values);
    if (names.some((name) => found[name])) {
      setStatus("idle");
      setServerError(null);
      focusFirst(found);
      return;
    }

    pending.current = true;
    setStatus("pending");
    setServerError(null);
    setServerFieldErrors({});
    const result = await submit(values);
    pending.current = false;

    if (result.ok) {
      setStatus("success");
      onSuccess?.(result.data);
      return;
    }

    const fromServer: Errors<V> = {};
    for (const name of names) {
      const [message] = result.error.fieldErrors?.[name] ?? [];
      if (message) fromServer[name] = message;
    }
    const hasFieldErrors = names.some((name) => fromServer[name]);
    setServerFieldErrors(fromServer);
    setServerError(hasFieldErrors ? null : result.error);
    setStatus("error");
    focusFirst(fromServer);
  };

  /** Back to the initial values. `keepStatus` leaves a success message on screen, for a form that clears after saving. */
  const reset = ({ keepStatus = false }: { keepStatus?: boolean } = {}) => {
    setValues(initialValues);
    setTouched({});
    setSubmitted(false);
    setServerFieldErrors({});
    setServerError(null);
    if (!keepStatus) setStatus("idle");
  };

  return {
    values,
    errors,
    status,
    serverError,
    register,
    refFor,
    setValue,
    touch,
    handleSubmit,
    reset,
  };
}
