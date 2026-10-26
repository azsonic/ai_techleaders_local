"use client";

import { formatPln } from "../mentors/pricing";
import { Field, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

/** One length with its price, for example "25 minutes, 120 PLN". */
export function PriceOption({
  minutes,
  price,
}: {
  minutes: 25 | 50;
  price: number;
}) {
  return (
    <span
      data-slot="price-option"
      className="flex flex-1 items-baseline justify-between gap-within-group"
    >
      <span>{minutes} minutes</span>
      <span className="font-emphasis">{formatPln(price)}</span>
    </span>
  );
}

type Length = "25" | "50";

/*
 * Both prices side by side before a length is chosen (R05, D08). The whole row is the target and the chosen row shows
 * a dot and a heavier border, so the choice is never colour alone.
 */
export function LengthChoice({
  prices,
  value,
  onValueChange,
}: {
  prices: { 25: number; 50: number };
  value?: Length;
  onValueChange?: (value: Length) => void;
}) {
  return (
    <FieldSet>
      <FieldLegend>Session length</FieldLegend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onValueChange?.(next as Length)}
        className="sm:grid-cols-2"
      >
        {([25, 50] as const).map((minutes) => (
          <Field
            key={minutes}
            orientation="horizontal"
            className="items-center rounded-control border border-border p-within-group has-data-checked:border-foreground"
          >
            <RadioGroupItem value={String(minutes)} />
            <FieldLabel className="flex-1">
              <PriceOption minutes={minutes} price={prices[minutes]} />
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
