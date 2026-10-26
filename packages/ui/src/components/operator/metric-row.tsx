/*
 * One measure on the operator's metrics page (E05-S02, D11, D19, D20): the name, the value and, in a line below, how it is
 * counted. Used inside a `dl`; the name, the value and the detail are a `dt` and its `dd`s, read in that order. A measure
 * with no data says "No data yet" instead of 0, because 0 would be a claim (P10.1).
 */
export function MetricRow({
  label,
  value,
  detail,
}: {
  label: string;
  /** Formatted by the caller, for example "3 h 10 min" or "7 of 10". Omit when there is no data. */
  value?: string;
  /** How the number is counted, one sentence. */
  detail?: string;
}) {
  return (
    <div
      data-slot="metric-row"
      className="grid gap-x-between-groups gap-y-inline border-b border-border py-between-groups text-interface sm:grid-cols-[1fr_auto]"
    >
      <dt className="font-emphasis sm:col-start-1 sm:row-start-1">{label}</dt>
      <dd
        className={
          value
            ? "text-heading-section font-emphasis tabular-nums sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:text-right"
            : "text-muted-foreground sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:text-right"
        }
      >
        {value ?? "No data yet"}
      </dd>
      {detail && (
        <dd className="text-muted-foreground sm:col-start-1 sm:row-start-2">
          {detail}
        </dd>
      )}
    </div>
  );
}
