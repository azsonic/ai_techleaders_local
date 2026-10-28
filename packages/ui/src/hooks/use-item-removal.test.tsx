import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ApiResult } from "@devmentor/core";

import { ToastProvider } from "../components/ui/toast";
import { OFFLINE_MESSAGE, useItemRemoval } from "./use-item-removal";

type Item = { id: string; name: string };
const a: Item = { id: "a", name: "Alpha" };
const b: Item = { id: "b", name: "Beta" };
const ok: ApiResult<unknown> = { ok: true, data: null };

const Harness = ({
  items,
  onRemove,
}: {
  items: Item[] | undefined;
  onRemove: (id: string) => Promise<ApiResult<unknown>>;
}) => {
  const { areaProps, removing, failure, remove } = useItemRemoval({
    items,
    onRemove,
    toast: (item) => ({
      title: `${item.name} removed`,
      description: "Back soon.",
    }),
  });
  return (
    <div {...areaProps} data-testid="area">
      {failure && <p role="alert">{failure}</p>}
      {items?.map((item) => (
        <div key={item.id}>
          <h2>
            <a href={`/${item.id}`}>{item.name}</a>
          </h2>
          <button type="button" onClick={() => remove(item)}>
            {removing.includes(item.id) ? "Removing" : `Remove ${item.name}`}
          </button>
        </div>
      ))}
    </div>
  );
};

const setup = (
  onRemove: (id: string) => Promise<ApiResult<unknown>>,
  items = [a, b],
) => {
  const view = (list: Item[] | undefined) => (
    <ToastProvider>
      <Harness items={list} onRemove={onRemove} />
    </ToastProvider>
  );
  const utils = render(view(items));
  return { rerender: (list: Item[] | undefined) => utils.rerender(view(list)) };
};

describe("useItemRemoval", () => {
  it("marks only the acted-on item as removing, then toasts and focuses the item that took its place", async () => {
    let resolve: (value: ApiResult<unknown>) => void = () => undefined;
    const onRemove = vi.fn(
      () => new Promise<ApiResult<unknown>>((r) => (resolve = r)),
    );
    const { rerender } = setup(onRemove);

    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(screen.getByRole("button", { name: "Removing" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove Beta" })).toBeTruthy();

    await act(async () => resolve(ok));
    rerender([b]);

    expect(await screen.findByText("Alpha removed")).toBeTruthy();
    expect(screen.getByText("Back soon.")).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("link", { name: "Beta" }),
      ),
    );
  });

  it("focuses the list area when the last item was removed", async () => {
    const { rerender } = setup(
      vi.fn(async () => ok),
      [a],
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    await screen.findByText("Alpha removed");
    rerender([]);

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId("area")),
    );
  });

  it("waits for the list to shrink before moving focus, and ignores a list that failed to load", async () => {
    const { rerender } = setup(vi.fn(async () => ok));

    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    await screen.findByText("Alpha removed");
    expect(document.activeElement).toBe(document.body);

    rerender(undefined);
    expect(document.activeElement).toBe(document.body);
  });

  it("keeps the item and offers the server's words, then the offline words, and clears them on each try", async () => {
    const onRemove = vi
      .fn<(id: string) => Promise<ApiResult<unknown>>>()
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "internal", message: "Something broke." },
      })
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "network_error", message: "Could not reach the server" },
      });
    setup(onRemove);

    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Something broke.",
    );
    expect(screen.getByRole("button", { name: "Remove Alpha" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(OFFLINE_MESSAGE),
    );
  });
});
