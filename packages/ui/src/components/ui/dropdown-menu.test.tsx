import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const renderMenu = (
  onCancel = vi.fn(),
  onChecked = vi.fn(),
  onValue = vi.fn(),
) =>
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent className="extra">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="label-extra">Booking</DropdownMenuLabel>
          <DropdownMenuItem className="item-extra">
            Open booking
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onCancel}>
            Cancel booking
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="separator-extra" />
        <DropdownMenuCheckboxItem
          checked
          onCheckedChange={onChecked}
          className="checkbox-extra"
        >
          Show past sessions
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="soonest" onValueChange={onValue}>
          <DropdownMenuRadioItem value="soonest" className="radio-extra">
            Soonest first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price">
            Lowest price first
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );

describe("DropdownMenu", () => {
  it("opens a named menu with items and a group label", async () => {
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    const menu = await screen.findByRole("menu");
    expect(menu.getAttribute("data-slot")).toBe("dropdown-menu-content");
    expect(menu.className).toContain("extra");
    expect(screen.getByText("Booking").className).toContain("label-extra");
    expect(
      screen.getByRole("menuitem", { name: "Open booking" }).className,
    ).toContain("item-extra");
    expect(screen.getByRole("separator").className).toContain(
      "separator-extra",
    );
  });

  it("marks a destructive item and runs its action", async () => {
    const onCancel = vi.fn();
    renderMenu(onCancel);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    const item = await screen.findByRole("menuitem", {
      name: "Cancel booking",
    });
    expect(item.getAttribute("data-variant")).toBe("destructive");
    fireEvent.click(item);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("marks an unchecked-by-default item as the default variant", async () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    expect(
      (
        await screen.findByRole("menuitem", { name: "Open booking" })
      ).getAttribute("data-variant"),
    ).toBe("default");
  });

  it("reports checkbox and radio choices with a check indicator", async () => {
    const onChecked = vi.fn();
    const onValue = vi.fn();
    renderMenu(vi.fn(), onChecked, onValue);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    const checkbox = await screen.findByRole("menuitemcheckbox", {
      name: "Show past sessions",
    });
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.className).toContain("checkbox-extra");
    expect(
      checkbox.querySelector(
        "[data-slot=dropdown-menu-checkbox-item-indicator] svg",
      ),
    ).toBeTruthy();
    fireEvent.click(checkbox);
    expect(onChecked).toHaveBeenCalledTimes(1);

    if (!screen.queryByRole("menu"))
      fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const soonest = await screen.findByRole("menuitemradio", {
      name: "Soonest first",
    });
    expect(soonest.getAttribute("aria-checked")).toBe("true");
    expect(soonest.className).toContain("radio-extra");
    expect(
      soonest.querySelector(
        "[data-slot=dropdown-menu-radio-item-indicator] svg",
      ),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("menuitemradio", { name: "Lowest price first" }),
    );
    expect(onValue).toHaveBeenCalledTimes(1);
  });
});
