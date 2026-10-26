import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MessageItem, type MessageView } from "./message-item";

const message: MessageView = {
  id: "m1",
  authorName: "Anna Kowalska",
  sentAt: "2026-11-13T09:07:00Z",
  body: "Which version of React are you on?\nAnd is it the app router?",
};

const renderItem = (
  overrides: Partial<MessageView> = {},
  onRetry?: (id: string) => void,
) =>
  render(
    <ul>
      <MessageItem
        message={{ ...message, ...overrides }}
        zone="Europe/Warsaw"
        onRetry={onRetry}
      />
    </ul>,
  );

describe("MessageItem", () => {
  it("shows the author, the time and the text with its line breaks", () => {
    renderItem();

    expect(screen.getByText("Anna Kowalska")).toBeTruthy();
    const time = screen.getByText("10:07") as HTMLTimeElement;
    expect(time.dateTime).toBe("2026-11-13T09:07:00Z");
    expect(screen.getByText(/Which version/).className).toContain(
      "whitespace-pre-wrap",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it('calls your own message "You" and shows a caption', () => {
    renderItem({ own: true, caption: "Booking question" });

    expect(screen.getByText("You")).toBeTruthy();
    expect(screen.queryByText("Anna Kowalska")).toBeNull();
    expect(screen.getByText("Booking question")).toBeTruthy();
  });

  it("writes the delivery state beside the message in words", () => {
    const { unmount } = renderItem({ own: true, delivery: "sending" });
    expect(screen.getByText("Sending…")).toBeTruthy();
    unmount();
    renderItem({ own: true, delivery: "sent" });
    expect(screen.getByText("Sent")).toBeTruthy();
  });

  it("announces a failure and offers a retry for that message", () => {
    const onRetry = vi.fn();
    renderItem({ own: true, delivery: "failed" }, onRetry);

    expect(screen.getByRole("alert").textContent).toContain(
      "Message wasn't sent.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledWith("m1");
  });

  it("does not fail without a retry handler", () => {
    renderItem({ own: true, delivery: "failed" });

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("alert")).toBeTruthy();
  });
});
