import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookingClosedNotice } from "./booking-closed-notice";

describe("BookingClosedNotice", () => {
  it("says one fixed sentence with no date", () => {
    render(<BookingClosedNotice />);

    expect(screen.getByRole("status").textContent).toBe("Booking opens soon");
  });
});
