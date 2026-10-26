import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody } from "../ui/table";
import { PayoutRow, type PayoutView } from "./payout-row";

const payout: PayoutView = {
  id: "p1",
  startsAt: "2026-11-13T09:00:00Z",
  menteeName: "Jan Kowalski",
  pricePln: 93,
  status: "held",
};

const renderRow = (overrides: Partial<PayoutView> = {}) => {
  render(
    <Table label="Earnings">
      <TableBody>
        <PayoutRow payout={{ ...payout, ...overrides }} zone="Europe/Warsaw" />
      </TableBody>
    </Table>,
  );
  return within(screen.getByRole("row")).getAllByRole("cell");
};

describe("PayoutRow", () => {
  it("shows the session, the price, the commission and what the mentor receives", () => {
    const cells = renderRow();

    expect(cells[0].textContent).toMatch(
      /Fri 13 Nov, 10:00 .*with Jan Kowalski/,
    );
    expect(cells.slice(1, 4).map((cell) => cell.textContent)).toEqual([
      "93 PLN",
      "18.60 PLN",
      "74.40 PLN",
    ]);
    expect(cells[3].className).toContain("font-emphasis");
    expect(cells[1].className).toContain("tabular-nums");
  });

  it("writes the status as a badge in words", () => {
    const cells = renderRow({ status: "paid" });

    expect(within(cells[4]).getByText("Paid")).toBeTruthy();
  });

  it("pays nothing for a refunded session", () => {
    const cells = renderRow({ status: "refunded" });

    expect(cells[2].textContent).toBe("0 PLN");
    expect(cells[3].textContent).toBe("0 PLN");
    expect(within(cells[4]).getByText("Refunded")).toBeTruthy();
  });

  it("marks a dispute and a held payout", () => {
    expect(
      within(renderRow({ status: "in-dispute" })[4]).getByText("In dispute"),
    ).toBeTruthy();
  });
});
