import { LocalTime } from "../bookings/local-time";
import { TableCell, TableRow } from "../ui/table";

export type AuditEntry = {
  id: string;
  /** When the action was taken, ISO. */
  at: string;
  /** The operator's e-mail. */
  operator: string;
  /** What was done, in words: "Suspended Anna Kowalska". */
  action: string;
  reason: string;
};

/*
 * One logged operator action in the audit table (E05-S03, R13, D29): when, who, what and the reason. Every operator action has all
 * four, so no cell is optional. Long reasons wrap.
 */
export function AuditRow({
  entry,
  zone,
}: {
  entry: AuditEntry;
  zone?: string;
}) {
  return (
    <TableRow data-slot="audit-row">
      <TableCell className="min-w-40">
        <LocalTime iso={entry.at} zone={zone} />
      </TableCell>
      <TableCell className="wrap-anywhere">{entry.operator}</TableCell>
      <TableCell className="min-w-40 font-emphasis wrap-anywhere">
        {entry.action}
      </TableCell>
      <TableCell className="min-w-56 wrap-anywhere">{entry.reason}</TableCell>
    </TableRow>
  );
}
