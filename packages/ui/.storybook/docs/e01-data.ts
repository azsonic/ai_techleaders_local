/** Example data for E01 stories: fictional mentors and windows, in the shapes the E01 spec defines. */
import type { AvailabilityWindow } from "@devmentor/ui/components/availability/window-list";
import type { PreviewSlot } from "@devmentor/ui/components/availability/slot-preview";
import type { Invitation } from "@devmentor/ui/components/invitations/invitation-row";

export const NOW = new Date("2026-11-12T13:05:00Z"); // Thursday 12 November 2026, 14:05 in Warsaw

export const WINDOWS: AvailabilityWindow[] = [
  {
    id: "w1",
    startsAt: "2026-11-13T09:00:00Z",
    endsAt: "2026-11-13T11:00:00Z",
  },
  {
    id: "w2",
    startsAt: "2026-11-14T16:00:00Z",
    endsAt: "2026-11-14T19:00:00Z",
  },
  {
    id: "w3",
    startsAt: "2026-11-16T17:00:00Z",
    endsAt: "2026-11-16T20:30:00Z",
  },
];

/** Many windows, to see how the list and the dialog cope (two a day for ten days). */
export const MANY_WINDOWS: AvailabilityWindow[] = Array.from(
  { length: 20 },
  (_, index) => {
    const day = 13 + Math.floor(index / 2);
    const morning = index % 2 === 0;
    return {
      id: `m${index}`,
      startsAt: `2026-11-${String(day).padStart(2, "0")}T${morning ? "09" : "16"}:00:00Z`,
      endsAt: `2026-11-${String(day).padStart(2, "0")}T${morning ? "11" : "19"}:00:00Z`,
    };
  },
);

const slotsFor = (
  day: string,
  startHourUtc: number,
  count: number,
): PreviewSlot[] =>
  Array.from({ length: count }, (_, index) => {
    const minutes = startHourUtc * 60 + index * 25;
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    return {
      startsAt: `2026-11-${day}T${hh}:${mm}:00Z`,
      fiftyFits: index < count - 1,
    };
  });

export const SLOTS: PreviewSlot[] = [
  ...slotsFor("13", 9, 4),
  ...slotsFor("14", 16, 6),
];
export const MANY_SLOTS: PreviewSlot[] = [13, 14, 16, 17, 18].flatMap((day) =>
  slotsFor(String(day), 9, 12),
);

export const INVITATIONS: Invitation[] = [
  {
    id: "i1",
    email: "marta.zielinska@example.com",
    status: "pending",
    expires: "26 Nov",
  },
  { id: "i2", status: "pending", expires: "26 Nov" },
  {
    id: "i3",
    email: "jan.kowalski@example.com",
    status: "accepted",
    expires: "20 Nov",
  },
  {
    id: "i4",
    email: "ola.nowak@example.com",
    status: "revoked",
    expires: "22 Nov",
  },
  {
    id: "i5",
    email: "piotr.wisniewski@example.com",
    status: "expired",
    expires: "5 Nov",
  },
];
