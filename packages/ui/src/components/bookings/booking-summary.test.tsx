import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookingSummary, CANCELLATION_RULE } from "./booking-summary";

describe("BookingSummary", () => {
  it("lists mentor, length, time in both zones, price and the cancellation rule", () => {
    render(
      <BookingSummary
        mentorName="Anna Kowalska"
        minutes={50}
        startsAt="2026-11-13T09:00:00Z"
        pricePln={220}
        zone="Europe/London"
      />,
    );

    const summary = screen.getByRole("region", { name: "Booking summary" });
    expect(summary.textContent).toContain("Anna Kowalska");
    expect(summary.textContent).toContain("50 minutes");
    expect(summary.textContent).toContain("220 PLN");
    expect(summary.textContent).toMatch(/Fri 13 Nov, 09:00 /);
    expect(summary.textContent).toMatch(
      /In Europe\/Warsaw: Fri 13 Nov, 10:00 /,
    );
    expect(summary.textContent).toContain(CANCELLATION_RULE);
  });
});
