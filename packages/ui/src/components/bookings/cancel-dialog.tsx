"use client";

import type { ApiResult } from "@devmentor/core";

import { useForm } from "../../hooks/use-form";
import { useViewerZone } from "../../hooks/use-viewer-zone";
import { formatDay, formatTime } from "../availability/windows";
import { FormFeedback } from "../form-feedback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { REFUND_OUTCOME_TEXT, type RefundOutcome } from "./refund-outcome";

export const CANCEL_REASONS = [
  { value: "out-of-scope", label: "The question is out of scope" },
  { value: "unavailable", label: "I am unavailable" },
  { value: "other", label: "Other" },
] as const;

type CancelInput = { reason?: string; note?: string };

type CancelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counterpartName: string;
  startsAt: string;
  zone?: string;
  /** Cancels on the server. The dialog stays open until it resolves. */
  onConfirm: (input: CancelInput) => Promise<ApiResult<unknown>>;
} & ({ viewer: "mentee"; outcome: RefundOutcome } | { viewer: "mentor" });

/*
 * Cancel a confirmed session (E02-S04, E02-S05). A mentee answers a question (confirmation dialog) whose text states the
 * refund outcome. A mentor has a task (dialog): a required reason from a fixed list, which the mentee and the operator
 * see (R17, D34). Both stay open until the server answers, keep Cancel first and name the session in the title.
 */
export function CancelDialog(props: CancelDialogProps) {
  const { open, onOpenChange, counterpartName, startsAt, zone, onConfirm } =
    props;
  const viewerZone = useViewerZone(zone);
  const title = `Cancel ${formatDay(startsAt, viewerZone)}, ${formatTime(startsAt, viewerZone)} with ${counterpartName}?`;

  const form = useForm<{ reason: string; note: string }>({
    initialValues: { reason: "", note: "" },
    validate: (values) =>
      props.viewer === "mentor" && !values.reason
        ? { reason: "Choose a reason." }
        : {},
    submit: (values) => onConfirm(props.viewer === "mentor" ? values : {}),
    onSuccess: () => onOpenChange(false),
  });
  const { values, errors } = form;

  // The dialog has no trigger of its own, so the only change it reports is "close".
  const dismiss = () => {
    if (form.status === "pending") return;
    form.reset();
    onOpenChange(false);
  };

  if (props.viewer === "mentee") {
    return (
      <AlertDialog open={open} onOpenChange={dismiss}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {REFUND_OUTCOME_TEXT[props.outcome]}
            </AlertDialogDescription>
            <FormFeedback
              status={form.status}
              serverError={form.serverError}
              successTitle="Session cancelled"
              failureTitle="The session was not cancelled"
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep session</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              loading={form.status === "pending"}
              loadingLabel="Cancelling…"
              onClick={() => form.handleSubmit()}
            >
              Cancel session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={dismiss}>
      <DialogContent>
        <form onSubmit={form.handleSubmit} noValidate className="contents">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {counterpartName} gets a full refund, due when payments process.
              Your reason is shown to {counterpartName} and to the operator.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FieldSet>
              <FieldLegend>Reason</FieldLegend>
              <RadioGroup
                value={values.reason}
                onValueChange={(next) =>
                  form.setValue("reason", next as string)
                }
              >
                {CANCEL_REASONS.map((reason, index) => (
                  <Field key={reason.value} orientation="horizontal">
                    <RadioGroupItem
                      value={reason.value}
                      ref={index === 0 ? form.refFor("reason") : undefined}
                    />
                    <FieldLabel>{reason.label}</FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
              <FieldError>{errors.reason}</FieldError>
            </FieldSet>
            <Field>
              <FieldLabel optional>Note</FieldLabel>
              <FieldDescription>Added to the reason.</FieldDescription>
              <Textarea rows={3} {...form.register("note")} />
            </Field>
            <FormFeedback
              status={form.status}
              serverError={form.serverError}
              successTitle="Session cancelled"
              failureTitle="The session was not cancelled"
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="secondary" />}>
              Keep session
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              loading={form.status === "pending"}
              loadingLabel="Cancelling…"
            >
              Cancel session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
