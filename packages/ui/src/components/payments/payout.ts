/*
 * What a mentor receives for one session: the price minus the platform commission (R05, D08). Prices are whole
 * zloty, so 20% is always a whole number of grosze and nothing is rounded.
 */
export const COMMISSION_PERCENT = 20;

export type PayoutSplit = { commission: number; payout: number };

/** Both amounts in grosze, so no floating-point arithmetic touches money. */
export const splitPrice = (pricePln: number): PayoutSplit => {
  const commission = pricePln * COMMISSION_PERCENT;
  return { commission, payout: pricePln * 100 - commission };
};

/** "90 PLN" for whole zloty, "74.40 PLN" otherwise. Takes grosze. */
export const formatGrosze = (grosze: number): string =>
  grosze % 100 === 0
    ? `${grosze / 100} PLN`
    : `${(grosze / 100).toFixed(2)} PLN`;
