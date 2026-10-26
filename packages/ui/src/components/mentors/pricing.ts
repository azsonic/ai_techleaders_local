/*
 * Display constants for mentor supply. Prices: R05. Stacks: D07 (TypeScript, React, Python, AI agents).
 * `@devmentor/core` will own these once its mentor schemas exist; until then they live next to the components.
 */
export const PRICE_BOUNDS = {
  25: { min: 90, max: 600 },
  50: { min: 180, max: 1200 },
} as const;

export const STACKS = [
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "python", label: "Python" },
  { value: "ai-agents", label: "AI agents" },
] as const;

export type Stack = (typeof STACKS)[number]["value"];

export const stackLabel = (stack: Stack): string =>
  STACKS.find((entry) => entry.value === stack)?.label ?? stack;

/** Whole zloty, always with the currency: "90 PLN". */
export const formatPln = (amount: number): string => `${amount} PLN`;
