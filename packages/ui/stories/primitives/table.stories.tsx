import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Badge } from "@devmentor/ui/components/ui/badge";
import { Button } from "@devmentor/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/ui/table";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const INVITATIONS = [
  {
    email: "anna.kowalska@example.com",
    status: "Accepted",
    variant: "default",
    sent: "21 Oct",
  },
  {
    email: "jan.nowak@example.com",
    status: "Pending",
    variant: "secondary",
    sent: "23 Oct",
  },
  {
    email: "Open link (no e-mail)",
    status: "Expired",
    variant: "secondary",
    sent: "12 Oct",
  },
  {
    email: "maria.zielinska@example.com",
    status: "Revoked",
    variant: "destructive",
    sent: "18 Oct",
  },
] as const;

const InvitationsTable = () => (
  <Table label="Invitations">
    <TableCaption>Invitations sent in October</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Invited</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Sent</TableHead>
        <TableHead>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {INVITATIONS.map((invitation) => (
        <TableRow key={invitation.email}>
          <TableCell>{invitation.email}</TableCell>
          <TableCell>
            <Badge variant={invitation.variant}>{invitation.status}</Badge>
          </TableCell>
          <TableCell className="text-muted-foreground">
            {invitation.sent}
          </TableCell>
          <TableCell className="text-right">
            {invitation.status === "Pending" && (
              <Button variant="ghost" size="dense">
                Revoke
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const meta = {
  title: "Primitives/Table",
  component: Table,
  parameters: { layout: "padded" },
  args: { label: "Invitations" },
  argTypes: {
    label: {
      control: "text",
      description: "Names the scrollable region, for example “Invitations”.",
    },
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = { render: () => <InvitationsTable /> };

export const StateMatrixStory: Story = {
  name: "State matrix",
  render: () => (
    <StateMatrix
      rows={["Row"]}
      states={["default", "hover", "focus"]}
      render={(_row, state) => (
        <Table
          label={`Row, ${state}`}
          {...(state === "focus" ? { "data-preview-state": "focus" } : {})}
        >
          <TableBody>
            <TableRow {...frozen(state === "focus" ? "default" : state)}>
              <TableCell>jan.nowak@example.com</TableCell>
              <TableCell>Pending</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    />
  ),
};

export const WideOnNarrowScreen: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="w-full max-w-80">
      <InvitationsTable />
    </div>
  ),
};

export const ScrollRegionByKeyboard: Story = {
  name: "Interaction: the table scrolls by keyboard and names its columns",
  render: () => (
    <div className="w-full max-w-80">
      <InvitationsTable />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Invitations" });

    await userEvent.tab();
    expect(region).toHaveFocus();

    expect(canvas.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(canvas.getAllByRole("row")).toHaveLength(INVITATIONS.length + 1);
  },
};
