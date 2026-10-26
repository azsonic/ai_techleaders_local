import { describe, expect, it } from "vitest";

import { COMMISSION_PERCENT, formatGrosze, splitPrice } from "./payout";

describe("splitPrice", () => {
  it("takes 20% commission out of the mentor's price, in grosze", () => {
    expect(COMMISSION_PERCENT).toBe(20);
    expect(splitPrice(120)).toEqual({ commission: 2400, payout: 9600 });
    expect(splitPrice(93)).toEqual({ commission: 1860, payout: 7440 });
  });
});

describe("formatGrosze", () => {
  it("drops the grosze for whole zloty and keeps two digits otherwise", () => {
    expect(formatGrosze(9600)).toBe("96 PLN");
    expect(formatGrosze(7440)).toBe("74.40 PLN");
    expect(formatGrosze(1860)).toBe("18.60 PLN");
  });
});
