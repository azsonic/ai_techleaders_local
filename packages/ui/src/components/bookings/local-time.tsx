"use client";

import { useViewerZone } from "../../hooks/use-viewer-zone";
import { formatDay, formatTime } from "../availability/windows";

/** Short zone name at that moment, for example "CET" or "UTC". */
export const zoneName = (iso: string, zone: string): string =>
  (
    new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "short" })
      .formatToParts(new Date(iso))
      .find((part) => part.type === "timeZoneName") as Intl.DateTimeFormatPart
  ).value;

/** "Fri 13 Nov, 10:00 CET": day, 24-hour time and the zone name, so a time is never ambiguous. */
export const formatMoment = (iso: string, zone: string): string =>
  `${formatDay(iso, zone)}, ${formatTime(iso, zone)} ${zoneName(iso, zone)}`;

/*
 * A moment in the viewer's own zone with the zone written out (E02 spec, Q3). Pass `zone` to pin it, for example
 * Europe/Warsaw where the hours limit is stated. The machine value stays in `dateTime`.
 */
export function LocalTime({
  iso,
  zone,
  className,
}: {
  iso: string;
  zone?: string;
  className?: string;
}) {
  const resolved = useViewerZone(zone);

  return (
    <time data-slot="local-time" dateTime={iso} className={className}>
      {formatMoment(iso, resolved)}
    </time>
  );
}
