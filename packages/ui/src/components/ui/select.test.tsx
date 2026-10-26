import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const renderSelect = (
  props: { density?: "default" | "dense"; defaultValue?: string } = {},
) =>
  render(
    <Select defaultValue={props.defaultValue}>
      <SelectTrigger
        aria-label="Start time"
        density={props.density}
        className="extra"
      >
        <SelectValue placeholder="Choose a time" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Morning</SelectLabel>
          <SelectItem value="10:00">10:00</SelectItem>
          <SelectItem value="10:25">10:25</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Evening</SelectLabel>
          <SelectItem value="20:00">20:00</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  );

describe("Select", () => {
  it("renders a trigger with the default density and a placeholder", () => {
    renderSelect();

    const trigger = screen.getByRole("combobox", { name: "Start time" });
    expect(trigger.getAttribute("data-slot")).toBe("select-trigger");
    expect(trigger.className).toContain("h-control");
    expect(trigger.className).toContain("extra");
    expect(screen.getByText("Choose a time")).toBeTruthy();
  });

  it("renders the dense density", () => {
    renderSelect({ density: "dense" });

    expect(screen.getByRole("combobox").className).toContain("h-control-dense");
  });

  it("opens, lists grouped options and selects one", async () => {
    renderSelect();

    fireEvent.click(screen.getByRole("combobox"));

    expect(await screen.findByText("Morning")).toBeTruthy();
    expect(screen.getByText("Evening")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);

    fireEvent.click(screen.getByRole("option", { name: "10:25" }));

    expect(await screen.findByText("10:25")).toBeTruthy();
  });

  it("shows the selected option", async () => {
    renderSelect({ defaultValue: "20:00" });

    expect(screen.getByRole("combobox").textContent).toContain("20:00");
  });
});
