import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ApiResult } from "@devmentor/core";

import { ToastProvider } from "../ui/toast";
import { FavoriteMentors, type FavoriteMentor } from "./favorite-mentors";

const anna: FavoriteMentor = {
  id: "a",
  displayName: "Anna Kowalska",
  headline: "Senior frontend engineer",
  stacks: ["typescript", "react"],
  href: "/mentors/anna",
};
const piotr: FavoriteMentor = {
  id: "p",
  displayName: "Piotr Nowak",
  stacks: ["python"],
  href: "/mentors/piotr",
};

const ok: ApiResult<unknown> = { ok: true, data: null };

const setup = (
  props: Partial<Parameters<typeof FavoriteMentors>[0]> = {},
  onRemove: (id: string) => Promise<ApiResult<unknown>> = vi.fn(async () => ok),
) => {
  const onSelectedChange = vi.fn();
  const view = (mentors: FavoriteMentor[] | undefined) => (
    <ToastProvider>
      <FavoriteMentors
        selected={[]}
        onSelectedChange={onSelectedChange}
        onRemove={onRemove}
        {...props}
        mentors={mentors}
      />
    </ToastProvider>
  );
  const utils = render(view(props.mentors ?? [anna, piotr]));
  return {
    onRemove,
    onSelectedChange,
    rerender: (m: FavoriteMentor[] | undefined) => utils.rerender(view(m)),
  };
};

describe("FavoriteMentors", () => {
  it("shows each mentor with name link, headline, stacks and a remove action named for the mentor", () => {
    setup();

    expect(screen.getByRole("status").textContent).toBe("2 mentors");
    expect(
      screen.getByRole("link", { name: "Anna Kowalska" }).getAttribute("href"),
    ).toBe("/mentors/anna");
    expect(screen.getByText("Senior frontend engineer")).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Remove from favorites: Anna Kowalska",
      }),
    ).toBeTruthy();
  });

  it("filters by stack through the shared filtered list", () => {
    const { onSelectedChange } = setup();
    fireEvent.click(screen.getByRole("checkbox", { name: "Python" }));
    expect(onSelectedChange).toHaveBeenCalledWith(["python"]);
  });

  it("shows a loading message that names what loads", () => {
    setup({ loading: true, mentors: undefined });
    expect(screen.getByText("Loading your favorite mentors…")).toBeTruthy();
  });

  it("says why nothing is shown: nothing saved with a way to find a mentor", () => {
    setup({ mentors: [] });
    expect(screen.getByText("You have not saved any mentors yet")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Find a mentor" }).getAttribute("href"),
    ).toBe("/mentors");
  });

  it("says why nothing is shown: filters match nothing", () => {
    setup({ mentors: [], selected: ["ai-agents"] });
    expect(
      screen.getByText("No favorite mentors for these filters"),
    ).toBeTruthy();
  });

  it("shows a load error with a retry", () => {
    const onRetry = vi.fn();
    setup({ mentors: undefined, error: true, onRetry });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("marks only the acted-on card as removing, then toasts and moves focus to the next card", async () => {
    let resolve: (value: ApiResult<unknown>) => void = () => undefined;
    const onRemove = vi.fn(
      () => new Promise<ApiResult<unknown>>((r) => (resolve = r)),
    );
    const { rerender } = setup({}, onRemove);

    fireEvent.click(
      screen.getByRole("button", { name: /Remove from favorites: Anna/ }),
    );
    expect(
      screen
        .getByRole("button", { name: /Removing/ })
        .getAttribute("aria-busy"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: /Remove from favorites: Piotr/ })
        .getAttribute("aria-busy"),
    ).toBeNull();

    await act(async () => resolve(ok));
    rerender([piotr]);

    expect(
      await screen.findByText("Anna Kowalska removed from favorites"),
    ).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("link", { name: "Piotr Nowak" }),
      ),
    );
  });

  it("moves focus to the list area when the last mentor was removed", async () => {
    const { rerender } = setup({ mentors: [anna] });
    fireEvent.click(
      screen.getByRole("button", { name: /Remove from favorites/ }),
    );
    await screen.findByText("Anna Kowalska removed from favorites");
    rerender([]);

    await waitFor(() =>
      expect(document.activeElement?.getAttribute("tabindex")).toBe("-1"),
    );
    expect(screen.getByText("You have not saved any mentors yet")).toBeTruthy();
  });

  it("waits for the list to shrink before moving focus, and ignores a list that failed to load", async () => {
    const { rerender } = setup({ mentors: [anna, piotr] });
    fireEvent.click(
      screen.getByRole("button", { name: /Remove from favorites: Anna/ }),
    );
    await screen.findByText("Anna Kowalska removed from favorites");
    expect(document.activeElement).toBe(document.body);

    rerender(undefined);
    expect(document.activeElement).toBe(document.body);
  });

  it("keeps the card and shows the server's words when removing fails, and clears them on the next try", async () => {
    const onRemove = vi
      .fn<(id: string) => Promise<ApiResult<unknown>>>()
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "internal", message: "Something broke on our side." },
      })
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "network_error", message: "Could not reach the server" },
      });
    setup({}, onRemove);

    fireEvent.click(
      screen.getByRole("button", { name: /Remove from favorites: Anna/ }),
    );
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Something broke on our side. They are still in your favorites.",
    );
    expect(screen.getByRole("status").textContent).toBe("2 mentors");

    fireEvent.click(
      screen.getByRole("button", { name: /Remove from favorites: Anna/ }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "The server did not answer",
      ),
    );
    expect(screen.queryByText(/Something broke/)).toBeNull();
  });
});
