import { formatPln } from "../mentors/pricing";

/*
 * Every way a paid booking can end without the session taking place as planned, from the mentee's side (R04, R09, R15,
 * R16, D32, D33). The booking policy in `core` picks the outcome; this component only words it.
 */
export type MoneyOutcome =
  | "grace"
  | "full"
  | "late"
  | "mentor-cancelled"
  | "mentor-absent"
  | "nobody-present"
  | "mentee-absent";

type Wording = { refund: boolean; sameDay?: boolean; reason: string };

const WORDING: Record<MoneyOutcome, Wording> = {
  grace: {
    refund: true,
    reason: "You cancelled within 15 minutes of booking.",
  },
  full: {
    refund: true,
    reason: "You cancelled at least two hours before the start.",
  },
  late: {
    refund: false,
    reason:
      "You cancelled less than two hours before the start. The mentor is paid.",
  },
  "mentor-cancelled": {
    refund: true,
    sameDay: true,
    reason: "The mentor cancelled.",
  },
  "mentor-absent": {
    refund: true,
    sameDay: true,
    reason: "The mentor did not open the session in the first 10 minutes.",
  },
  "nobody-present": {
    refund: true,
    reason:
      "Neither of you opened the session in the first 10 minutes. The operator has been told.",
  },
  "mentee-absent": {
    refund: false,
    reason:
      "You did not open the session in the first 10 minutes. The mentor is paid.",
  },
};

/*
 * The money outcome as one line: the amount first, in the strongest weight (R01.5), then the reason (P10.1). Until
 * payments process it says "due", never "refunded" (E02 spec); once they have, `settled` switches the wording.
 */
export function RefundOutcomeLine({
  outcome,
  pricePln,
  settled = false,
}: {
  outcome: MoneyOutcome;
  pricePln: number;
  /** The refund has been made. */
  settled?: boolean;
}) {
  const { refund, sameDay, reason } = WORDING[outcome];
  const amount = formatPln(pricePln);
  const headline = !refund
    ? "No refund."
    : settled
      ? `Refunded in full: ${amount}.`
      : `Full refund due: ${amount}${sameDay ? ", the same day" : ""}.`;

  return (
    <p data-slot="refund-outcome-line" className="text-interface wrap-anywhere">
      <strong className="font-emphasis">{headline}</strong>{" "}
      <span className="text-muted-foreground">{reason}</span>
    </p>
  );
}
