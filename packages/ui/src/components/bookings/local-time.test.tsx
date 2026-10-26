import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocalTime, formatMoment, zoneName } from "./local-time";

const ISO = "2026-11-13T09:00:00Z";

describe("formatMoment", () => {
  it("writes day, 24-hour time and the zone", () => {
    expect(formatMoment(ISO, "UTC")).toBe("Fri 13 Nov, 09:00 UTC");
    expect(formatMoment(ISO, "Europe/Warsaw")).toMatch(/^Fri 13 Nov, 10:00 /);
    expect(zoneName(ISO, "UTC")).toBe("UTC");
  });
});

describe("LocalTime", () => {
  it("shows the pinned zone and keeps the machine value", () => {
    render(<LocalTime iso={ISO} zone="Europe/Warsaw" className="extra" />);

    const time = document.querySelector("time") as HTMLTimeElement;
    expect(time.dateTime).toBe(ISO);
    expect(time.textContent).toMatch(/^Fri 13 Nov, 10:00 /);
    expect(time.className).toBe("extra");
  });

  it("falls back to the browser's zone once mounted", () => {
    render(<LocalTime iso={ISO} />);

    expect(screen.getByText(/^Fri 13 Nov, \d\d:\d\d /)).toBeTruthy();
  });
});
