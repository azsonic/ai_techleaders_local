import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { OperatorActionDialog } from "@devmentor/ui/components/operator/operator-action-dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@devmentor/ui/components/ui/alert";
import { Badge } from "@devmentor/ui/components/ui/badge";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import { LONG_AUTHOR } from "../../../.storybook/docs/e04-data";
import { MENTOR } from "../../../.storybook/docs/e05-data";
import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type SuspendState =
  | "ready"
  | "dialog-open"
  | "already-suspended"
  | "loading"
  | "load-error"
  | "not-found"
  | "long-text";

/*
 * Operator page for one mentor, /admin/mentors/[id] (E05-S03, D29, R13). Proposal: no E05 specification exists. Suspending hides the
 * profile and cancels future bookings with full refunds. The operator cannot edit the profile or the messages (D29). The
 * page shows the result only after the server confirmed (P12.1).
 */
const SuspendScreen = ({
  state,
  mode = "success",
}: {
  state: SuspendState;
  mode?: ApiMode;
}) => {
  const [open, setOpen] = useState(state === "dialog-open");
  const [suspended, setSuspended] = useState(false);
  const name = state === "long-text" ? LONG_AUTHOR : MENTOR.name;
  const isSuspended = state === "already-suspended" || suspended;

  if (state === "loading")
    return (
      <ScreenFrame width="prose">
        <h1 className="text-heading-page font-emphasis">Mentor</h1>
        <LoadingMessage label="Loading the mentor…" />
        <div aria-hidden>
          <Skeleton className="h-32 w-full" />
        </div>
      </ScreenFrame>
    );
  if (state === "load-error")
    return (
      <ScreenFrame width="prose">
        <h1 className="text-heading-page font-emphasis">Mentor</h1>
        <ErrorMessage
          title="The mentor did not load"
          message="Nothing was changed. Try again."
          action={
            <Button variant="secondary" size="dense">
              Try again
            </Button>
          }
        />
      </ScreenFrame>
    );
  if (state === "not-found")
    return (
      <ScreenFrame width="prose">
        <h1 className="text-heading-page font-emphasis">Mentor</h1>
        <EmptyState
          title="This mentor does not exist"
          description="The profile may have been anonymised on request (D30)."
          action={
            <a href="/admin/invitations" className={textLinkClassName}>
              Go to invitations
            </a>
          }
        />
      </ScreenFrame>
    );

  return (
    <ScreenFrame width="prose">
      <div className="flex flex-wrap items-center gap-within-group">
        <h1 className="min-w-0 text-heading-page font-emphasis wrap-anywhere">
          {name}
        </h1>
        <Badge variant={isSuspended ? "destructive" : "default"}>
          {isSuspended ? "Suspended" : "Listed"}
        </Badge>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-between-groups gap-y-within-group text-interface">
        <dt className="text-muted-foreground">E-mail</dt>
        <dd className="wrap-anywhere">{MENTOR.email}</dd>
        <dt className="text-muted-foreground">Future bookings</dt>
        <dd className="tabular-nums">
          {suspended ? 0 : MENTOR.futureBookings}
        </dd>
      </dl>
      {suspended && (
        <Alert>
          <AlertTitle>{name} is suspended</AlertTitle>
          <AlertDescription>
            The profile is hidden and {MENTOR.futureBookings} future bookings
            were cancelled with full refunds.{" "}
            <a href="/admin/audit" className={textLinkClassName}>
              See the audit log
            </a>
            .
          </AlertDescription>
        </Alert>
      )}
      {state === "already-suspended" && (
        <p className="text-interface text-muted-foreground">
          This mentor was suspended. The reason is in the{" "}
          <a href="/admin/audit" className={textLinkClassName}>
            audit log
          </a>
          .
        </p>
      )}
      {!isSuspended && (
        <div>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Suspend mentor
          </Button>
        </div>
      )}
      <OperatorActionDialog
        open={open}
        onOpenChange={setOpen}
        title={`Suspend ${name}?`}
        consequence={`The profile is hidden and ${MENTOR.futureBookings} future bookings are cancelled with full refunds.`}
        confirmLabel="Suspend mentor"
        loadingLabel="Suspending…"
        onConfirm={async (input) => {
          const result = await mockApiCall(
            mode,
            `/api/mentors/m1/suspend`,
            input,
          );
          if (result.ok) setSuspended(true);
          return result;
        }}
      />
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E05 Supply gate and pilot/Screens/Suspend a mentor",
  component: SuspendScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "ready" },
} satisfies Meta<typeof SuspendScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = { name: "Listed mentor with the action" };
export const DialogOpen: Story = {
  name: "Dialog open: reason required",
  args: { state: "dialog-open" },
};
export const AlreadySuspended: Story = {
  name: "Already suspended",
  args: { state: "already-suspended" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const NotFound: Story = {
  name: "Does not exist",
  args: { state: "not-found" },
};
export const LongText: Story = {
  name: "Long name",
  args: { state: "long-text" },
};

const suspends = (mode: ApiMode, name: string, expected: string): Story => ({
  name,
  args: { state: "dialog-open", mode },
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText("Reason"),
      "Two no-shows.",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Suspend mentor" }),
    );
    await waitFor(() => expect(dialog).toHaveTextContent(expected));
  },
});

export const Pending = suspends(
  "pending",
  "Suspending (pending)",
  "Suspending…",
);
export const ServerError = suspends(
  "server-error",
  "Server error",
  "Something broke on our side",
);
export const Offline = suspends(
  "offline",
  "Offline",
  "The server did not answer",
);

export const Suspended: Story = {
  name: "Suspended, after the server confirmed",
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Suspend mentor" }),
    );
    const dialog = await within(document.body).findByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText("Reason"),
      "Two no-shows.",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Suspend mentor" }),
    );
    await waitFor(() =>
      expect(within(canvasElement).getByRole("status")).toHaveTextContent(
        "Anna Kowalska is suspended",
      ),
    );
    expect(
      within(canvasElement).queryByRole("button", { name: "Suspend mentor" }),
    ).toBeNull();
  },
};
