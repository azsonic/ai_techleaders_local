import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  PayoutRow,
  type PayoutStatus,
} from "@devmentor/ui/components/payments/payout-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/ui/table";

import { LONG_MENTEE_NAME } from "../../../.storybook/docs/e03-data";

const STATUSES: PayoutStatus[] = ["held", "paid", "refunded", "in-dispute"];

const InTable = ({
  rows,
}: {
  rows: Parameters<typeof PayoutRow>[0]["payout"][];
}) => (
  <div className="max-w-content">
    <Table label="Earnings">
      <TableHeader>
        <TableRow>
          <TableHead>Session</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Commission (20%)</TableHead>
          <TableHead className="text-right">You receive</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((payout) => (
          <PayoutRow key={payout.id} payout={payout} zone="Europe/Warsaw" />
        ))}
      </TableBody>
    </Table>
  </div>
);

const base = {
  id: "p1",
  startsAt: "2026-11-16T09:00:00Z",
  menteeName: "Jan Kowalski",
  pricePln: 120,
} as const;

const meta = {
  title: "Product/E03 Payments/Payout row",
  component: PayoutRow,
  parameters: { layout: "padded" },
  args: { payout: { ...base, status: "held" } },
  argTypes: {
    payout: {
      description:
        "One session: time, mentee, price and payout status. The commission is computed (R05, 20%).",
    },
  },
  render: (args) => <InTable rows={[args.payout]} />,
} satisfies Meta<typeof PayoutRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const EveryStatus: Story = {
  name: "Every status",
  render: () => (
    <InTable
      rows={STATUSES.map((status) => ({ ...base, id: status, status }))}
    />
  ),
};

export const FractionalAmounts: Story = {
  name: "Data: amounts with grosze",
  render: () => (
    <InTable
      rows={[
        { ...base, id: "a", pricePln: 93, status: "paid" },
        { ...base, id: "b", pricePln: 1111, status: "held" },
      ]}
    />
  ),
};

export const LongNameNarrow: Story = {
  name: "Data: long name, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <InTable
      rows={[{ ...base, menteeName: LONG_MENTEE_NAME, status: "in-dispute" }]}
    />
  ),
};
