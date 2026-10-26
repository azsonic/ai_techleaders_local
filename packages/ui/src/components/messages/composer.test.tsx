import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Composer } from "./composer";

describe("Composer", () => {
  it("has a visible label and sends the trimmed text, then clears", () => {
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    const field = screen.getByLabelText("Message") as HTMLTextAreaElement;

    fireEvent.change(field, { target: { value: "  Try the key prop.  " } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSend).toHaveBeenCalledWith("Try the key prop.");
    expect(field.value).toBe("");
  });

  it("refuses an empty message, names the problem and focuses the field", () => {
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(
      "Write a message to send.",
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Message"));
  });

  it("clears the error when the person types", () => {
    render(<Composer onSend={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hi" },
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("writes the reason beside a disabled composer and links it to the field", () => {
    render(
      <Composer onSend={vi.fn()} disabledReason="This session has ended." />,
    );
    const field = screen.getByLabelText("Message");

    expect((field as HTMLTextAreaElement).disabled).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Send message",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    const reason = screen.getByText("This session has ended.");
    expect(field.getAttribute("aria-describedby")).toBe(reason.id);
  });
});
