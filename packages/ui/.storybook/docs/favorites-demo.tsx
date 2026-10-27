import { useState } from "react";

import type { ApiResult } from "@devmentor/core";
import {
  FavoriteMentors,
  type FavoriteMentor,
} from "@devmentor/ui/components/favorites/favorite-mentors";
import { ToastProvider } from "@devmentor/ui/components/ui/toast";
import type { Stack } from "../../src/components/mentors/pricing";

type RemoveMode = "ok" | "pending" | "server-error" | "offline";

/* Filters and removes on the client for the story; in the application the server does both. */
export const FavoritesDemo = ({
  all,
  initial = [],
  remove = "ok",
  ...rest
}: Omit<
  React.ComponentProps<typeof FavoriteMentors>,
  "mentors" | "selected" | "onSelectedChange" | "onRemove"
> & {
  all: FavoriteMentor[] | undefined;
  initial?: Stack[];
  remove?: RemoveMode;
}) => {
  const [saved, setSaved] = useState(all);
  const [selected, setSelected] = useState<Stack[]>(initial);
  const mentors =
    saved &&
    (selected.length
      ? saved.filter((m) => m.stacks.some((s) => selected.includes(s)))
      : saved);

  const onRemove = async (id: string): Promise<ApiResult<unknown>> => {
    if (remove === "pending") return new Promise(() => undefined);
    if (remove === "server-error")
      return {
        ok: false,
        error: { code: "internal", message: "Something broke on our side." },
      };
    if (remove === "offline")
      return {
        ok: false,
        error: { code: "network_error", message: "Could not reach the server" },
      };
    setSaved((current) => current?.filter((m) => m.id !== id));
    return { ok: true, data: null };
  };

  return (
    <ToastProvider>
      <FavoriteMentors
        {...rest}
        mentors={mentors}
        selected={selected}
        onSelectedChange={setSelected}
        onRemove={onRemove}
      />
    </ToastProvider>
  );
};
