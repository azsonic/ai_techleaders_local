import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Table, TableBody } from "../ui/table";
import { InvitationRow, type Invitation } from "./invitation-row";

const renderRow = (invitation: Invitation, onRevoke = vi.fn()) =>
  render(
    <Table label="Invitations">
      <TableBody>
        <InvitationRow invitation={invitation} onRevoke={onRevoke} />
      </TableBody>
    </Table>,
  );

describe("InvitationRow", () => {
  it("shows a pending invitation with a revoke action named after the person", () => {
    const onRevoke = vi.fn();
    renderRow(
      {
        id: "i1",
        email: "anna@example.com",
        status: "pending",
        expires: "26 Nov",
      },
      onRevoke,
    );

    expect(screen.getByText("anna@example.com")).toBeTruthy();
    expect(screen.getByText("Pending").className).toContain("bg-primary");
    expect(screen.getByText("26 Nov")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Revoke invitation for anna@example.com",
      }),
    );
    expect(onRevoke).toHaveBeenCalledWith("i1");
  });

  it("calls an invitation without an e-mail a link anyone can use", () => {
    renderRow({ id: "i2", status: "pending", expires: "26 Nov" });

    expect(screen.getByText("Anyone with the link")).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Revoke invitation for anyone with the link",
      }),
    ).toBeTruthy();
  });

  it("offers no action once the invitation is no longer pending, and styles each status", () => {
    const { unmount } = renderRow({
      id: "i3",
      email: "a@b.pl",
      status: "revoked",
      expires: "26 Nov",
    });
    expect(screen.getByText("Revoked").className).toContain(
      "border-destructive",
    );
    expect(screen.queryByRole("button")).toBeNull();
    unmount();

    const accepted = renderRow({
      id: "i4",
      email: "a@b.pl",
      status: "accepted",
      expires: "26 Nov",
    });
    expect(screen.getByText("Accepted").className).toContain("bg-secondary");
    accepted.unmount();

    renderRow({
      id: "i5",
      email: "a@b.pl",
      status: "expired",
      expires: "26 Nov",
    });
    expect(screen.getByText("Expired")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
