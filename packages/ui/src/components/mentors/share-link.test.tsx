import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ShareLink } from "./share-link";

const URL = "https://devmentor.example/mentors/anna";

afterEach(() => vi.unstubAllGlobals());

describe("ShareLink", () => {
  it("shows the link in a labelled read-only field", () => {
    render(<ShareLink url={URL} />);

    const input = screen.getByLabelText("Your share link") as HTMLInputElement;
    expect(input.value).toBe(URL);
    expect(input.readOnly).toBe(true);
  });

  it("says what the link does, and takes another description", () => {
    const { rerender } = render(<ShareLink url={URL} />);
    expect(screen.getByText(/open your page, even if you are not listed/)).toBeTruthy();

    rerender(<ShareLink url={URL} description="Anyone with this link can accept the invitation, once." />);
    expect(screen.getByText("Anyone with this link can accept the invitation, once.")).toBeTruthy();
  });

  it("selects the whole link when the field is focused", () => {
    render(<ShareLink url={URL} label="Link to your page" />);
    const input = screen.getByLabelText(
      "Link to your page",
    ) as HTMLInputElement;
    const select = vi.spyOn(input, "select");

    fireEvent.focus(input);

    expect(select).toHaveBeenCalled();
  });

  it("copies the link and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ShareLink url={URL} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Link copied."),
    );
    expect(writeText).toHaveBeenCalledWith(URL);
  });

  it("tells the person what to do when copying is not possible", async () => {
    vi.stubGlobal("navigator", {});
    render(<ShareLink url={URL} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "Could not copy. Select the link and copy it yourself.",
      ),
    );
  });
});
