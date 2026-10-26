import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CancelDialog } from "./cancel-dialog";

const base = {
  counterpartName: "Anna Kowalska",
  startsAt: "2026-11-13T09:00:00Z",
  zone: "Europe/Warsaw",
};
const ok = () => Promise.resolve({ ok: true as const, data: {} });

describe("CancelDialog for a mentee", () => {
  const renderMentee = (
    onConfirm = vi.fn(ok),
    outcome: "full-grace" | "full" | "none" = "full",
    onOpenChange = vi.fn(),
  ) => {
    render(
      <CancelDialog
        {...base}
        viewer="mentee"
        outcome={outcome}
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    return { onConfirm, onOpenChange };
  };

  it("names the session and states the outcome in words", () => {
    renderMentee(undefined, "none");

    expect(
      screen.getByRole("alertdialog", {
        name: "Cancel Fri 13 Nov, 10:00 with Anna Kowalska?",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(/no refund. The mentor is paid when payments process/),
    ).toBeTruthy();
  });

  it("states the other two outcomes", () => {
    const { unmount } = render(
      <CancelDialog
        {...base}
        viewer="mentee"
        outcome="full-grace"
        open
        onOpenChange={vi.fn()}
        onConfirm={ok}
      />,
    );
    expect(screen.getByText(/less than 15 minutes ago/)).toBeTruthy();
    unmount();
    renderMentee(undefined, "full");
    expect(
      screen.getByText(/at least two hours before the start/),
    ).toBeTruthy();
  });

  it("keeps Cancel first, closes after the server answered and sends no reason", async () => {
    const { onConfirm, onOpenChange } = renderMentee();
    const buttons = screen
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(buttons).toEqual(["Keep session", "Cancel session"]);

    fireEvent.click(screen.getByRole("button", { name: "Cancel session" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenCalledWith({});
  });

  it("closes and resets on Keep session", () => {
    const { onOpenChange } = renderMentee();

    fireEvent.click(screen.getByRole("button", { name: "Keep session" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open and explains a failure, then offers another try", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      ok: false,
      error: {
        code: "booking_not_cancellable",
        message: "This session already started.",
      },
    });
    const { onOpenChange } = renderMentee(onConfirm);

    fireEvent.click(screen.getByRole("button", { name: "Cancel session" }));

    await waitFor(() =>
      expect(screen.getByRole("alertdialog").textContent).toContain(
        "This session already started.",
      ),
    );
    expect(screen.getByRole("alertdialog").textContent).toContain(
      "The session was not cancelled",
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("ignores a close request while the server is answering", async () => {
    const onConfirm = vi.fn(() => new Promise<never>(() => {}));
    const { onOpenChange } = renderMentee(onConfirm);

    fireEvent.click(screen.getByRole("button", { name: "Cancel session" }));
    await screen.findByRole("button", { name: "Cancelling…" });
    fireEvent.click(screen.getByRole("button", { name: "Keep session" }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("renders nothing while closed", () => {
    render(
      <CancelDialog
        {...base}
        viewer="mentee"
        outcome="full"
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={ok}
      />,
    );

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});

describe("CancelDialog for a mentor", () => {
  const renderMentor = (onConfirm = vi.fn(ok), onOpenChange = vi.fn()) => {
    render(
      <CancelDialog
        {...base}
        viewer="mentor"
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    return { onConfirm, onOpenChange };
  };

  it("says who sees the reason and the refund outcome", () => {
    renderMentor();

    const dialog = screen.getByRole("dialog", {
      name: "Cancel Fri 13 Nov, 10:00 with Anna Kowalska?",
    });
    expect(dialog.textContent).toContain(
      "Anna Kowalska gets a full refund, due when payments process.",
    );
    expect(dialog.textContent).toContain(
      "shown to Anna Kowalska and to the operator",
    );
    expect(
      screen
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("aria-checked")),
    ).toEqual(["false", "false", "false"]);
  });

  it("requires a reason, sends nothing and focuses the first reason", () => {
    const { onConfirm } = renderMentor();

    fireEvent.click(screen.getByRole("button", { name: "Cancel session" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Choose a reason.");
    expect(document.activeElement).toBe(screen.getAllByRole("radio")[0]);
  });

  it("sends the reason and the note, then closes after the server answered", async () => {
    const { onConfirm, onOpenChange } = renderMentor();

    fireEvent.click(screen.getByRole("radio", { name: "I am unavailable" }));
    fireEvent.change(screen.getByLabelText(/Note/), {
      target: { value: "Family emergency." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel session" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenCalledWith({
      reason: "unavailable",
      note: "Family emergency.",
    });
  });

  it("closes from Keep session and keeps the dialog open on a failure", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      ok: false,
      error: { code: "network_error", message: "Could not reach the server" },
    });
    const { onOpenChange } = renderMentor(onConfirm);

    fireEvent.click(screen.getByRole("radio", { name: "Other" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel session" }));
    await waitFor(() =>
      expect(screen.getByRole("dialog").textContent).toContain(
        "The server did not answer",
      ),
    );
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Keep session" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
