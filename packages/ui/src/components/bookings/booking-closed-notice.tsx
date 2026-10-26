import { Alert, AlertTitle } from "../ui/alert";

/*
 * Shown in place of the slot picker while paid booking is closed (D31): one fixed sentence, no date, no waitlist.
 * Prices and mentors stay visible, and sign-in stays open.
 */
export function BookingClosedNotice() {
  return (
    <Alert data-slot="booking-closed-notice">
      <AlertTitle>Booking opens soon</AlertTitle>
    </Alert>
  );
}
