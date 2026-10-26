import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { TableCell, TableRow } from "../ui/table";

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export type Invitation = {
  id: string;
  /** Empty for a bearer link that anyone with it may accept. */
  email?: string;
  status: InvitationStatus;
  /** Formatted expiry, for example "26 Nov". */
  expires: string;
};

const LABEL: Record<InvitationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  revoked: "Revoked",
  expired: "Expired",
};

/*
 * One invitation in the operator table (E01-S01, D23). Pending is the only live status, so it gets the strongest badge;
 * revoked is the only negative one (R01.5). Only a pending invitation can be revoked.
 */
export function InvitationRow({
  invitation,
  onRevoke,
}: {
  invitation: Invitation;
  onRevoke: (id: string) => void;
}) {
  const { id, email, status, expires } = invitation;

  return (
    <TableRow data-slot="invitation-row">
      <TableCell className="min-w-48 wrap-anywhere">
        {email ?? "Anyone with the link"}
      </TableCell>
      <TableCell>
        <Badge
          className="whitespace-nowrap"
          variant={
            status === "pending"
              ? "default"
              : status === "revoked"
                ? "destructive"
                : "secondary"
          }
        >
          {LABEL[status]}
        </Badge>
      </TableCell>
      <TableCell>{expires}</TableCell>
      <TableCell className="text-right">
        {status === "pending" && (
          <Button
            variant="secondary"
            size="dense"
            aria-label={`Revoke invitation for ${email ?? "anyone with the link"}`}
            onClick={() => onRevoke(id)}
          >
            Revoke
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
