import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

describe("Popover", () => {
  it("opens from its trigger with a title and a description", async () => {
    render(
      <Popover>
        <PopoverTrigger>Time zone</PopoverTrigger>
        <PopoverContent className="extra">
          <PopoverHeader className="header-extra">
            <PopoverTitle className="title-extra">Why this time</PopoverTitle>
            <PopoverDescription className="description-extra">
              Shown in Europe/Warsaw, where the booking limit is stated.
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Time zone" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    const content = await screen.findByRole("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.getAttribute("data-slot")).toBe("popover-content");
    expect(content.className).toContain("extra");
    expect(screen.getByText("Why this time").className).toContain(
      "title-extra",
    );
    expect(screen.getByText(/Shown in Europe/).className).toContain(
      "description-extra",
    );
    expect(
      content.querySelector("[data-slot=popover-header]")?.className,
    ).toContain("header-extra");
  });
});
