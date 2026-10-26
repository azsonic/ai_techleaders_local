import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorActionDialog, REASON_MAX } from "./operator-action-dialog";

const ok = () => Promise.resolve({ ok: true as const, data: {} });

const renderDialog = (onConfirm = vi.fn(ok), open = true) => {
  const onOpenChange = vi.fn();
  render(
    <OperatorActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Suspend Anna Kowalska?"
      consequence="Her profile is hidden and 2 future bookings are cancelled with full refunds."
      confirmLabel="Suspend mentor"
      loadingLabel="Suspending…"
      onConfirm={onConfirm}
    />,
  );
  return { onConfirm, onOpenChange };
};

describe("OperatorActionDialog", () => {
  it("names the object, states the consequence and keeps Cancel first", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog", {
      name: "Suspend Anna Kowalska?",
    });
    expect(dialog.textContent).toContain("2 future bookings are cancelled");
    expect(screen.getByLabelText("Reason")).toBeTruthy();
    const buttons = screen
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(buttons.slice(0, 2)).toEqual(["Keep as it is", "Suspend mentor"]);
  });

  it("refuses a missing reason, names it and focuses the field", () => {
    const { onConfirm } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Suspend mentor" }));
    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Suspend mentor" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(
      "Write a reason. It is logged with the action.",
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Reason"));
  });

  it("shows how much of the limit is used and refuses a longer reason", () => {
    const { onConfirm } = renderDialog();

    expect(screen.getByText(/0 used/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "x".repeat(REASON_MAX + 1) },
    });
    expect(screen.getByText(/1001 used/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Suspend mentor" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(
      "Use at most 1000 characters.",
    );
  });

  it("sends the trimmed reason and closes after the server answered", async () => {
    const { onConfirm, onOpenChange } = renderDialog();

    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "  Two no-shows.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Suspend mentor" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenCalledWith({ reason: "Two no-shows." });
  });

  it("stays open and says what happened on a failure", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      ok: false,
      error: { code: "conflict", message: "Already suspended." },
    });
    const { onOpenChange } = renderDialog(onConfirm);

    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Suspend mentor" }));

    await waitFor(() =>
      expect(screen.getByRole("dialog").textContent).toContain(
        "Already suspended.",
      ),
    );
    expect(screen.getByRole("dialog").textContent).toContain(
      "The action was not carried out",
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("closes from Keep as it is", () => {
    const { onOpenChange } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Keep as it is" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores a close request while the server is answering", async () => {
    const { onOpenChange } = renderDialog(
      vi.fn(() => new Promise<never>(() => {})),
    );

    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Suspend mentor" }));
    await screen.findByRole("button", { name: "Suspending…" });
    fireEvent.click(screen.getByRole("button", { name: "Keep as it is" }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("renders nothing while closed", () => {
    renderDialog(undefined, false);

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
