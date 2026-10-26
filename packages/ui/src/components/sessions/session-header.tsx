import { Badge } from "../ui/badge";
import { LocalTime } from "../bookings/local-time";
import { sessionEnd, sessionPhase, type SessionPhase } from "./session-phase";

const PHASE: Record<
  SessionPhase,
  { label: string; variant: "default" | "secondary" }
> = {
  upcoming: { label: "Not started", variant: "secondary" },
  live: { label: "In progress", variant: "default" },
  ended: { label: "Ended", variant: "secondary" },
};

/*
 * The top of the session screen (E04-S01, R02.1): who the session is with and when, in as little space as possible so the
 * conversation stays the focus (P03). The phase is a badge in words; the current phase is the filled one (R01.5). The
 * end time is written, not counted down: a ticking timer would be motion and a live region without a source (P11.1).
 */
export function SessionHeader({
  counterpartName,
  startsAt,
  minutes,
  now,
  zone,
  headingLevel = 1,
}: {
  counterpartName: string;
  startsAt: string;
  minutes: 25 | 50;
  /** The current moment, as an ISO string. */
  now: string;
  zone?: string;
  headingLevel?: 1 | 2;
}) {
  const phase = sessionPhase(now, startsAt, minutes);
  const Heading = `h${headingLevel}` as const;
  const { label, variant } = PHASE[phase];

  return (
    <header
      data-slot="session-header"
      className="flex flex-col gap-inline border-b border-border bg-card px-page-inline py-within-group"
    >
      <div className="flex flex-wrap items-center gap-within-group">
        <Heading className="min-w-0 text-heading-section font-emphasis wrap-anywhere">
          Session with {counterpartName}
        </Heading>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <p className="text-interface text-muted-foreground">
        {minutes} minutes.{" "}
        {phase === "upcoming" && (
          <>
            Starts <LocalTime iso={startsAt} zone={zone} />.
          </>
        )}
        {phase === "live" && (
          <>
            Ends <LocalTime iso={sessionEnd(startsAt, minutes)} zone={zone} />.
          </>
        )}
        {phase === "ended" && (
          <>
            Ended <LocalTime iso={sessionEnd(startsAt, minutes)} zone={zone} />.
          </>
        )}
      </p>
    </header>
  );
}
