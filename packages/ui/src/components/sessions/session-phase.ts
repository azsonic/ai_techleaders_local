/*
 * Where a session is in time (E04-S01). `now` is passed in, so the page decides when to re-check and the same input
 * always gives the same answer.
 */
export type SessionPhase = "upcoming" | "live" | "ended";

const MINUTE = 60_000;

/** The moment the session ends: the start plus its booked length. */
export const sessionEnd = (startsAt: string, minutes: number): string =>
  new Date(new Date(startsAt).getTime() + minutes * MINUTE).toISOString();

export const sessionPhase = (
  now: string,
  startsAt: string,
  minutes: number,
): SessionPhase => {
  const time = new Date(now).getTime();
  if (time < new Date(startsAt).getTime()) return "upcoming";
  return time < new Date(sessionEnd(startsAt, minutes)).getTime()
    ? "live"
    : "ended";
};
