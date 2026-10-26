import type { ApiErrorBody } from "@devmentor/core";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import type { FormStatus } from "../hooks/use-form";

/*
 * Outcome of a form submit, shown above the submit button. Success appears only after the server confirmed
 * (P12.1). A failure says what happened and that the entries are kept (P12.2, P10.1). A network failure gets its own
 * wording because the person can only retry. Field errors are not repeated here: they sit on their fields.
 */
export function FormFeedback({
  status,
  serverError,
  successTitle,
  successDescription,
  failureTitle = "Could not save",
}: {
  status: FormStatus;
  serverError: ApiErrorBody | null;
  successTitle: string;
  successDescription?: string;
  failureTitle?: string;
}) {
  if (status === "success") {
    return (
      <Alert>
        <AlertTitle>{successTitle}</AlertTitle>
        {successDescription && (
          <AlertDescription>{successDescription}</AlertDescription>
        )}
      </Alert>
    );
  }

  if (!serverError) return null;

  const offline = serverError.code === "network_error";
  return (
    <Alert variant="destructive">
      <AlertTitle>
        {offline ? "The server did not answer" : failureTitle}
      </AlertTitle>
      <AlertDescription>
        {offline
          ? "Check your connection and try again. What you entered is kept."
          : serverError.message}
      </AlertDescription>
    </Alert>
  );
}
