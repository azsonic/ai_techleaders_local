import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MentorDirectory, type DirectoryMentor } from "./mentor-directory";

const anna: DirectoryMentor = {
  id: "a",
  displayName: "Anna Kowalska",
  stacks: ["typescript"],
  priceFrom: 90,
  nearestSlot: "Fri 13 Nov, 10:00",
  href: "/mentors/anna",
};
const piotr: DirectoryMentor = {
  id: "p",
  displayName: "Piotr Nowak",
  stacks: ["python"],
  priceFrom: null,
  nearestSlot: null,
  href: "/mentors/piotr",
};

const renderDirectory = (
  props: Partial<Parameters<typeof MentorDirectory>[0]> = {},
) => {
  const onSelectedChange = vi.fn();
  render(
    <MentorDirectory
      mentors={[anna, piotr]}
      selected={[]}
      onSelectedChange={onSelectedChange}
      {...props}
    />,
  );
  return onSelectedChange;
};

describe("MentorDirectory", () => {
  it("lists mentors with a count that is announced", () => {
    renderDirectory();

    expect(screen.getByRole("status").textContent).toBe("2 mentors");
    expect(screen.getByRole("link", { name: "Anna Kowalska" })).toBeTruthy();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(2);
  });

  it("uses the singular for one mentor", () => {
    renderDirectory({ mentors: [anna] });

    expect(screen.getByRole("status").textContent).toBe("1 mentor");
  });

  it("adds and removes a stack filter", () => {
    const onSelectedChange = renderDirectory({ selected: ["python"] });

    fireEvent.click(screen.getByRole("checkbox", { name: "TypeScript" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(["python", "typescript"]);

    fireEvent.click(screen.getByRole("checkbox", { name: "Python" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
  });

  it("clears filters from the link-style button, shown only while a filter is set", () => {
    const onSelectedChange = renderDirectory({ selected: ["python"] });

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onSelectedChange).toHaveBeenCalledWith([]);
  });

  it("offers no clear action without a filter", () => {
    renderDirectory();

    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  it("shows a different empty state for filters that match nothing, with a clear action", () => {
    const onSelectedChange = renderDirectory({
      mentors: [],
      selected: ["ai-agents"],
    });

    expect(screen.getByText("No mentors for these filters")).toBeTruthy();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Clear filters" })[1],
    );
    expect(onSelectedChange).toHaveBeenCalledWith([]);
  });

  it("shows 'nothing here yet' when no mentor is listed and no filter is set", () => {
    renderDirectory({ mentors: [] });

    expect(screen.getByText("No mentors are listed yet")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  it("announces loading and shows no list", () => {
    renderDirectory({ mentors: undefined, loading: true });

    expect(screen.getByRole("status").textContent).toBe("Loading mentors…");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("offers a retry on error, or none when no handler is given, and treats a missing list as an error", () => {
    const onRetry = vi.fn();
    const { unmount } = render(
      <MentorDirectory
        mentors={undefined}
        error
        selected={[]}
        onSelectedChange={vi.fn()}
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    unmount();

    render(
      <MentorDirectory
        mentors={undefined}
        selected={[]}
        onSelectedChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Mentors did not load",
    );
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("shows the closed-booking notice above the list when booking is closed", () => {
    renderDirectory({ bookingClosed: true });

    expect(screen.getByText("Booking opens soon")).toBeTruthy();
    expect(screen.getByText("Anna Kowalska")).toBeTruthy();
  });
});
