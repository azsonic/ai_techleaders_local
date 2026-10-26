/*
 * Availability rules shown to mentors. Source: E01 spec and brief R08, D24: windows lie on one Europe/Warsaw
 * calendar day, inside 10:00 to 22:00, at least 25 minutes long, and end in the future. The server checks them
 * again; these functions only let the form say so before sending.
 */
export const ZONE = "Europe/Warsaw";
export const DAY_START = "10:00";
export const DAY_END = "22:00";
export const MIN_WINDOW_MINUTES = 25;

export type WindowValues = { date: string; start: string; end: string };

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/** Current Warsaw date ("2026-11-12") and time ("14:05"), so past windows can be refused in the mentor's own words. */
export function warsawNow(now: Date): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function validateWindow(
  { date, start, end }: WindowValues,
  now: Date,
): Partial<Record<keyof WindowValues, string>> {
  const errors: Partial<Record<keyof WindowValues, string>> = {};
  const today = warsawNow(now);

  if (!date) errors.date = "Choose a date.";
  else if (date < today.date) errors.date = "Choose today or a later date.";

  if (!start) errors.start = "Enter a start time.";
  else if (start < DAY_START || start >= DAY_END)
    errors.start = `Start between ${DAY_START} and ${DAY_END}.`;

  if (!end) errors.end = "Enter an end time.";
  else if (end > DAY_END || end <= DAY_START)
    errors.end = `End between ${DAY_START} and ${DAY_END}.`;
  else if (
    start &&
    !errors.start &&
    toMinutes(end) - toMinutes(start) < MIN_WINDOW_MINUTES
  ) {
    errors.end = `Make the window at least ${MIN_WINDOW_MINUTES} minutes long.`;
  }

  if (!errors.date && !errors.end && date === today.date && end <= today.time) {
    errors.end = "This window has already ended. Choose a later time.";
  }
  return errors;
}

/** "Tue 12 Nov" in Warsaw time, for a day heading or a list row. */
export const formatDay = (iso: string, zone: string = ZONE): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: zone,
  }).format(new Date(iso));

/** "18:00" in 24-hour time. */
export const formatTime = (iso: string, zone: string = ZONE): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: zone,
  }).format(new Date(iso));
