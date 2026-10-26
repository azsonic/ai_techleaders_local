"use client";

import type { ApiResult } from "@devmentor/core";

import { useForm } from "../../hooks/use-form";
import { FormFeedback } from "../form-feedback";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";

/** The longest reason, in characters. Proposal: the same limit as "Report a problem" (D32). */
export const REASON_MAX = 1000;

/*
 * An operator action that changes someone else's data: suspend a mentor, revoke an invitation (E05-S03, R13, D29). The title
 * names the object, the description says what will happen, and a reason is required because every action is logged
 * with the operator, the time and that reason. It stays open until the server answers; Cancel is first and has the label
 * "Keep" so nobody has to decode "OK". Success is shown by the page after the server confirmed (P12.1).
 */
export function OperatorActionDialog({
  open,
  onOpenChange,
  title,
  consequence,
  confirmLabel,
  loadingLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A question that names the object, for example "Suspend Anna Kowalska?". */
  title: string;
  /** What will happen, in words. */
  consequence: string;
  /** A verb and an object, for example "Suspend mentor". */
  confirmLabel: string;
  /** Replaces the label while the server works, for example "Suspending…". */
  loadingLabel: string;
  onConfirm: (input: { reason: string }) => Promise<ApiResult<unknown>>;
}) {
  const form = useForm<{ reason: string }>({
    initialValues: { reason: "" },
    validate: ({ reason }) =>
      !reason.trim()
        ? { reason: "Write a reason. It is logged with the action." }
        : reason.length > REASON_MAX
          ? { reason: `Use at most ${REASON_MAX} characters.` }
          : {},
    submit: ({ reason }) => onConfirm({ reason: reason.trim() }),
    onSuccess: () => onOpenChange(false),
  });

  // The dialog has no trigger of its own, so the only change it reports is "close".
  const dismiss = () => {
    if (form.status === "pending") return;
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={dismiss}>
      <DialogContent>
        <form onSubmit={form.handleSubmit} noValidate className="contents">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{consequence}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field>
              <FieldLabel>Reason</FieldLabel>
              <FieldDescription>
                Logged with your e-mail and the time. Up to {REASON_MAX}{" "}
                characters. {form.values.reason.length} used.
              </FieldDescription>
              <Textarea rows={3} {...form.register("reason")} />
              <FieldError>{form.errors.reason}</FieldError>
            </Field>
            <FormFeedback
              status={form.status}
              serverError={form.serverError}
              successTitle="Done"
              failureTitle="The action was not carried out"
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="secondary" />}>
              Keep as it is
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              loading={form.status === "pending"}
              loadingLabel={loadingLabel}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
