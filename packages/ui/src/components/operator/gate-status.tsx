import { Badge } from "../ui/badge";

export type GateState = "closed" | "open" | "stopped";

const STATE: Record<
  GateState,
  {
    badge: string;
    variant: "default" | "secondary" | "destructive";
    text: string;
  }
> = {
  closed: {
    badge: "Closed",
    variant: "secondary",
    text: "Paid booking stays closed until enough invited mentors have published availability.",
  },
  open: {
    badge: "Open",
    variant: "default",
    text: "The gate passed. Paid booking is open.",
  },
  stopped: {
    badge: "Stopped",
    variant: "destructive",
    text: "Too few mentors published in time. Further invitations stop and paid booking does not open.",
  },
};

/*
 * The supply gate (E05-S01, D12, D16, D24): invited, accepted and published counts, and whether paid booking is open. The
 * count that decides is written as "x of 5" in words, with no bar: a bar would read as course progress (N01.1, NR03). The
 * state is a badge in words; the open state is the filled one (R01.5). "Published" means both prices, one stack and a
 * bookable slot at least two hours ahead (D24).
 */
export function GateStatus({
  state,
  invited,
  accepted,
  published,
  required = 5,
  headingLevel = 2,
}: {
  state: GateState;
  invited: number;
  accepted: number;
  published: number;
  /** Mentors that must publish for the gate to pass (D16). */
  required?: number;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  const { badge, variant, text } = STATE[state];

  return (
    <section
      data-slot="gate-status"
      aria-label="Supply gate"
      className="flex flex-col gap-between-groups rounded-panel border border-border bg-card p-panel"
    >
      <div className="flex flex-wrap items-center gap-within-group">
        <Heading className="text-heading-section font-emphasis">
          Paid booking
        </Heading>
        <Badge variant={variant}>{badge}</Badge>
      </div>
      <p className="text-conversation">
        <strong className="font-emphasis tabular-nums">
          {published} of {required}
        </strong>{" "}
        mentors have published availability.
      </p>
      <dl className="flex flex-wrap gap-x-section gap-y-within-group text-interface">
        {(
          [
            ["Invited", invited],
            ["Accepted", accepted],
            ["Published", published],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-emphasis tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-interface text-muted-foreground">{text}</p>
    </section>
  );
}
