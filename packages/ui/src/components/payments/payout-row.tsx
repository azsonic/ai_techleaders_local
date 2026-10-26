import { TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { LocalTime } from "../bookings/local-time";
import { formatPln } from "../mentors/pricing";
import { formatGrosze, splitPrice } from "./payout";

export type PayoutStatus = "held" | "paid" | "refunded" | "in-dispute";

export type PayoutView = {
  id: string;
  startsAt: string;
  menteeName: string;
  pricePln: number;
  status: PayoutStatus;
};

const LABEL: Record<PayoutStatus, string> = {
  held: "Held",
  paid: "Paid",
  refunded: "Refunded",
  "in-dispute": "In dispute",
};

/** Paid is the settled outcome and is filled; waiting is bordered; a dispute is red-bordered (R01.5). */
const VARIANT: Record<PayoutStatus, "default" | "secondary" | "destructive"> = {
  held: "secondary",
  paid: "default",
  refunded: "secondary",
  "in-dispute": "destructive",
};

/*
 * One session in the mentor's earnings table (E03-S03): price, the 20% commission and what the mentor receives, with the
 * payout state in words. A refunded session pays nothing. Money is right-aligned in tabular figures so columns compare.
 */
export function PayoutRow({
  payout,
  zone,
}: {
  payout: PayoutView;
  zone?: string;
}) {
  const { startsAt, menteeName, pricePln, status } = payout;
  const refunded = status === "refunded";
  const split = splitPrice(pricePln);
  const money = "text-right tabular-nums";

  return (
    <TableRow data-slot="payout-row">
      <TableCell className="min-w-48 wrap-anywhere">
        <LocalTime iso={startsAt} zone={zone} />
        <span className="block text-muted-foreground">with {menteeName}</span>
      </TableCell>
      <TableCell className={money}>{formatPln(pricePln)}</TableCell>
      <TableCell className={money}>
        {refunded ? "0 PLN" : formatGrosze(split.commission)}
      </TableCell>
      <TableCell className={`${money} font-emphasis`}>
        {refunded ? "0 PLN" : formatGrosze(split.payout)}
      </TableCell>
      <TableCell>
        <Badge variant={VARIANT[status]} className="whitespace-nowrap">
          {LABEL[status]}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
