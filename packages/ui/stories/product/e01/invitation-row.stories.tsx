import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { InvitationRow } from "@devmentor/ui/components/invitations/invitation-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/ui/table";

import { INVITATIONS } from "../../../.storybook/docs/e01-data";

const meta = {
  title: "Product/E01 Mentor supply/Invitation row",
  component: InvitationRow,
  parameters: { layout: "padded" },
  args: { invitation: INVITATIONS[0], onRevoke: fn() },
  render: (args) => (
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
        <InvitationRow {...args} />
      </TableBody>
    </Table>
  ),
} satisfies Meta<typeof InvitationRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllStatuses: Story = {
  name: "Data: every status",
  render: (args) => (
    <Table label="Invitations, every status">
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
        {INVITATIONS.map((invitation) => (
          <InvitationRow
            key={invitation.id}
            invitation={invitation}
            onRevoke={args.onRevoke}
          />
        ))}
      </TableBody>
    </Table>
  ),
};

export const LongEmailNarrow: Story = {
  name: "Data: long e-mail, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    invitation: {
      id: "long",
      email:
        "aleksandra.wisniewska-kowalczyk.nowak@very-long-company-domain-name.example",
      status: "pending",
      expires: "26 Nov",
    },
  },
};

export const RevokeCallsBack: Story = {
  name: "Interaction: revoke reports the invitation",
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", {
        name: /Revoke invitation for marta/,
      }),
    );
    expect(args.onRevoke).toHaveBeenCalledWith("i1");
  },
};
