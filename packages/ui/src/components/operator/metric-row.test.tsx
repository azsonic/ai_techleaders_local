import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricRow } from "./metric-row";

const renderRow = (props: Parameters<typeof MetricRow>[0]) =>
  render(
    <dl>
      <MetricRow {...props} />
    </dl>,
  );

describe("MetricRow", () => {
  it("shows the name, the value in tabular figures and how it is counted", () => {
    renderRow({
      label: "Time from booking to start",
      value: "3 h 10 min",
      detail: "Median of all confirmed bookings.",
    });

    expect(screen.getByText("Time from booking to start").tagName).toBe("DT");
    const value = screen.getByText("3 h 10 min");
    expect(value.tagName).toBe("DD");
    expect(value.className).toContain("tabular-nums");
    expect(screen.getByText("Median of all confirmed bookings.").tagName).toBe(
      "DD",
    );
  });

  it("says there is no data instead of showing 0", () => {
    renderRow({ label: "Refunds" });

    const value = screen.getByText("No data yet");
    expect(value.className).toContain("text-muted-foreground");
    expect(screen.queryByText("0")).toBeNull();
  });
});
