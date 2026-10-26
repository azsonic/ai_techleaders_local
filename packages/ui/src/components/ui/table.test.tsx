import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

describe("Table", () => {
  it("renders a named, keyboard-reachable scroll region with headers", () => {
    render(
      <Table label="Invitations" className="extra">
        <TableCaption className="caption-extra">Sent this week</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead scope="row">Row header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="row-extra">
            <TableCell className="cell-extra">Pending</TableCell>
            <TableCell>anna@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter className="footer-extra">
          <TableRow>
            <TableCell>1 invitation</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    const region = screen.getByRole("region", { name: "Invitations" });
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("table").className).toContain("extra");
    expect(screen.getByRole("columnheader", { name: "Status" }).getAttribute("scope")).toBe("col");
    expect(screen.getByRole("rowheader", { name: "Row header" })).toBeTruthy();
    expect(screen.getByText("Sent this week").className).toContain("caption-extra");
    expect(screen.getByText("Pending").className).toContain("cell-extra");
    expect(screen.getByText("Pending").closest("tr")?.className).toContain("row-extra");
    expect(screen.getByText("1 invitation").closest("tfoot")?.className).toContain("footer-extra");
  });

  it("passes classes to the header and body", () => {
    render(
      <Table label="Bookings">
        <TableHeader className="head-extra">
          <TableRow>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="body-extra">
          <TableRow>
            <TableCell>Tue 14:00</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole("columnheader").closest("thead")?.className).toContain("head-extra");
    expect(screen.getByText("Tue 14:00").closest("tbody")?.className).toContain("body-extra");
  });
});
