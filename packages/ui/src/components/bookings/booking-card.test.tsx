import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BookingCard, type BookingView } from "./booking-card";

const booking: BookingView = {
  id: "b1",
  startsAt: "2026-11-13T09:00:00Z",
  minutes: 25,
  counterpartName: "Anna Kowalska",
  status: "confirmed",
  question: "How do I type a generic reducer?",
  pricePln: 120,
};

describe("BookingCard", () => {
  it("shows time, the other person, status and the question for a mentee", () => {
    render(
      <BookingCard booking={booking} viewer="mentee" zone="Europe/Warsaw" />,
    );

    expect(screen.getByRole("heading", { level: 2 }).textContent).toMatch(
      /^Fri 13 Nov, 10:00 /,
    );
    expect(
      screen.getByText(/With Anna Kowalska, 25 minutes, 120 PLN/),
    ).toBeTruthy();
    expect(screen.getByText("Confirmed")).toBeTruthy();
    expect(screen.getByText("How do I type a generic reducer?")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("takes another heading level", () => {
    render(<BookingCard booking={booking} viewer="mentee" headingLevel={3} />);

    expect(screen.getByRole("heading", { level: 3 })).toBeTruthy();
  });

  it("links the time to the booking and calls the person a mentee for a mentor", () => {
    render(
      <BookingCard
        booking={booking}
        viewer="mentor"
        zone="Europe/Warsaw"
        href="/mentor/bookings/b1"
      />,
    );

    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/mentor/bookings/b1",
    );
    expect(screen.getByText(/Mentee Anna Kowalska/)).toBeTruthy();
  });

  it("offers a cancel action named after the person, only when confirmed and handled", () => {
    const onCancel = vi.fn();
    const { unmount } = render(
      <BookingCard booking={booking} viewer="mentee" onCancel={onCancel} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel session with Anna Kowalska" }),
    );
    expect(onCancel).toHaveBeenCalledWith("b1");
    unmount();

    const finished = render(
      <BookingCard
        booking={{ ...booking, status: "completed" }}
        viewer="mentee"
        onCancel={onCancel}
      />,
    );
    expect(screen.queryByRole("button")).toBeNull();
    finished.unmount();

    render(<BookingCard booking={booking} viewer="mentee" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("says cancelling is free for a booking made a moment ago, and not for others", () => {
    const { unmount } = render(
      <BookingCard booking={booking} viewer="mentee" justBooked />,
    );
    expect(
      screen.getByText("Free cancellation for 15 minutes after booking."),
    ).toBeTruthy();
    unmount();

    const cancelled = render(
      <BookingCard
        booking={{ ...booking, status: "cancelled_by_mentee" }}
        viewer="mentee"
        justBooked
      />,
    );
    expect(screen.queryByText(/Free cancellation/)).toBeNull();
    cancelled.unmount();

    render(<BookingCard booking={booking} viewer="mentee" />);
    expect(screen.queryByText(/Free cancellation/)).toBeNull();
  });
});
