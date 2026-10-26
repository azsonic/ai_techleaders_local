import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { AuditRow } from "@devmentor/ui/components/operator/audit-row";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/ui/table";

import {
  AUDIT,
  LONG_REASON,
  MANY_AUDIT,
} from "../../../.storybook/docs/e05-data";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type AuditState =
  "list" | "empty" | "loading" | "load-error" | "many" | "long-text";

/* Audit log, /admin/audit (E05-S03, R13, D29): every operator action with the operator, the time and the reason. Read only. */
const AuditLogScreen = ({ state }: { state: AuditState }) => {
  const rows =
    state === "many"
      ? MANY_AUDIT
      : state === "long-text"
        ? AUDIT.map((entry, index) =>
            index === 0 ? { ...entry, reason: LONG_REASON } : entry,
          )
        : AUDIT;

  return (
    <ScreenFrame>
      <h1 className="text-heading-page font-emphasis">Audit log</h1>
      {state === "loading" && (
        <div className="flex flex-col gap-within-group">
          <LoadingMessage label="Loading the audit log…" />
          <div aria-hidden className="flex flex-col gap-within-group">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      )}
      {state === "load-error" && (
        <ErrorMessage
          title="The audit log did not load"
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
          title="No operator actions yet"
          description="Revoking an invitation, suspending a mentor and viewing a session in dispute are logged here."
        />
      )}
      {(state === "list" || state === "many" || state === "long-text") && (
        <Table label="Operator actions">
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((entry) => (
              <AuditRow key={entry.id} entry={entry} zone="Europe/Warsaw" />
            ))}
          </TableBody>
        </Table>
      )}
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E05 Supply gate and pilot/Screens/Audit log",
  component: AuditLogScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "list" },
} satisfies Meta<typeof AuditLogScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Logged actions, newest first" };
export const Empty: Story = {
  name: "No operator actions yet",
  args: { state: "empty" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const Many: Story = {
  name: "Lots of data (30 actions)",
  args: { state: "many" },
};
export const LongText: Story = {
  name: "Long reason",
  args: { state: "long-text" },
};
