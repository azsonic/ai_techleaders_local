import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

describe("Tooltip", () => {
  it("names the control on keyboard focus", async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger aria-label="Copy booking link">Copy</TooltipTrigger>
          <TooltipContent className="extra">Copy booking link</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(
      screen.queryByText("Copy booking link", {
        selector: "[data-slot=tooltip-content]",
      }),
    ).toBeNull();

    fireEvent.focus(screen.getByRole("button", { name: "Copy booking link" }));

    const tooltip = await screen.findByText("Copy booking link", {
      selector: "[data-slot=tooltip-content]",
    });
    expect(tooltip.className).toContain("extra");
    expect(tooltip.textContent).toBe("Copy booking link");
  });

  it("appears immediately by default and takes a provider delay", () => {
    const { rerender } = render(
      <TooltipProvider>
        <span />
      </TooltipProvider>,
    );

    rerender(
      <TooltipProvider delay={500}>
        <span />
      </TooltipProvider>,
    );
  });
});
