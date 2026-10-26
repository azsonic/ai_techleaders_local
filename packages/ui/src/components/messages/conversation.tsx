"use client";

import { useEffect, useRef } from "react";

import { EmptyState } from "../../backend/feedback/empty-state";
import { Composer } from "./composer";
import { MessageItem, type MessageView } from "./message-item";

/*
 * The session conversation (E04-S01, R02.1, R02.2): the messages scroll, the composer stays in view below them. The
 * message list is a named, focusable log, so a keyboard user can scroll it and a screen reader hears new messages
 * (role="log" is polite). The page gives this component a height; the log takes what is left.
 * "Sent" stays only on the latest of your own messages: a "Sent" on every line would be clutter (AC02, proposal).
 */
export function Conversation({
  messages,
  zone,
  onSend,
  onRetry,
  disabledReason,
}: {
  messages: MessageView[];
  zone?: string;
  onSend: (body: string) => void;
  onRetry?: (id: string) => void;
  /** Passed to the composer when nobody can write. */
  disabledReason?: string;
}) {
  const log = useRef<HTMLDivElement>(null);
  const lastOwn = messages.findLast((message) => message.own)?.id;

  useEffect(() => {
    const element = log.current as HTMLDivElement;
    element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  return (
    <section
      data-slot="conversation"
      aria-label="Conversation"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        ref={log}
        role="log"
        aria-label="Messages"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto px-page-inline py-between-groups focus-ring"
      >
        {messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Write the first message below."
          />
        ) : (
          <ol className="flex flex-col gap-between-groups">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={
                  message.delivery === "sent" && message.id !== lastOwn
                    ? { ...message, delivery: undefined }
                    : message
                }
                zone={zone}
                onRetry={onRetry}
              />
            ))}
          </ol>
        )}
      </div>
      <div className="border-t border-border bg-card px-page-inline py-between-groups">
        <Composer onSend={onSend} disabledReason={disabledReason} />
      </div>
    </section>
  );
}
