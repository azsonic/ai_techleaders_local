import { textLinkClassName } from "../../frontend/text-link";
import { Badge } from "../ui/badge";
import { LocalTime } from "./local-time";

export type NotificationKind = "booking.confirmed" | "booking.cancelled";

const TITLE: Record<NotificationKind, string> = {
  "booking.confirmed": "Booking confirmed",
  "booking.cancelled": "Booking cancelled",
};

/*
 * One in-product notice (R10, D21, P04): only the two booking events exist. An unread notice says "New" in words and is
 * semibold, so unread is never a dot or a color alone (WCAG 1.4.1). A mentor's reason is shown to the mentee (D34).
 */
export function NotificationRow({
  kind,
  counterpartName,
  startsAt,
  reason,
  unread = false,
  href,
  zone,
  headingLevel = 2,
}: {
  kind: NotificationKind;
  counterpartName: string;
  startsAt: string;
  /** The mentor's reason, on a cancellation by the mentor. */
  reason?: string;
  unread?: boolean;
  href: string;
  zone?: string;
  /** Heading level of the title, so the row fits the page outline. */
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <li
      data-slot="notification-row"
      className="flex flex-col gap-inline border-b border-border py-between-groups text-interface"
    >
      <div className="flex flex-wrap items-center gap-within-group">
        <Heading className={unread ? "font-emphasis" : "font-body"}>
          {TITLE[kind]}
        </Heading>
        {unread && <Badge>New</Badge>}
      </div>
      <p className="wrap-anywhere">
        <LocalTime iso={startsAt} zone={zone} /> with {counterpartName}
      </p>
      {reason && (
        <p className="text-muted-foreground wrap-anywhere">Reason: {reason}</p>
      )}
      <p>
        <a href={href} className={textLinkClassName}>
          Open booking
        </a>
      </p>
    </li>
  );
}
