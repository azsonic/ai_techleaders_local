import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TOAST_TIMEOUT, ToastProvider, useToast } from "./toast";

function Trigger({ description }: { description?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast.add({ title: "Availability saved", description })}
    >
      Save
    </button>
  );
}

describe("Toast", () => {
  it("shows a titled confirmation in a labelled region", async () => {
    render(
      <ToastProvider>
        <Trigger description="Mentees see the new windows now." />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Availability saved")).toBeTruthy();
    expect(screen.getByText("Mentees see the new windows now.")).toBeTruthy();
    expect(
      screen
        .getByRole("region", { name: "Notifications" })
        .getAttribute("data-slot"),
    ).toBe("toast-viewport");
  });

  it("hides the description when there is none", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("Availability saved");
    expect(document.querySelector("[data-slot=toast-description]")).toBeNull();
  });

  it("closes from the close button", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Availability saved");

    const close = document.querySelector(
      "[data-slot=toast-close]",
    ) as HTMLElement;
    expect(close.getAttribute("aria-label")).toBe("Close notification");
    await act(async () => {
      fireEvent.click(close);
    });

    expect(screen.queryByText("Availability saved")).toBeNull();
  });

  it("keeps a default timeout and accepts another", () => {
    expect(TOAST_TIMEOUT).toBe(8000);
    render(
      <ToastProvider timeout={1000}>
        <span>page</span>
      </ToastProvider>,
    );
    expect(screen.getByText("page")).toBeTruthy();
  });
});
