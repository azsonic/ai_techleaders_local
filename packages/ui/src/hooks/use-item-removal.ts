"use client";

import { useEffect, useRef, useState } from "react";

import type { ApiResult } from "@devmentor/core";

import { useToast } from "../components/ui/toast";

/** What the person reads when the server did not answer (code `network_error` from `apiCall`). */
export const OFFLINE_MESSAGE =
  "The server did not answer. Check your connection and try again.";

/**
 * The behavior of removing an item from a list the person can restore it to (Filtered list rules 10 to 13):
 * only the acted-on item is pending, the item goes after the server answered, a toast names it, a failure stays
 * as a message the page shows in an alert, and focus moves to the item that took its place (or to the list area
 * when none is left). `onRemove` resolves with the API envelope and never rejects.
 *
 * Put `areaProps` on the element that wraps the list; item headings are `h2` with the link inside.
 */
export function useItemRemoval<Item extends { id: string }>({
  items,
  onRemove,
  toast: toastFor,
}: {
  items: Item[] | undefined;
  onRemove: (id: string) => Promise<ApiResult<unknown>>;
  /** The confirmation after the server removed the item: who was removed, and where to find them again. */
  toast: (item: Item) => { title: string; description?: string };
}) {
  const toast = useToast();
  const [removing, setRemoving] = useState<string[]>([]);
  const [failure, setFailure] = useState<string | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<{ index: number; count: number } | null>(null);
  const [removed, setRemoved] = useState(0);

  // Once the list has shrunk after a removal, focus the item that took its place, else the list area.
  // `removed` re-runs this when the list was already updated before `onRemove` resolved.
  useEffect(() => {
    const target = focusTarget.current;
    if (!target || !items || items.length >= target.count) return;
    const area = areaRef.current as HTMLDivElement;
    const links = area.querySelectorAll<HTMLElement>("h2 a");
    (links[Math.min(target.index, links.length - 1)] ?? area).focus();
    focusTarget.current = null;
  }, [items, removed]);

  const remove = async (item: Item) => {
    const index = (items as Item[]).indexOf(item);
    setRemoving((current) => [...current, item.id]);
    setFailure(null);
    const result = await onRemove(item.id);
    setRemoving((current) => current.filter((id) => id !== item.id));
    if (result.ok) {
      focusTarget.current = { index, count: (items as Item[]).length };
      setRemoved((count) => count + 1);
      toast.add(toastFor(item));
    } else {
      setFailure(
        result.error.code === "network_error"
          ? OFFLINE_MESSAGE
          : result.error.message,
      );
    }
  };

  return {
    /** Spread on the element that wraps the list. */
    areaProps: { ref: areaRef, tabIndex: -1, className: "focus-ring" },
    /** Ids of the items being removed right now. */
    removing,
    /** The message to show in an alert, or null. Cleared by the next attempt. */
    failure,
    remove,
  };
}
