import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { OperatorActionDialog } from "@devmentor/ui/components/operator/operator-action-dialog";
import {
  InvitationRow,
  type Invitation,
} from "@devmentor/ui/components/invitations/invitation-row";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@devmentor/ui/components/ui/alert";
import { Button } from "@devmentor/ui/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@devmentor/ui/components/ui/field";
import { Input } from "@devmentor/ui/components/ui/input";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/ui/table";
import { ShareLink } from "@devmentor/ui/components/mentors/share-link";

import { INVITATIONS } from "../../../.storybook/docs/e01-data";
import { mockApiCall } from "../../../.storybook/docs/mock-api";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type InvitationState =
  | "list"
  | "empty"
  | "loading"
  | "load-error"
  | "created"
  | "conflict"
  | "many"
  | "revoke-open";

const MANY = Array.from({ length: 40 }, (_, index) => ({
  ...INVITATIONS[index % INVITATIONS.length],
  id: `many-${index}`,
  email:
    INVITATIONS[index % INVITATIONS.length].email &&
    `mentor${index}@example.com`,
}));

/* Operator invitations page, /admin/invitations (E01-S01). Operator pages use the shadcn-derived primitives. */
const InvitationsScreen = ({ state }: { state: InvitationState }) => {
  const rows = state === "many" ? MANY : INVITATIONS;
  const [revoked, setRevoked] = useState<string[]>([]);
  const [revoking, setRevoking] = useState<Invitation | null>(
    state === "revoke-open"
      ? (INVITATIONS.find((row) => row.status === "pending") ?? null)
      : null,
  );
  const shown = rows.map((row) =>
    revoked.includes(row.id) ? { ...row, status: "revoked" as const } : row,
  );

  return (
    <ScreenFrame>
      <h1 className="text-heading-page font-emphasis">Invitations</h1>

      <section
        aria-labelledby="create"
        className="flex max-w-prose flex-col gap-between-groups"
      >
        <h2 id="create" className="text-heading-section font-emphasis">
          Invite a mentor
        </h2>
        <form className="flex flex-col gap-between-groups" noValidate>
          <Field>
            <FieldLabel optional>E-mail address</FieldLabel>
            <FieldDescription>
              Leave it empty and anyone with the link can accept it, once.
            </FieldDescription>
            <Input
              type="email"
              defaultValue={
                state === "conflict" ? "anna.kowalska@example.com" : ""
              }
            />
            {state === "conflict" && (
              <FieldError>This person already has a mentor profile.</FieldError>
            )}
          </Field>
          <Button type="submit" className="w-full sm:w-fit">
            Create invitation
          </Button>
        </form>
        {state === "created" && (
          <Alert>
            <AlertTitle>Invitation created</AlertTitle>
            <AlertDescription>
              Copy the link now. It is shown only once.
            </AlertDescription>
          </Alert>
        )}
        {state === "created" && (
          <ShareLink
            label="Invitation link"
            url="https://devmentor.example/join/Xk3vQ9mT2wLp"
          />
        )}
      </section>

      <section
        aria-labelledby="list"
        className="flex flex-col gap-between-groups"
      >
        <h2 id="list" className="text-heading-section font-emphasis">
          All invitations
        </h2>
        {state === "loading" && (
          <div className="flex flex-col gap-within-group">
            <LoadingMessage label="Loading invitations…" />
            <div aria-hidden className="flex flex-col gap-within-group">
              <Skeleton className="h-control-dense w-full" />
              <Skeleton className="h-control-dense w-full" />
              <Skeleton className="h-control-dense w-full" />
            </div>
          </div>
        )}
        {state === "load-error" && (
          <ErrorMessage
            title="Invitations did not load"
            message="Nothing was changed. Try again."
            action={
              <Button variant="secondary" size="dense">
                Try again
              </Button>
            }
          />
        )}
        {state === "empty" && (
          <EmptyState
            title="No invitations yet"
            description="Create the first one above. The mentor gets a link to open."
          />
        )}
        {(state === "list" ||
          state === "created" ||
          state === "conflict" ||
          state === "many") && (
          <Table label="Invitations">
            <TableHeader>
              <TableRow>
                <TableHead>Sent to</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onRevoke={() => setRevoking(invitation)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </section>
      {revoking && (
        <OperatorActionDialog
          open
          onOpenChange={(open) => !open && setRevoking(null)}
          title={`Revoke the invitation for ${revoking.email ?? "anyone with the link"}?`}
          consequence="The link stops working. The invitation stays in the list and is still counted by the gate."
          confirmLabel="Revoke invitation"
          loadingLabel="Revoking…"
          onConfirm={async (input) => {
            const result = await mockApiCall(
              "success",
              `/api/invitations/${revoking.id}/revoke`,
              input,
            );
            if (result.ok) setRevoked((current) => [...current, revoking.id]);
            return result;
          }}
        />
      )}
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E01 Mentor supply/Screens/Admin invitations",
  component: InvitationsScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InvitationsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = {
  name: "Invitations in every status",
  args: { state: "list" },
};
export const Empty: Story = {
  name: "No invitations yet",
  args: { state: "empty" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const Created: Story = {
  name: "Created, link shown once",
  args: { state: "created" },
};
export const Conflict: Story = {
  name: "Create refused (person already a mentor)",
  args: { state: "conflict" },
};
export const Many: Story = {
  name: "Lots of data (40 invitations)",
  args: { state: "many" },
};

export const RevokeOpen: Story = {
  name: "Revoke: reason required",
  args: { state: "revoke-open" },
};

export const Revoked: Story = {
  name: "Revoked, after the server confirmed",
  args: { state: "list" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const before = canvas.queryAllByText("Revoked").length;
    await userEvent.click(
      canvas.getAllByRole("button", { name: /^Revoke invitation for/ })[0],
    );
    const dialog = await within(document.body).findByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText("Reason"),
      "Sent to the wrong address.",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Revoke invitation" }),
    );
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog")).toBeNull(),
    );
    expect(canvas.queryAllByText("Revoked")).toHaveLength(before + 1);
  },
};
