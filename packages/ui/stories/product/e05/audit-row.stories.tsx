import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  AuditRow,
  type AuditEntry,
} from "@devmentor/ui/components/operator/audit-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/ui/table";

import { AUDIT, LONG_REASON } from "../../../.storybook/docs/e05-data";

const InTable = ({ rows }: { rows: AuditEntry[] }) => (
  <div className="max-w-content">
    <Table label="Audit log">
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
  </div>
);

const meta = {
  title: "Product/E05 Supply gate and pilot/Audit row",
  component: AuditRow,
  parameters: { layout: "padded" },
  args: { entry: AUDIT[0] },
  argTypes: {
    entry: {
      description:
        "When, who, what and the reason: all four are always present (R13).",
    },
  },
  render: (args) => <InTable rows={[args.entry]} />,
} satisfies Meta<typeof AuditRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Several: Story = {
  name: "Several entries",
  render: () => <InTable rows={AUDIT} />,
};
export const LongReasonNarrow: Story = {
  name: "Data: long reason, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <InTable rows={[{ ...AUDIT[0], reason: LONG_REASON }]} />,
};
