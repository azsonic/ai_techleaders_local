import { textLinkClassName } from "../../frontend/text-link";
import { Avatar } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { StackBadge } from "./stack-badge";
import { formatPln, type Stack } from "./pricing";

type MentorCardProps = {
  /** `listing` is a directory row with price and nearest slot. `profile` is the read-only public card (E01). */
  variant?: "listing" | "profile";
  displayName: string;
  avatarSrc?: string;
  stacks: Stack[];
  /** Listing: the lowest of the two prices, in whole zloty. Null while the mentor has not saved prices. */
  priceFrom?: number | null;
  /** Listing: the nearest bookable slot, already formatted in the viewer's zone. Null when there is none. */
  nearestSlot?: string | null;
  /** Listing: where the name links to. */
  href?: string;
  /** Heading level of the name, so the card fits the page outline. */
  headingLevel?: 1 | 2 | 3;
  className?: string;
};

/*
 * Main-object card for a mentor (R01.1, R01.5): the name is the strongest element, price and slot are the supporting
 * facts a mentee compares. No rating, no score (N02). Sessions are text only (N01).
 */
export function MentorCard({
  variant = "listing",
  displayName,
  avatarSrc,
  stacks,
  priceFrom,
  nearestSlot,
  href,
  headingLevel = 2,
  className,
}: MentorCardProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <Card data-slot="mentor-card" size="sm" className={className}>
      <CardContent className="flex gap-within-group">
        <Avatar name={displayName} src={avatarSrc} size="lg" decorative />
        <div className="flex min-w-0 flex-1 flex-col gap-within-group">
          <Heading className="text-conversation font-emphasis wrap-anywhere">
            {href ? (
              <a href={href} className={textLinkClassName}>
                {displayName}
              </a>
            ) : (
              displayName
            )}
          </Heading>
          <ul aria-label="Stacks" className="flex flex-wrap gap-inline">
            {stacks.map((stack) => (
              <li key={stack}>
                <StackBadge stack={stack} />
              </li>
            ))}
          </ul>
          {variant === "listing" ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-within-group gap-y-inline text-interface">
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-emphasis">
                {priceFrom == null
                  ? "Prices not set yet"
                  : `from ${formatPln(priceFrom)}`}
              </dd>
              <dt className="text-muted-foreground">Nearest slot</dt>
              <dd className="font-emphasis">
                {nearestSlot ?? "No bookable slot yet"}
              </dd>
            </dl>
          ) : (
            <p className="text-interface text-muted-foreground">
              Sessions are text only.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Same footprint as MentorCard while the directory loads. Pair it with a LoadingMessage that names what loads. */
export function MentorCardSkeleton() {
  return (
    <Card data-slot="mentor-card-skeleton" size="sm" aria-hidden>
      <CardContent className="flex gap-within-group">
        <Skeleton className="size-control" />
        <div className="flex flex-1 flex-col gap-within-group">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-control-min w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
