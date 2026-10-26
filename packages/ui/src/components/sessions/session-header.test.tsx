import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SessionHeader } from "./session-header";

const base = {
  counterpartName: "Anna Kowalska",
  startsAt: "2026-11-13T09:00:00Z",
  minutes: 25 as const,
  zone: "Europe/Warsaw",
};

describe("SessionHeader", () => {
  it("names the person in the page heading and says it has not started", () => {
    render(<SessionHeader {...base} now="2026-11-13T08:00:00Z" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Session with Anna Kowalska",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Not started")).toBeTruthy();
    expect(screen.getByText(/25 minutes\./).textContent).toMatch(
      /Starts Fri 13 Nov, 10:00 .*\./,
    );
  });

  it("writes the end time while the session runs", () => {
    render(<SessionHeader {...base} now="2026-11-13T09:10:00Z" />);

    expect(screen.getByText("In progress")).toBeTruthy();
    expect(screen.getByText(/25 minutes\./).textContent).toMatch(
      /Ends Fri 13 Nov, 10:25 .*\./,
    );
  });

  it("says when the session ended and takes another heading level", () => {
    render(
      <SessionHeader
        {...base}
        minutes={50}
        headingLevel={2}
        now="2026-11-13T12:00:00Z"
      />,
    );

    expect(screen.getByRole("heading", { level: 2 })).toBeTruthy();
    expect(screen.getByText("Ended")).toBeTruthy();
    expect(screen.getByText(/50 minutes\./).textContent).toMatch(
      /Ended Fri 13 Nov, 10:50 .*\./,
    );
  });
});
