import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UsefulnessCheck } from "./usefulness-check";

const ok = () => Promise.resolve({ ok: true as const, data: {} });

describe("UsefulnessCheck", () => {
  it("asks one question with three answers and no scale", () => {
    render(<UsefulnessCheck mentorName="Anna Kowalska" onSubmit={ok} />);

    expect(screen.getByRole("radiogroup")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByText(/Did the help from Anna Kowalska/)).toBeTruthy();
  });

  it("refuses a missing answer, names it and focuses the first option", () => {
    const onSubmit = vi.fn(ok);
    render(<UsefulnessCheck mentorName="Anna" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Choose an answer.");
    expect(document.activeElement).toBe(screen.getAllByRole("radio")[0]);
  });

  it("sends the answer and shows it as text only after the server confirmed", async () => {
    const onSubmit = vi.fn(ok);
    render(<UsefulnessCheck mentorName="Anna" onSubmit={onSubmit} />);

    fireEvent.click(
      screen.getByRole("radio", { name: "No, it arrived too late" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));

    await waitFor(() =>
      expect(screen.getByText("Thank you. Your answer is saved.")).toBeTruthy(),
    );
    expect(onSubmit).toHaveBeenCalledWith("no");
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByText("No, it arrived too late.")).toBeTruthy();
  });

  it("keeps the form and says what happened when the server fails", async () => {
    render(
      <UsefulnessCheck
        mentorName="Anna"
        onSubmit={() =>
          Promise.resolve({
            ok: false as const,
            error: { code: "server_error", message: "Something broke." },
          })
        }
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", { name: "Yes, it arrived in time" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));

    await waitFor(() =>
      expect(screen.getByText("Your answer was not saved")).toBeTruthy(),
    );
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("shows an earlier answer as text, without the success message", () => {
    render(<UsefulnessCheck mentorName="Anna" answered="yes" onSubmit={ok} />);

    expect(screen.getByText("Yes, it arrived in time.")).toBeTruthy();
    expect(screen.queryByText(/Thank you/)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
