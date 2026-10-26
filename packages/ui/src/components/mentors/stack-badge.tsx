import { Badge } from "../ui/badge";
import { stackLabel, type Stack } from "./pricing";

/** One stack a mentor covers (D07). The name is always written out; there is no icon or color per stack. */
export function StackBadge({ stack }: { stack: Stack }) {
  return (
    <Badge variant="secondary" data-slot="stack-badge">
      {stackLabel(stack)}
    </Badge>
  );
}
