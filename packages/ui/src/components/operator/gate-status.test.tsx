import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GateStatus, type GateState } from "./gate-status";

const renderGate = (state: GateState, published = 2) =>
  render(
    <GateStatus
      state={state}
      invited={20}
      accepted={7}
      published={published}
    />,
  );

describe("GateStatus", () => {
  it("states the deciding count in words and lists the three counts", () => {
    renderGate("closed");

    const gate = screen.getByRole("region", { name: "Supply gate" });
    expect(within(gate).getByText("2 of 5").tagName).toBe("STRONG");
    expect(gate.querySelector("dl")?.textContent).toBe(
      "Invited20Accepted7Published2",
    );
    expect(within(gate).getByText("Closed")).toBeTruthy();
    expect(within(gate).getByText(/stays closed until/)).toBeTruthy();
    expect(within(gate).queryByRole("progressbar")).toBeNull();
  });

  it("says when the gate is open", () => {
    renderGate("open", 5);

    expect(screen.getByText("Open")).toBeTruthy();
    expect(screen.getByText(/Paid booking is open/)).toBeTruthy();
  });

  it("says when the gate stopped and takes a heading level and another threshold", () => {
    render(
      <GateStatus
        state="stopped"
        invited={20}
        accepted={4}
        published={3}
        required={4}
        headingLevel={3}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Paid booking" }),
    ).toBeTruthy();
    expect(screen.getByText("Stopped")).toBeTruthy();
    expect(screen.getByText("3 of 4")).toBeTruthy();
    expect(screen.getByText(/Further invitations stop/)).toBeTruthy();
  });
});
