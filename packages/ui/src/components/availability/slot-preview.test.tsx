import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SlotPreview } from "./slot-preview";

describe("SlotPreview", () => {
  it("groups slots by Warsaw day and marks the times that also allow 50 minutes", () => {
    render(
      <SlotPreview
        slots={[
          { startsAt: "2026-11-13T09:00:00Z", fiftyFits: true },
          { startsAt: "2026-11-13T09:25:00Z", fiftyFits: false },
          { startsAt: "2026-11-14T09:00:00Z", fiftyFits: false },
        ]}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Fri 13 Nov" }).textContent,
    ).toContain("10:00");
    expect(
      screen.getByRole("region", { name: "Fri 13 Nov" }).textContent,
    ).toContain("10:25");
    expect(screen.getByRole("region", { name: "Sat 14 Nov" })).toBeTruthy();
    expect(screen.getByText("(50 minutes also fits)")).toBeTruthy();
    expect(screen.getByText(/Times are in Europe\/Warsaw/)).toBeTruthy();
  });

  it("explains an empty preview and what to do", () => {
    render(<SlotPreview slots={[]} />);

    expect(screen.getByText("No bookable slots yet")).toBeTruthy();
  });

  it("announces loading without an action", () => {
    render(<SlotPreview slots={undefined} loading />);

    expect(screen.getByRole("status").textContent).toBe(
      "Calculating bookable slots…",
    );
  });

  it("says the preview failed and that the windows are safe", () => {
    render(<SlotPreview slots={undefined} />);

    expect(screen.getByRole("alert").textContent).toContain(
      "The preview did not load",
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Your windows are safe",
    );
  });

  it("shows the failure when told to, even with old slots", () => {
    render(<SlotPreview slots={[]} error />);

    expect(screen.getByRole("alert")).toBeTruthy();
  });
});
