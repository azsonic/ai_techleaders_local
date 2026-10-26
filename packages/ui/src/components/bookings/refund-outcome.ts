/*
 * What a cancellation means for the money, in words. Until payments process (E03-S02) these say "due when payments
 * process" and never "refunded" (E02 spec, R09, R15, D33).
 */
export type RefundOutcome = "full-grace" | "full" | "none";

export const REFUND_OUTCOME_TEXT: Record<RefundOutcome, string> = {
  "full-grace":
    "You booked less than 15 minutes ago: full refund due when payments process.",
  full: "You are cancelling at least two hours before the start: full refund due when payments process.",
  none: "You are cancelling less than two hours before the start: no refund. The mentor is paid when payments process.",
};
