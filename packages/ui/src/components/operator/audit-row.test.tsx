import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody } from "../ui/table";
import { AuditRow, type AuditEntry } from "./audit-row";

const entry: AuditEntry = {
  id: "a1",
  at: "2026-11-13T09:00:00Z",
  operator: "founder@devmentor.example",
  action: "Suspended Anna Kowalska",
  reason: "Two bookings were not attended.",
};

describe("AuditRow", () => {
  it("shows when, who, what and why", () => {
    render(
      <Table label="Audit log">
        <TableBody>
          <AuditRow entry={entry} zone="Europe/Warsaw" />
        </TableBody>
      </Table>,
    );

    const cells = within(screen.getByRole("row")).getAllByRole("cell");
    expect(cells[0].textContent).toMatch(/^Fri 13 Nov, 10:00 /);
    expect(cells[1].textContent).toBe("founder@devmentor.example");
    expect(cells[2].textContent).toBe("Suspended Anna Kowalska");
    expect(cells[2].className).toContain("font-emphasis");
    expect(cells[3].textContent).toBe("Two bookings were not attended.");
  });
});
