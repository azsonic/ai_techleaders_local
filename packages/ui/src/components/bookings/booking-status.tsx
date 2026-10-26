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
    no_show_mentee: "No-show",
    no_show_mentor: "No-show",
  },
  mentor: {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled_by_mentee: "Cancelled by mentee",
    cancelled_by_mentor: "Cancelled by you",
    completed: "Completed",
    no_show_mentee: "No-show",
    no_show_mentor: "No-show",
  },
};

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
  return <Badge variant={VARIANT[status]}>{LABEL[viewer][status]}</Badge>;
}
