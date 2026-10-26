import { formatPln } from "../mentors/pricing";
import { ZONE } from "../availability/windows";
import { LocalTime } from "./local-time";

/** The one-sentence cancellation rule shown on the booking page (R09, R15, D33). */
export const CANCELLATION_RULE =
  "You can cancel for a full refund within 15 minutes of booking, or at least two hours before the start. Later, there is no refund.";

/*
 * What the mentee is about to book (E02-S03): mentor, length, time in their zone and in Europe/Warsaw (where the hours
 * limit is stated), the price, and the cancellation rule. Written as a definition list so each fact has its label.
 */
export function BookingSummary({
  mentorName,
  minutes,
  startsAt,
  pricePln,
  zone,
}: {
  mentorName: string;
  minutes: 25 | 50;
  startsAt: string;
  pricePln: number;
  zone?: string;
}) {
  return (
    <section
      data-slot="booking-summary"
      aria-label="Booking summary"
      className="flex flex-col gap-within-group"
    >
      <dl className="grid grid-cols-[auto_1fr] gap-x-between-groups gap-y-within-group text-interface">
        <dt className="text-muted-foreground">Mentor</dt>
        <dd className="font-emphasis wrap-anywhere">{mentorName}</dd>
        <dt className="text-muted-foreground">Length</dt>
        <dd className="font-emphasis">{minutes} minutes</dd>
        <dt className="text-muted-foreground">Time</dt>
        <dd className="flex flex-col font-emphasis">
          <LocalTime iso={startsAt} zone={zone} />
          <span className="font-body text-muted-foreground">
            In {ZONE}: <LocalTime iso={startsAt} zone={ZONE} />
          </span>
        </dd>
        <dt className="text-muted-foreground">Price</dt>
        <dd className="font-emphasis">{formatPln(pricePln)}</dd>
      </dl>
      <p className="text-interface text-muted-foreground">
        {CANCELLATION_RULE}
      </p>
    </section>
  );
}
