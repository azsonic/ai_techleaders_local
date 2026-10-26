import { describe, expect, it } from "vitest";

import { formatDay, formatTime, validateWindow, warsawNow } from "./windows";

// 12 November 2026, 14:05 in Warsaw (13:05 UTC, winter time).
const now = new Date("2026-11-12T13:05:00Z");

describe("warsawNow", () => {
  it("returns the Warsaw date and time, also across midnight", () => {
    expect(warsawNow(now)).toEqual({ date: "2026-11-12", time: "14:05" });
    expect(warsawNow(new Date("2026-11-12T23:30:00Z"))).toEqual({
      date: "2026-11-13",
      time: "00:30",
    });
  });
});

describe("validateWindow", () => {
  const ok = { date: "2026-11-13", start: "10:00", end: "12:00" };

  it("accepts a window inside the band on a later day", () => {
    expect(validateWindow(ok, now)).toEqual({});
  });

  it("asks for every empty field", () => {
    expect(validateWindow({ date: "", start: "", end: "" }, now)).toEqual({
      date: "Choose a date.",
      start: "Enter a start time.",
      end: "Enter an end time.",
    });
  });

  it("refuses a past date", () => {
    expect(validateWindow({ ...ok, date: "2026-11-11" }, now).date).toBe(
      "Choose today or a later date.",
    );
  });

  it("refuses a start or end outside 10:00 to 22:00", () => {
    expect(validateWindow({ ...ok, start: "09:30" }, now).start).toBe(
      "Start between 10:00 and 22:00.",
    );
    expect(validateWindow({ ...ok, start: "22:00" }, now).start).toBe(
      "Start between 10:00 and 22:00.",
    );
    expect(validateWindow({ ...ok, end: "22:30" }, now).end).toBe(
      "End between 10:00 and 22:00.",
    );
    expect(validateWindow({ ...ok, end: "10:00" }, now).end).toBe(
      "End between 10:00 and 22:00.",
    );
    expect(validateWindow({ ...ok, end: "22:00" }, now)).toEqual({});
  });

  it("refuses a window shorter than 25 minutes, but not when the start is already wrong", () => {
    expect(
      validateWindow({ ...ok, start: "10:00", end: "10:20" }, now).end,
    ).toBe("Make the window at least 25 minutes long.");
    expect(
      validateWindow({ ...ok, start: "10:00", end: "10:25" }, now),
    ).toEqual({});
    expect(
      validateWindow({ ...ok, start: "09:00", end: "09:10" }, now),
    ).toEqual({
      start: "Start between 10:00 and 22:00.",
      end: "End between 10:00 and 22:00.",
    });
  });

  it("does not check the length without a start", () => {
    expect(validateWindow({ ...ok, start: "" }, now)).toEqual({
      start: "Enter a start time.",
    });
  });

  it("refuses a window that has already ended today, and allows one that ends later today", () => {
    const today = { date: "2026-11-12", start: "10:00", end: "12:00" };
    expect(validateWindow(today, now).end).toBe(
      "This window has already ended. Choose a later time.",
    );
    expect(
      validateWindow({ ...today, start: "13:00", end: "16:00" }, now),
    ).toEqual({});
  });
});

describe("formatDay and formatTime", () => {
  it("write a day and a 24-hour time in Warsaw by default", () => {
    expect(formatDay("2026-11-12T17:00:00Z")).toBe("Thu 12 Nov");
    expect(formatTime("2026-11-12T17:00:00Z")).toBe("18:00");
  });

  it("take another zone", () => {
    expect(formatTime("2026-11-12T17:00:00Z", "Europe/London")).toBe("17:00");
    expect(formatDay("2026-11-12T23:30:00Z", "Europe/London")).toBe(
      "Thu 12 Nov",
    );
  });
});
