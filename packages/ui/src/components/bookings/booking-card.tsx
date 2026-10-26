import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { textLinkClassName } from "../../frontend/text-link";
import { formatPln } from "../mentors/pricing";
import {
  BookingStatus,
  type BookingStatusValue,
  type BookingViewer,
} from "./booking-status";
import { LocalTime } from "./local-time";

export type BookingView = {
  id: string;
  startsAt: string;
  minutes: 25 | 50;
  /** The other person: the mentor for a mentee, the mentee for a mentor. */
  counterpartName: string;
  status: BookingStatusValue;
  /** The mentee's question, plain text up to 2,000 characters. */
  question: string;
  pricePln: number;
};

/*
 * One booking in "My bookings" or "Mentor bookings" (E02-S04, E02-S05, R01.1, R01.3): a dense row with thin separators.
 * The time and the person come first, the status is a badge, the question is clamped to two lines and the whole text is
 * on the booking's own page. Only a confirmed booking offers cancel.
 */
export function BookingCard({
  booking,
  viewer,
  zone,
  href,
  justBooked = false,
  headingLevel = 2,
  onCancel,
}: {
  booking: BookingView;
  viewer: BookingViewer;
  zone?: string;
  /** The booking's own page. */
  href?: string;
  /** Booked less than 15 minutes ago: cancelling is free (R15). */
  justBooked?: boolean;
  /** Heading level of the time, so the card fits the page outline. */
  headingLevel?: 2 | 3 | 4;
  onCancel?: (id: string) => void;
}) {
  const { id, startsAt, minutes, counterpartName, status, question, pricePln } =
    booking;
  const Heading = `h${headingLevel}` as const;

  return (
    <article
      data-slot="booking-card"
      className="flex flex-col gap-within-group border-b border-border py-between-groups text-interface"
    >
      <div className="flex flex-wrap items-start justify-between gap-within-group">
        <div className="flex min-w-0 items-center gap-within-group">
          <Avatar name={counterpartName} size="default" decorative />
          <div className="flex min-w-0 flex-col">
            <Heading className="font-emphasis wrap-anywhere">
              {href ? (
                <a href={href} className={textLinkClassName}>
                  <LocalTime iso={startsAt} zone={zone} />
                </a>
              ) : (
                <LocalTime iso={startsAt} zone={zone} />
              )}
            </Heading>
            <p className="text-muted-foreground wrap-anywhere">
              {viewer === "mentee" ? "With" : "Mentee"} {counterpartName},{" "}
              {minutes} minutes, {formatPln(pricePln)}
            </p>
          </div>
        </div>
        <BookingStatus status={status} viewer={viewer} />
      </div>
      <p className="line-clamp-2 text-conversation wrap-anywhere">{question}</p>
      {justBooked && status === "confirmed" && (
        <p className="text-muted-foreground">
          Free cancellation for 15 minutes after booking.
        </p>
      )}
      {status === "confirmed" && onCancel && (
        <div>
          <Button
            variant="secondary"
            size="dense"
            aria-label={`Cancel session with ${counterpartName}`}
            onClick={() => onCancel(id)}
          >
            Cancel session…
          </Button>
        </div>
      )}
    </article>
  );
}
