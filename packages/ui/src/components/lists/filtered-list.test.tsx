import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilteredList } from "./filtered-list";

type Item = { id: string; name: string };
const items: Item[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
];
const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
] as const;

const renderList = (
  props: Partial<Parameters<typeof FilteredList<Item, "one" | "two">>[0]> = {},
) => {
  const onSelectedChange = vi.fn();
  render(
    <FilteredList<Item, "one" | "two">
      items={items}
      renderItem={(item) => <span>{item.name}</span>}
      filter={{ legend: "Kind", options }}
      selected={[]}
      onSelectedChange={onSelectedChange}
      noun={{ singular: "thing", plural: "things" }}
      skeleton={<p>placeholder</p>}
      loadingLabel="Loading things…"
      errorTitle="Things did not load"
      noResults={{ title: "No things match", description: "Remove a filter." }}
      nothingYet={{ title: "No things yet", description: "Add one." }}
      {...props}
    />,
  );
  return onSelectedChange;
};

describe("FilteredList", () => {
  it("lists items with a count that is announced, plural and singular", () => {
    renderList();
    expect(screen.getByRole("status").textContent).toBe("2 things");
    expect(screen.getByText("Alpha")).toBeTruthy();
  });

  it("uses the singular for one item", () => {
    renderList({ items: [items[0]] });
    expect(screen.getByRole("status").textContent).toBe("1 thing");
  });

  it("adds and removes a filter, and offers a clear action only while one is set", () => {
    const onSelectedChange = renderList({ selected: ["two"] });

    fireEvent.click(screen.getByRole("checkbox", { name: "One" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(["two", "one"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Two" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
  });

  it("offers no clear action without a filter", () => {
    renderList();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  it("shows the notice above the filters", () => {
    renderList({ notice: <p>Heads up</p> });
    expect(screen.getByText("Heads up")).toBeTruthy();
  });

  it("shows the skeleton and a loading message while loading, and nothing else", () => {
    renderList({ items: undefined, loading: true });
    expect(screen.getByText("Loading things…")).toBeTruthy();
    expect(screen.getByText("placeholder")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows the error with a retry, and without one when none is given", () => {
    const onRetry = vi.fn();
    renderList({ items: undefined, error: true, onRetry });
    expect(screen.getByRole("alert").textContent).toContain(
      "Things did not load",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("says what is safe in its own words when the error message is given", () => {
    renderList({
      items: undefined,
      error: true,
      errorMessage: "Your things are safe. Try again.",
    });
    expect(screen.getByRole("alert").textContent).toContain(
      "Your things are safe. Try again.",
    );
    expect(screen.queryByText("Nothing was changed. Try again.")).toBeNull();
  });

  it("treats missing items as an error even without the flag", () => {
    renderList({ items: undefined });
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("shows a different empty state for filters that match nothing, with a clear action", () => {
    const onSelectedChange = renderList({ items: [], selected: ["one"] });
    expect(screen.getByText("No things match")).toBeTruthy();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Clear filters" })[1],
    );
    expect(onSelectedChange).toHaveBeenCalledWith([]);
  });

  it("shows nothing-yet with its action when no filter is set", () => {
    renderList({
      items: [],
      nothingYet: {
        title: "No things yet",
        description: "Add one.",
        action: <a href="/new">Add</a>,
      },
    });
    expect(screen.getByText("No things yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Add" })).toBeTruthy();
    expect(screen.queryByText("No things match")).toBeNull();
  });
});
