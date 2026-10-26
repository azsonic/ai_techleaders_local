/** Example data for E03 stories: fictional sessions and payouts. Prices stay inside the R05 bounds. */
import type { PayoutView } from "@devmentor/ui/components/payments/payout-row";

export const PAYOUTS: PayoutView[] = [
  {
    id: "p1",
    startsAt: "2026-11-16T09:00:00Z",
    menteeName: "Jan Kowalski",
    pricePln: 120,
    status: "held",
  },
  {
    id: "p2",
    startsAt: "2026-11-12T13:00:00Z",
    menteeName: "Marta Zielińska",
    pricePln: 220,
    status: "held",
  },
  {
    id: "p3",
    startsAt: "2026-11-09T17:00:00Z",
    menteeName: "Piotr Nowak",
    pricePln: 93,
    status: "paid",
  },
  {
    id: "p4",
    startsAt: "2026-11-05T09:00:00Z",
    menteeName: "Ewa Mazur",
    pricePln: 150,
    status: "refunded",
  },
  {
    id: "p5",
    startsAt: "2026-11-03T14:00:00Z",
    menteeName: "Tomasz Lis",
    pricePln: 180,
    status: "in-dispute",
  },
];

const NAMES = ["Jan Kowalski", "Marta Zielińska", "Piotr Nowak", "Ewa Mazur"];
const STATUSES = ["paid", "paid", "held", "refunded"] as const;

/** Thirty sessions, to see how the table and the totals behave. */
export const MANY_PAYOUTS: PayoutView[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `many${index}`,
    startsAt: `2026-10-${String(1 + (index % 28)).padStart(2, "0")}T${String(9 + (index % 8)).padStart(2, "0")}:00:00Z`,
    menteeName: NAMES[index % NAMES.length],
    pricePln: 90 + (index % 6) * 30,
    status: STATUSES[index % STATUSES.length],
  }),
);

export const LONG_MENTEE_NAME =
  "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer";
