import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const renderTabs = (orientation?: "horizontal" | "vertical") =>
  render(
    <Tabs defaultValue="upcoming" orientation={orientation} className="extra">
      <TabsList aria-label="My bookings" className="list-extra">
        <TabsTrigger value="upcoming" className="trigger-extra">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
        <TabsTrigger value="cancelled" disabled>
          Cancelled
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="panel-extra">
        Friday 10:00
      </TabsContent>
      <TabsContent value="past">Monday 14:00</TabsContent>
    </Tabs>,
  );

describe("Tabs", () => {
  it("shows the selected panel and marks the selected tab", () => {
    renderTabs();

    const upcoming = screen.getByRole("tab", { name: "Upcoming" });
    expect(upcoming.getAttribute("aria-selected")).toBe("true");
    expect(upcoming.className).toContain("trigger-extra");
    expect(screen.getByRole("tablist").className).toContain("list-extra");
    expect(screen.getByRole("tabpanel").className).toContain("panel-extra");
    expect(screen.getByRole("tabpanel").textContent).toBe("Friday 10:00");
    expect(
      screen.getByRole("tab", { name: "Past" }).getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("switches panel on click", () => {
    renderTabs();

    fireEvent.click(screen.getByRole("tab", { name: "Past" }));

    expect(
      screen.getByRole("tab", { name: "Past" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Monday 14:00");
  });

  it("does not select a disabled tab", () => {
    renderTabs();

    fireEvent.click(screen.getByRole("tab", { name: "Cancelled" }));

    expect(
      screen
        .getByRole("tab", { name: "Upcoming" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("is horizontal by default and takes an orientation", () => {
    const { container, unmount } = renderTabs();
    expect(
      container
        .querySelector("[data-slot=tabs]")
        ?.getAttribute("data-orientation"),
    ).toBe("horizontal");
    unmount();

    const vertical = renderTabs("vertical");
    expect(
      vertical.container
        .querySelector("[data-slot=tabs]")
        ?.getAttribute("data-orientation"),
    ).toBe("vertical");
  });
});
