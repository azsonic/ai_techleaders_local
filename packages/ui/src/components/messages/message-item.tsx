"use client";

import { useViewerZone } from "../../hooks/use-viewer-zone";
import { formatTime } from "../availability/windows";
import { Button } from "../ui/button";

export type MessageDelivery = "sending" | "sent" | "failed";

export type MessageView = {
  id: string;
  authorName: string;
  /** Written by the person looking at the screen. Shown as "You". */
  own?: boolean;
  sentAt: string;
  /** Plain text. Line breaks are kept. */
  body: string;
  /** Only the sender's own messages have a delivery state. */
  delivery?: MessageDelivery;
  /** A short note after the time, for example "Booking question". */
  caption?: string;
};

const DELIVERY_TEXT = { sending: "Sending…", sent: "Sent" } as const;

/*
 * One message in a session (E04-S01, R02.3, P12): the author and the time come first, then the text. There are no bubbles
 * and no alignment by author, so the exchange reads as one column (R02.1, A01). The delivery state is written beside the
 * message in words (P12.1). A failed message says so and offers a retry (P12.2, P10.1); the failure is announced.
 */
export function MessageItem({
  message,
  zone,
  onRetry,
}: {
  message: MessageView;
  zone?: string;
  onRetry?: (id: string) => void;
}) {
  const viewerZone = useViewerZone(zone);
  const { id, authorName, own, sentAt, body, delivery, caption } = message;

  return (
    <li data-slot="message-item" className="flex flex-col gap-inline">
      <p className="flex flex-wrap items-baseline gap-x-within-group text-interface">
        <span className="font-emphasis wrap-anywhere">
          {own ? "You" : authorName}
        </span>
        <time dateTime={sentAt} className="text-muted-foreground">
          {formatTime(sentAt, viewerZone)}
        </time>
        {caption && <span className="text-muted-foreground">{caption}</span>}
        {(delivery === "sending" || delivery === "sent") && (
          <span className="text-muted-foreground">
            {DELIVERY_TEXT[delivery]}
          </span>
        )}
      </p>
      <p className="text-conversation whitespace-pre-wrap wrap-anywhere">
        {body}
      </p>
      {delivery === "failed" && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-within-group text-interface text-destructive"
        >
          <span className="font-emphasis">Message wasn&apos;t sent.</span>
          <Button
            variant="secondary"
            size="dense"
            onClick={() => onRetry?.(id)}
          >
            Try again
          </Button>
        </div>
      )}
    </li>
  );
}
