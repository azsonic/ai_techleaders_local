import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Conversation } from "./conversation";
import type { MessageView } from "./message-item";

const messages: MessageView[] = [
  {
    id: "m1",
    authorName: "Jan Kowalski",
    own: true,
    sentAt: "2026-11-13T09:01:00Z",
    body: "My effect runs twice.",
    delivery: "sent",
  },
  {
    id: "m2",
    authorName: "Anna Kowalska",
    sentAt: "2026-11-13T09:03:00Z",
    body: "Is this in development mode?",
  },
  {
    id: "m3",
    authorName: "Jan Kowalski",
    own: true,
    sentAt: "2026-11-13T09:04:00Z",
    body: "Yes.",
    delivery: "sent",
  },
];

describe("Conversation", () => {
  it("is a named, focusable log with the composer beside it", () => {
    render(<Conversation messages={messages} zone="UTC" onSend={vi.fn()} />);

    const log = screen.getByRole("log", { name: "Messages" });
    expect(log.getAttribute("tabindex")).toBe("0");
    expect(within(log).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByLabelText("Message")).toBeTruthy();
  });

  it('keeps "Sent" only on your latest message', () => {
    render(<Conversation messages={messages} zone="UTC" onSend={vi.fn()} />);

    expect(screen.getAllByText("Sent")).toHaveLength(1);
    expect(
      within(screen.getAllByRole("listitem")[2]).getByText("Sent"),
    ).toBeTruthy();
  });

  it("says when there are no messages yet", () => {
    render(<Conversation messages={[]} onSend={vi.fn()} />);

    expect(screen.getByText("No messages yet")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("passes sending, retry and the disabled reason through", () => {
    const onSend = vi.fn();
    const onRetry = vi.fn();
    render(
      <Conversation
        messages={[{ ...messages[0], delivery: "failed" }]}
        zone="UTC"
        onSend={onSend}
        onRetry={onRetry}
        disabledReason="This session has ended."
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledWith("m1");
    expect(screen.getByText("This session has ended.")).toBeTruthy();
  });

  it("scrolls to the newest message when one is added", () => {
    const { rerender } = render(
      <Conversation
        messages={messages.slice(0, 1)}
        zone="UTC"
        onSend={vi.fn()}
      />,
    );
    const log = screen.getByRole("log");
    Object.defineProperty(log, "scrollHeight", {
      value: 500,
      configurable: true,
    });

    rerender(<Conversation messages={messages} zone="UTC" onSend={vi.fn()} />);

    expect(log.scrollTop).toBe(500);
  });
});
