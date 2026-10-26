"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const serverZone = () => "UTC";

/**
 * The zone a time is shown in. An explicit `zone` wins. Otherwise it is the browser's zone; on the server and during
 * hydration it is UTC, so both renders match and nothing hydrates wrongly (E02 spec).
 */
export function useViewerZone(zone?: string): string {
  const viewer = useSyncExternalStore(subscribe, browserZone, serverZone);
  return zone ?? viewer;
}
