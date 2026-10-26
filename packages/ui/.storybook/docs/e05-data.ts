/** Example data for E05 stories: fictional operator actions. Time in November 2026, mentors and operators are made up. */
import type { AuditEntry } from "@devmentor/ui/components/operator/audit-row";

export const OPERATOR = "founder@devmentor.example";

export const AUDIT: AuditEntry[] = [
  {
    id: "a1",
    at: "2026-11-16T09:12:00Z",
    operator: OPERATOR,
    action: "Suspended Tomasz Lis",
    reason:
      "Did not open two booked sessions in the first 10 minutes. Future bookings cancelled with full refunds.",
  },
  {
    id: "a2",
    at: "2026-11-13T15:40:00Z",
    operator: OPERATOR,
    action: "Recorded the outcome of a disputed session",
    reason:
      "Both parties confirmed the session did not take place. Refunded by hand in the Stripe dashboard.",
  },
  {
    id: "a3",
    at: "2026-11-09T08:05:00Z",
    operator: "cofounder@devmentor.example",
    action: "Revoked the invitation for ewa.mazur@example.com",
    reason: "Sent to the wrong address.",
  },
];

const ACTIONS = [
  "Revoked an invitation",
  "Suspended a mentor",
  "Viewed a session in dispute",
];

/** Thirty entries, to see how the table behaves. */
export const MANY_AUDIT: AuditEntry[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `many${index}`,
    at: new Date(
      Date.parse("2026-11-16T12:00:00Z") - index * 3_600_000 * 7,
    ).toISOString(),
    operator: index % 3 ? OPERATOR : "cofounder@devmentor.example",
    action: ACTIONS[index % ACTIONS.length],
    reason: `Reason recorded for action ${index + 1}.`,
  }),
);

export const LONG_REASON =
  "The mentor asked in writing to be removed from the pilot after a family emergency, and the mentee agreed to a refund by e-mail, which I checked in the Stripe dashboard (payment_intent pi_3Qexample0000000000000000 long identifier without spaces). " +
  "Follow-up: confirm in two weeks whether the mentor wants to return.";

export const MENTOR = {
  name: "Anna Kowalska",
  email: "anna.kowalska@example.com",
  futureBookings: 2,
};
