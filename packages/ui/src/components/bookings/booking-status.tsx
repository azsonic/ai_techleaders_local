import { Badge } from "../ui/badge";

export type BookingStatusValue =
  | "pending"
  | "confirmed"
  | "cancelled_by_mentee"
  | "cancelled_by_mentor"
  | "completed"
  | "no_show_mentee"
  | "no_show_mentor";

export type BookingViewer = "mentee" | "mentor";

const LABEL: Record<BookingViewer, Record<BookingStatusValue, string>> = {
  mentee: {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled_by_mentee: "Cancelled by you",
    cancelled_by_mentor: "Cancelled by mentor",
    completed: "Completed",
    no_show_mentee: "You did not attend",
    no_show_mentor: "Mentor did not attend",
  },
  mentor: {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled_by_mentee: "Cancelled by mentee",
    cancelled_by_mentor: "Cancelled by you",
    completed: "Completed",
    no_show_mentee: "Mentee did not attend",
    no_show_mentor: "You did not attend",
  },
};

/** The status as words for who is looking. A filter on bookings uses these same words as the badge. */
export const bookingStatusLabel = (
  status: BookingStatusValue,
  viewer: BookingViewer,
): string => LABEL[viewer][status];

/** Confirmed is the one live state, so it is filled; waiting and finished are bordered; negative outcomes are red-bordered (R01.5). */
const VARIANT: Record<
  BookingStatusValue,
  "default" | "secondary" | "destructive"
> = {
  pending: "secondary",
  confirmed: "default",
  completed: "secondary",
  cancelled_by_mentee: "destructive",
  cancelled_by_mentor: "destructive",
  no_show_mentee: "destructive",
  no_show_mentor: "destructive",
};

/* The booking's status as words, from the booking state machine (E02 spec). Labels depend on who is looking. */
export function BookingStatus({
  status,
  viewer,
}: {
  status: BookingStatusValue;
  viewer: BookingViewer;
}) {
  return (
    <Badge variant={VARIANT[status]}>
      {bookingStatusLabel(status, viewer)}
    </Badge>
  );
}
