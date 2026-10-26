import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WindowList } from "./window-list";

const windows = [
  {
    id: "w1",
    startsAt: "2026-11-13T09:00:00Z",
    endsAt: "2026-11-13T11:00:00Z",
  },
  {
    id: "w2",
    startsAt: "2026-11-14T16:00:00Z",
    endsAt: "2026-11-14T19:00:00Z",
  },
];

describe("WindowList", () => {
  it("lists windows in Warsaw time", () => {
    render(<WindowList windows={windows} onRemove={vi.fn()} />);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0].textContent).toContain("Fri 13 Nov, 10:00 to 12:00");
    expect(rows[1].textContent).toContain("Sat 14 Nov, 17:00 to 20:00");
  });

  it("shows loading as text and skeletons", () => {
    render(<WindowList windows={undefined} loading onRemove={vi.fn()} />);

    expect(screen.getByRole("status").textContent).toBe(
      "Loading your windows…",
    );
  });

  it("explains an empty list and what to do", () => {
    render(<WindowList windows={[]} onRemove={vi.fn()} />);

    expect(screen.getByText("No windows yet")).toBeTruthy();
  });

  it("offers a retry when the list did not load", () => {
    const onRetry = vi.fn();
    render(
      <WindowList
        windows={undefined}
        error
        onRetry={onRetry}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the load failure without a retry when none is given, and for a missing list", () => {
    render(<WindowList windows={undefined} onRemove={vi.fn()} />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Your windows did not load",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("names the window in the question, keeps Cancel first and removes only after the server answered", async () => {
    const onRemove = vi.fn().mockResolvedValue({ ok: true, data: {} });
    render(<WindowList windows={windows} onRemove={onRemove} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove window Fri 13 Nov, 10:00 to 12:00",
      }),
    );

    const dialog = await screen.findByRole("alertdialog", {
      name: "Remove Fri 13 Nov, 10:00 to 12:00?",
    });
    const buttons = Array.from(dialog.querySelectorAll("button")).map(
      (button) => button.textContent,
    );
    expect(buttons).toEqual(["Keep window", "Remove window"]);

    fireEvent.click(screen.getByRole("button", { name: "Remove window" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onRemove).toHaveBeenCalledWith("w1");
  });

  it("keeps the dialog open and explains a failure, then allows another try", async () => {
    const onRemove = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        error: {
          code: "server_error",
          message: "Something broke on our side.",
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "network_error", message: "Could not reach the server" },
      });
    render(<WindowList windows={windows} onRemove={onRemove} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove window/ })[0],
    );
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: "Remove window" }));
    await waitFor(() =>
      expect(screen.getByRole("alertdialog").textContent).toContain(
        "Something broke on our side.",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove window" }));
    await waitFor(() =>
      expect(screen.getByRole("alertdialog").textContent).toContain(
        "The server did not answer",
      ),
    );
  });

  it("ignores a second confirm while removing and closes without removing on Cancel", async () => {
    let resolve: (value: { ok: true; data: object }) => void = () => {};
    const onRemove = vi.fn(
      () => new Promise<{ ok: true; data: object }>((done) => (resolve = done)),
    );
    render(<WindowList windows={windows} onRemove={onRemove} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove window/ })[0],
    );
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: "Remove window" }));
    fireEvent.click(screen.getByRole("button", { name: "Removing…" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Keep window" }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    resolve({ ok: true, data: {} });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());

    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove window/ })[1],
    );
    await screen.findByRole("alertdialog");
    fireEvent.click(screen.getByRole("button", { name: "Keep window" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
