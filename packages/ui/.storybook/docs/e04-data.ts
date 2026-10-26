/** Example data for E04 stories: one fictional session between a mentee (Jan) and a mentor (Anna). Session 09:00 to 09:25 UTC. */
import type { MessageView } from "@devmentor/ui/components/messages/message-item";

export const SESSION_START = "2026-11-13T09:00:00Z";
export const NOW_BEFORE = "2026-11-13T08:30:00Z";
export const NOW_LIVE = "2026-11-13T09:12:00Z";
export const NOW_ENDED = "2026-11-13T09:40:00Z";

export const QUESTION_MESSAGE: MessageView = {
  id: "q",
  authorName: "Jan Kowalski",
  sentAt: "2026-11-13T07:00:00Z",
  caption: "Booking question",
  body: "My useEffect runs twice after I added React.StrictMode. How do I stop the double request without removing StrictMode?",
};

export const CONVERSATION: MessageView[] = [
  QUESTION_MESSAGE,
  {
    id: "m1",
    authorName: "Anna Kowalska",
    sentAt: "2026-11-13T09:01:00Z",
    body: "Hi Jan. Is this only in development, or also in the production build?",
  },
  {
    id: "m2",
    authorName: "Jan Kowalski",
    own: true,
    sentAt: "2026-11-13T09:02:00Z",
    body: "Only in development.",
    delivery: "sent",
  },
  {
    id: "m3",
    authorName: "Anna Kowalska",
    sentAt: "2026-11-13T09:04:00Z",
    body: "Then it is StrictMode mounting the component twice on purpose. Make the effect safe to run twice: return a cleanup that aborts the request.\n\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal });\n  return () => controller.abort();\n}, [url]);",
  },
  {
    id: "m4",
    authorName: "Jan Kowalski",
    own: true,
    sentAt: "2026-11-13T09:08:00Z",
    body: "That works. Thank you. Does the same apply to a WebSocket?",
    delivery: "sent",
  },
];

export const MANY_MESSAGES: MessageView[] = Array.from(
  { length: 60 },
  (_, index) => ({
    id: `many${index}`,
    authorName: index % 2 ? "Jan Kowalski" : "Anna Kowalska",
    own: index % 2 === 1,
    sentAt: new Date(
      Date.parse(SESSION_START) + (index + 1) * 20_000,
    ).toISOString(),
    body:
      index % 2
        ? `Follow-up question number ${Math.ceil(index / 2)}.`
        : `Answer number ${index / 2 + 1}: check the dependency array first.`,
    delivery: index % 2 ? ("sent" as const) : undefined,
  }),
);

export const LONG_AUTHOR =
  "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer";

export const LONG_MESSAGE =
  "The error is Uncaught TypeError: Cannot read properties of undefined (reading 'map') at /src/features/billing/components/InvoiceTableWithLongName.tsx:142:31 and it only appears after the second navigation, " +
  "https://example.com/very/long/path/that/does/not/contain/any/spaces/at/all/and/keeps/going/for/a/while/so/it/must/wrap?query=value&another=value ".repeat(
    2,
  );
