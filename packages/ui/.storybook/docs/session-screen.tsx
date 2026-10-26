import { useState } from "react";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { Conversation } from "@devmentor/ui/components/messages/conversation";
import type { MessageView } from "@devmentor/ui/components/messages/message-item";
import { SessionHeader } from "@devmentor/ui/components/sessions/session-header";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import {
  CONVERSATION,
  LONG_AUTHOR,
  LONG_MESSAGE,
  MANY_MESSAGES,
  NOW_BEFORE,
  NOW_ENDED,
  NOW_LIVE,
  QUESTION_MESSAGE,
  SESSION_START,
} from "./e04-data";
import { mockApiCall, type ApiMode } from "./mock-api";

export type SessionState =
  | "not-started"
  | "live"
  | "sending"
  | "not-sent"
  | "ended"
  | "loading"
  | "load-error"
  | "not-found"
  | "many"
  | "long-text";

const ME = "Jan Kowalski";
const ZONE = "Europe/Warsaw";

const initialMessages = (state: SessionState): MessageView[] => {
  switch (state) {
    case "not-started":
      return [QUESTION_MESSAGE];
    case "sending":
      return [
        ...CONVERSATION.filter((message) => message.id !== "m4"),
        {
          id: "s1",
          authorName: ME,
          own: true,
          sentAt: NOW_LIVE,
          body: "Does the same apply to a WebSocket connection?",
          delivery: "sending",
        },
      ];
    case "not-sent":
      return CONVERSATION.map((message): MessageView =>
        message.id === "m4" ? { ...message, delivery: "failed" } : message,
      );
    case "many":
      return [QUESTION_MESSAGE, ...MANY_MESSAGES];
    case "long-text":
      return [
        { ...QUESTION_MESSAGE, body: LONG_MESSAGE },
        {
          id: "l1",
          authorName: LONG_AUTHOR,
          sentAt: "2026-11-13T09:01:00Z",
          body: LONG_MESSAGE,
        },
      ];
    default:
      return CONVERSATION;
  }
};

const nowFor = (state: SessionState) =>
  state === "not-started"
    ? NOW_BEFORE
    : state === "ended"
      ? NOW_ENDED
      : NOW_LIVE;

/**
 * Documentation helper: message state for a conversation story. Sending runs the real `apiCall` against a mocked
 * answer (`mode`), so a message goes sending, then sent or not sent, exactly as the page will do it (P12.1, P12.2).
 */
export function useMockMessages(initial: MessageView[], mode: ApiMode) {
  const [messages, setMessages] = useState<MessageView[]>(initial);
  const nextId = messages.length + 1;

  const deliver = (id: string, body: string, sendMode: ApiMode) => {
    mockApiCall(sendMode, "/api/sessions/s1/messages", { body }).then(
      (result) =>
        setMessages((current) =>
          current.map((message) =>
            message.id === id
              ? { ...message, delivery: result.ok ? "sent" : "failed" }
              : message,
          ),
        ),
    );
  };

  const send = (body: string) => {
    const id = `new${nextId}`;
    setMessages((current) => [
      ...current,
      {
        id,
        authorName: ME,
        own: true,
        sentAt: new Date().toISOString(),
        body,
        delivery: "sending",
      },
    ]);
    deliver(id, body, mode);
  };

  const retry = (id: string) => {
    const message = messages.find((item) => item.id === id);
    if (!message) return;
    setMessages((current) =>
      current.map((item) =>
        item.id === id ? { ...item, delivery: "sending" } : item,
      ),
    );
    deliver(id, message.body, mode);
  };

  return { messages, send, retry };
}

/**
 * Documentation helper: the session page composition (E04-S01). The page owns the height (one screen tall), the header
 * stays small and the conversation takes the rest, with the composer in view (R02.1, R02.2). Sending runs the real
 * `apiCall` against a mocked answer; `mode` chooses what the server says to the next message.
 */
export function SessionScreen({
  state,
  mode = "success",
}: {
  state: SessionState;
  mode?: ApiMode;
}) {
  const { messages, send, retry } = useMockMessages(
    initialMessages(state),
    mode,
  );

  const body = () => {
    if (state === "loading")
      return (
        <div className="flex flex-col gap-within-group px-page-inline py-section">
          <h1 className="text-heading-page font-emphasis">Session</h1>
          <LoadingMessage label="Loading the session…" />
          <div aria-hidden className="flex flex-col gap-within-group">
            <Skeleton className="h-12 w-full max-w-prose" />
            <Skeleton className="h-20 w-full max-w-prose" />
          </div>
        </div>
      );
    if (state === "load-error")
      return (
        <div className="flex flex-col gap-within-group px-page-inline py-section">
          <h1 className="text-heading-page font-emphasis">Session</h1>
          <ErrorMessage
            title="The session did not load"
            message="Nothing was changed. Try again."
            action={
              <Button variant="secondary" size="dense">
                Try again
              </Button>
            }
          />
        </div>
      );
    if (state === "not-found")
      return (
        <div className="flex flex-col gap-within-group px-page-inline py-section">
          <h1 className="text-heading-page font-emphasis">Session</h1>
          <EmptyState
            title="This session does not exist, or you cannot see it"
            description="Only the mentee, the mentor and, in a dispute, the operator can open a session."
            action={
              <a href="/bookings" className={textLinkClassName}>
                Go to My bookings
              </a>
            }
          />
        </div>
      );
    return (
      <>
        <SessionHeader
          counterpartName={
            state === "long-text" ? LONG_AUTHOR : "Anna Kowalska"
          }
          startsAt={SESSION_START}
          minutes={25}
          now={nowFor(state)}
          zone={ZONE}
        />
        <Conversation
          messages={messages}
          zone={ZONE}
          onSend={send}
          onRetry={retry}
          disabledReason={
            state === "ended" ? "This session has ended." : undefined
          }
        />
      </>
    );
  };

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <p className="border-b border-border bg-card px-page-inline py-within-group text-interface font-emphasis">
        DevMentor
      </p>
      <main className="flex min-h-0 flex-1 flex-col">{body()}</main>
    </div>
  );
}
