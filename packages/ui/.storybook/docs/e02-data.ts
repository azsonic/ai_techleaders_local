/** Example data for E02 stories: fictional mentors, slots and bookings in the shapes the E02 spec defines. */
import type { PreviewSlot } from "@devmentor/ui/components/availability/slot-preview";
import type { BookingView } from "@devmentor/ui/components/bookings/booking-card";
import type { DirectoryMentor } from "@devmentor/ui/components/mentors/mentor-directory";

export const ZONE = "Europe/Warsaw";

export const MENTORS: DirectoryMentor[] = [
  {
    id: "anna",
    displayName: "Anna Kowalska",
    stacks: ["typescript", "react"],
    priceFrom: 90,
    nearestSlot: "Fri 13 Nov, 10:00 CET",
    href: "/mentors/anna-kowalska",
  },
  {
    id: "piotr",
    displayName: "Piotr Nowak",
    stacks: ["python", "ai-agents"],
    priceFrom: 150,
    nearestSlot: "Fri 13 Nov, 12:25 CET",
    href: "/mentors/piotr-nowak",
  },
  {
    id: "marta",
    displayName: "Marta Zielińska",
    stacks: ["react"],
    priceFrom: 120,
    nearestSlot: "Sat 14 Nov, 17:00 CET",
    href: "/mentors/marta-zielinska",
  },
  {
    id: "jan",
    displayName: "Jan Kowalski",
    stacks: ["typescript"],
    priceFrom: 100,
    nearestSlot: "Mon 16 Nov, 18:00 CET",
    href: "/mentors/jan-kowalski",
  },
];

const STACK_CYCLE = [
  ["typescript"],
  ["react", "typescript"],
  ["python"],
  ["ai-agents", "python"],
] as const;

/** Thirty mentors, to see how the list and the count behave. */
export const MANY_MENTORS: DirectoryMentor[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `m${index}`,
    displayName: `Mentor ${index + 1} Example`,
    stacks: [...STACK_CYCLE[index % STACK_CYCLE.length]],
    priceFrom: 90 + (index % 5) * 30,
    nearestSlot: `Fri 13 Nov, ${String(10 + (index % 10)).padStart(2, "0")}:00 CET`,
    href: `/mentors/mentor-${index + 1}`,
  }),
);

/** Slots for fourteen days, three windows a day: 10:00, 14:00 and 18:00 Warsaw (winter time, UTC+1). */
export const FOURTEEN_DAYS: PreviewSlot[] = Array.from(
  { length: 14 },
  (_, day) =>
    [9, 13, 17].flatMap((hourUtc) =>
      Array.from({ length: 4 }, (_, step) => {
        const minutes = hourUtc * 60 + step * 25;
        const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
        const mm = String(minutes % 60).padStart(2, "0");
        return {
          startsAt: `2026-11-${String(13 + day).padStart(2, "0")}T${hh}:${mm}:00Z`,
          fiftyFits: step < 3,
        };
      }),
    ),
).flat();

export const FEW_SLOTS: PreviewSlot[] = FOURTEEN_DAYS.slice(0, 4);

export const PRICES = { 25: 120, 50: 220 } as const;

const base = {
  question:
    "How do I type a generic reducer so the action payloads narrow correctly?",
  pricePln: 120,
  minutes: 25 as const,
};

export const BOOKINGS: BookingView[] = [
  {
    ...base,
    id: "b1",
    startsAt: "2026-11-13T09:00:00Z",
    counterpartName: "Anna Kowalska",
    status: "confirmed",
  },
  {
    ...base,
    id: "b2",
    startsAt: "2026-11-16T17:00:00Z",
    counterpartName: "Piotr Nowak",
    status: "confirmed",
    minutes: 50,
    pricePln: 220,
    question: "Review my approach to event sourcing for bookings.",
  },
  {
    ...base,
    id: "b3",
    startsAt: "2026-11-09T09:00:00Z",
    counterpartName: "Marta Zielińska",
    status: "completed",
  },
  {
    ...base,
    id: "b4",
    startsAt: "2026-11-10T13:00:00Z",
    counterpartName: "Jan Kowalski",
    status: "cancelled_by_mentee",
  },
  {
    ...base,
    id: "b5",
    startsAt: "2026-11-11T13:00:00Z",
    counterpartName: "Anna Kowalska",
    status: "cancelled_by_mentor",
  },
  {
    ...base,
    id: "b6",
    startsAt: "2026-11-05T13:00:00Z",
    counterpartName: "Piotr Nowak",
    status: "no_show_mentee",
  },
];

export const MANY_BOOKINGS: BookingView[] = Array.from(
  { length: 25 },
  (_, index) => ({
    ...BOOKINGS[index % 2],
    id: `many${index}`,
    startsAt: `2026-11-${String(13 + (index % 14)).padStart(2, "0")}T09:00:00Z`,
  }),
);

export const LONG_QUESTION = `${base.question} `.repeat(12).trim();
