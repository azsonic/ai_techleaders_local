import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotificationRow } from "./notification-row";

const base = {
  counterpartName: "Anna Kowalska",
  startsAt: "2026-11-13T09:00:00Z",
  href: "/bookings/b1",
  zone: "Europe/Warsaw",
};

const renderRow = (
  props: Partial<Parameters<typeof NotificationRow>[0]> & {
    kind: "booking.confirmed" | "booking.cancelled";
  },
) =>
  render(
    <ul>
      <NotificationRow {...base} {...props} />
    </ul>,
  );

describe("NotificationRow", () => {
  it("shows a read confirmation with the time, the person and a link", () => {
    renderRow({ kind: "booking.confirmed" });

    expect(
      screen.getByRole("heading", { name: "Booking confirmed" }).className,
    ).toContain("font-body");
    expect(screen.getByText(/with Anna Kowalska/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open booking" }).getAttribute("href"),
    ).toBe("/bookings/b1");
    expect(screen.queryByText("New")).toBeNull();
  });

  it("takes another heading level", () => {
    renderRow({ kind: "booking.confirmed", headingLevel: 3 });

    expect(
      screen.getByRole("heading", { level: 3, name: "Booking confirmed" }),
    ).toBeTruthy();
  });

  it("says an unread notice is new in words and weight", () => {
    renderRow({
      kind: "booking.cancelled",
      unread: true,
      reason: "I am unavailable",
    });

    expect(
      screen.getByRole("heading", { name: "Booking cancelled" }).className,
    ).toContain("font-emphasis");
    expect(screen.getByText("New")).toBeTruthy();
    expect(screen.getByText("Reason: I am unavailable")).toBeTruthy();
  });
});
