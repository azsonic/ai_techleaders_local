import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SlotPicker } from "./slot-picker";

const slots = [
  { startsAt: "2026-11-13T09:00:00Z", fiftyFits: true },
  { startsAt: "2026-11-13T09:25:00Z", fiftyFits: false },
  { startsAt: "2026-11-14T09:00:00Z", fiftyFits: true },
];

describe("SlotPicker", () => {
  it("groups slots by day in the viewer's zone and names the zone once", () => {
    render(<SlotPicker slots={slots} minutes={25} zone="Europe/Warsaw" />);

    expect(screen.getByText(/Times are in Europe\/Warsaw \(/)).toBeTruthy();
    expect(
      screen.getByRole("group", { name: "Fri 13 Nov" }).textContent,
    ).toContain("10:00");
    expect(
      screen.getByRole("group", { name: "Fri 13 Nov" }).textContent,
    ).toContain("10:25");
    expect(screen.getByRole("group", { name: "Sat 14 Nov" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("offers only slots where 50 minutes fit when 50 is chosen", () => {
    render(<SlotPicker slots={slots} minutes={50} zone="Europe/Warsaw" />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.queryByRole("radio", { name: "10:25" })).toBeNull();
  });

  it("reports the chosen slot and marks it", () => {
    const onValueChange = vi.fn();
    render(
      <SlotPicker
        slots={slots}
        minutes={25}
        zone="Europe/Warsaw"
        value={slots[1].startsAt}
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen.getByRole("radio", { name: "10:25" }).getAttribute("aria-checked"),
    ).toBe("true");
    fireEvent.click(
      within(screen.getByRole("group", { name: "Fri 13 Nov" })).getByRole(
        "radio",
        { name: "10:00" },
      ),
    );

    expect(onValueChange).toHaveBeenCalledWith(slots[0].startsAt);
  });

  it("works without a value or a handler, and uses the browser's zone by default", () => {
    render(<SlotPicker slots={slots} minutes={25} />);

    fireEvent.click(screen.getAllByRole("radio")[0]);

    expect(screen.getByRole("radiogroup", { name: "Start time" })).toBeTruthy();
  });

  it("announces loading", () => {
    render(<SlotPicker slots={undefined} minutes={25} loading />);

    expect(screen.getByRole("status").textContent).toBe("Loading slots…");
  });

  it("says slots did not load, for an error and for a missing list", () => {
    const { unmount } = render(<SlotPicker slots={slots} minutes={25} error />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Slots did not load",
    );
    unmount();
    render(<SlotPicker slots={undefined} minutes={25} />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Nothing was booked",
    );
  });

  it("explains an empty list for each length", () => {
    const { unmount } = render(<SlotPicker slots={[]} minutes={25} />);
    expect(
      screen.getByText("No 25-minute slots in the next 14 days"),
    ).toBeTruthy();
    expect(screen.getByText("Look at another mentor.")).toBeTruthy();
    unmount();
    render(<SlotPicker slots={[slots[1]]} minutes={50} />);
    expect(
      screen.getByText("No 50-minute slots in the next 14 days"),
    ).toBeTruthy();
    expect(screen.getByText(/Try the 25-minute length/)).toBeTruthy();
  });
});
