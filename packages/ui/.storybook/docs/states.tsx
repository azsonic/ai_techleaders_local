import type { ReactNode } from "react";

export type PreviewState =
  "default" | "hover" | "focus" | "pressed" | "disabled" | "loading" | "error";

type Column = { state: PreviewState; label: string };

const COLUMNS: Column[] = [
  { state: "default", label: "Default" },
  { state: "hover", label: "Hover" },
  { state: "focus", label: "Focus" },
  { state: "pressed", label: "Pressed" },
  { state: "disabled", label: "Disabled" },
  { state: "loading", label: "Loading" },
  { state: "error", label: "Error" },
];

/**
 * State matrix for the documentation. Hover, focus and pressed are frozen with data-preview-state
 * (see preview.css); disabled, loading and error use the component's real props.
 * `render` receives the props to spread on the component under test.
 */
export const StateMatrix = ({
  rows,
  states,
  render,
}: {
  rows: string[];
  states: PreviewState[];
  render: (row: string, state: PreviewState) => ReactNode;
}) => (
  <div
    role="region"
    aria-label="State matrix"
    tabIndex={0}
    className="overflow-x-auto"
  >
    <table className="border-collapse text-interface">
      <thead>
        <tr className="text-left">
          <th scope="col" className="p-within-group font-emphasis">
            Variant
          </th>
          {COLUMNS.filter((c) => states.includes(c.state)).map((c) => (
            <th
              key={c.state}
              scope="col"
              className="p-within-group font-emphasis"
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row} className="border-t border-border">
            <th
              scope="row"
              className="p-within-group text-left font-body text-muted-foreground"
            >
              {row}
            </th>
            {COLUMNS.filter((c) => states.includes(c.state)).map((c) => (
              <td key={c.state} className="p-within-group align-middle">
                {render(row, c.state)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Props that freeze hover, focus or pressed on a component that spreads rest props to its root. */
export const frozen = (state: PreviewState) =>
  state === "hover" || state === "focus" || state === "pressed"
    ? { "data-preview-state": state }
    : {};

/** A pair of real examples with a one-sentence reason each. */
export const GoodBad = ({
  good,
  goodWhy,
  bad,
  badWhy,
}: {
  good: ReactNode;
  goodWhy: string;
  bad: ReactNode;
  badWhy: string;
}) => (
  <div className="grid gap-between-groups sm:grid-cols-2">
    <figure className="flex min-w-0 flex-col gap-within-group border border-border bg-card p-panel">
      <figcaption className="text-interface font-emphasis">Do</figcaption>
      <div>{good}</div>
      <p className="text-interface text-muted-foreground">{goodWhy}</p>
    </figure>
    <figure className="flex min-w-0 flex-col gap-within-group border border-border bg-card p-panel">
      <figcaption className="text-interface font-emphasis">
        Don&apos;t
      </figcaption>
      <div>{bad}</div>
      <p className="text-interface text-muted-foreground">{badWhy}</p>
    </figure>
  </div>
);
