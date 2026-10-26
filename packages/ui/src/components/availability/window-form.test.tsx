import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WindowForm } from "./window-form";

const now = new Date("2026-11-12T13:05:00Z");

const fill = (date = "2026-11-13", start = "10:00", end = "12:00") => {
  fireEvent.change(screen.getByLabelText("Date"), { target: { value: date } });
  fireEvent.change(screen.getByLabelText("Start"), {
    target: { value: start },
  });
  fireEvent.change(screen.getByLabelText("End"), { target: { value: end } });
};

describe("WindowForm", () => {
  it("states the zone and the daily limit before any error", () => {
    render(<WindowForm onSubmit={vi.fn()} now={now} />);

    expect(
      screen.getByText(
        /Times are in Europe\/Warsaw. Windows run from 10:00 to 22:00/,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/at least two hours from now/)).toBeTruthy();
  });

  it("uses the real clock by default", () => {
    render(<WindowForm onSubmit={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Add window" })).toBeTruthy();
  });

  it("refuses an empty submit, names every field and focuses the date", () => {
    const onSubmit = vi.fn();
    render(<WindowForm onSubmit={onSubmit} now={now} />);

    fireEvent.click(screen.getByRole("button", { name: "Add window" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getAllByRole("alert").map((alert) => alert.textContent),
    ).toEqual(["Choose a date.", "Enter a start time.", "Enter an end time."]);
    expect(document.activeElement).toBe(screen.getByLabelText("Date"));
  });

  it("adds the window, confirms after the server answered, clears the fields and calls onAdded", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, data: {} });
    const onAdded = vi.fn();
    render(<WindowForm onSubmit={onSubmit} now={now} onAdded={onAdded} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Add window" }));

    await waitFor(() => expect(onAdded).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      date: "2026-11-13",
      start: "10:00",
      end: "12:00",
    });
    expect((screen.getByLabelText("Date") as HTMLInputElement).value).toBe("");
  });

  it("adds a window without an onAdded callback", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, data: {} });
    render(<WindowForm onSubmit={onSubmit} now={now} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Add window" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("keeps the entries and says why when the server refuses an overlap", async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      ok: false,
      error: {
        code: "conflict",
        message: "This window overlaps one you already have.",
      },
    });
    render(<WindowForm onSubmit={onSubmit} now={now} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Add window" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "This window overlaps one you already have.",
      ),
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Could not add the window",
    );
    expect((screen.getByLabelText("Start") as HTMLInputElement).value).toBe(
      "10:00",
    );
  });
});
