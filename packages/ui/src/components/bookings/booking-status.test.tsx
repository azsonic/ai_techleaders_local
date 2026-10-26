import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookingStatus, type BookingStatusValue } from "./booking-status";

describe("BookingStatus", () => {
  it("writes the status for the mentee and fills only the live one", () => {
    const labels: Array<[BookingStatusValue, string]> = [
      ["pending", "Pending"],
      ["confirmed", "Confirmed"],
      ["completed", "Completed"],
      ["cancelled_by_mentee", "Cancelled by you"],
      ["cancelled_by_mentor", "Cancelled by mentor"],
      ["no_show_mentee", "No-show"],
      ["no_show_mentor", "No-show"],
    ];
    for (const [status, label] of labels) {
      const { unmount } = render(
        <BookingStatus status={status} viewer="mentee" />,
      );
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
    render(<BookingStatus status="confirmed" viewer="mentee" />);
    expect(screen.getByText("Confirmed").className).toContain("bg-primary");
  });

  it("words cancellations from the mentor's side", () => {
    const { unmount } = render(
      <BookingStatus status="cancelled_by_mentee" viewer="mentor" />,
    );
    expect(screen.getByText("Cancelled by mentee").className).toContain(
      "border-destructive",
    );
    unmount();
    render(<BookingStatus status="cancelled_by_mentor" viewer="mentor" />);
    expect(screen.getByText("Cancelled by you")).toBeTruthy();
  });

  it("keeps the remaining mentor labels", () => {
    const { unmount } = render(
      <BookingStatus status="pending" viewer="mentor" />,
    );
    expect(screen.getByText("Pending").className).toContain("bg-secondary");
    unmount();
    const confirmed = render(
      <BookingStatus status="confirmed" viewer="mentor" />,
    );
    expect(screen.getByText("Confirmed")).toBeTruthy();
    confirmed.unmount();
    const completed = render(
      <BookingStatus status="completed" viewer="mentor" />,
    );
    expect(screen.getByText("Completed")).toBeTruthy();
    completed.unmount();
    const a = render(<BookingStatus status="no_show_mentee" viewer="mentor" />);
    expect(screen.getByText("No-show")).toBeTruthy();
    a.unmount();
    render(<BookingStatus status="no_show_mentor" viewer="mentor" />);
    expect(screen.getByText("No-show")).toBeTruthy();
  });
});
