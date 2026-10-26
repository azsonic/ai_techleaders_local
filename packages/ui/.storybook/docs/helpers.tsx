import {
  CalendarDays,
  Check,
  Clock,
  Link2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { colorRoles, spacingRoles } from "./tokens-data";

/** Reads the actual sRGB value the browser paints for a CSS colour, through a canvas. */
const toRgb = (colour: string): [number, number, number] => {
  const ctx = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "black";
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
};

const luminance = ([r, g, b]: [number, number, number]) => {
  const lin = (v: number) =>
    v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

export const contrastRatio = (fg: string, bg: string) => {
  const [hi, lo] = [luminance(toRgb(fg)), luminance(toRgb(bg))].sort(
    (a, b) => b - a,
  );
  return (hi + 0.05) / (lo + 0.05);
};

const PAIRS: [string, string, number, string][] = [
  ["--foreground", "--background", 4.5, "Main text on the page"],
  ["--foreground", "--card", 4.5, "Main text on panels"],
  ["--foreground", "--muted", 4.5, "Main text on supporting surfaces"],
  ["--muted-foreground", "--background", 4.5, "Metadata on the page"],
  ["--muted-foreground", "--card", 4.5, "Metadata on panels"],
  ["--muted-foreground", "--muted", 4.5, "Metadata on supporting surfaces"],
  ["--primary", "--background", 4.5, "Links and meaningful icons on the page"],
  ["--primary", "--card", 4.5, "Links and icons on panels"],
  ["--primary", "--muted", 4.5, "Links and icons on supporting surfaces"],
  ["--destructive", "--background", 4.5, "Error text on the page"],
  ["--destructive", "--card", 4.5, "Error text on panels"],
  ["--destructive", "--muted", 4.5, "Error text on supporting surfaces"],
  ["--border", "--background", 3, "Control boundary on the page"],
  ["--border", "--card", 3, "Control boundary on panels"],
  ["--border", "--muted", 3, "Control boundary on supporting surfaces"],
  ["--ring", "--background", 3, "Focus indicator on the page"],
  ["--ring", "--card", 3, "Focus indicator on panels"],
  ["--ring", "--muted", 3, "Focus indicator on supporting surfaces"],
  ["--primary-foreground", "--primary", 4.5, "Label on primary button"],
  [
    "--primary-foreground",
    "--primary-hover",
    4.5,
    "Label on primary button, hover",
  ],
  [
    "--destructive-foreground",
    "--destructive",
    4.5,
    "Label on destructive button",
  ],
  [
    "--destructive-foreground",
    "--destructive-hover",
    4.5,
    "Label on destructive button, hover",
  ],
];

/** Keyboard-focusable scroll container for wide tables (WCAG 2.1.1). */
const ScrollRegion = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div
    role="region"
    aria-label={label}
    tabIndex={0}
    className="overflow-x-auto"
  >
    {children}
  </div>
);

/** Wrapper that applies one theme to its subtree: `.dark` redefines the tokens for descendants. */
export const ThemeScope = ({
  theme,
  children,
  className = "",
}: {
  theme: "light" | "dark";
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`${theme} bg-background text-foreground ${className}`}
    data-theme-scope={theme}
  >
    {children}
  </div>
);

type Row = {
  fg: string;
  bg: string;
  min: number;
  use: string;
  light: number;
  dark: number;
};

export const ContrastTable = () => {
  const probe = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const scopes =
      probe.current!.querySelectorAll<HTMLElement>("[data-theme-scope]");
    const [light, dark] = [scopes[0], scopes[1]];
    const value = (el: HTMLElement, token: string) =>
      getComputedStyle(el).getPropertyValue(token).trim();
    const colour = (el: HTMLElement, token: string) => {
      const swatch = document.createElement("span");
      swatch.style.color = `var(${token})`;
      el.appendChild(swatch);
      const resolved = getComputedStyle(swatch).color;
      swatch.remove();
      return resolved || value(el, token);
    };
    setRows(
      PAIRS.map(([fg, bg, min, use]) => ({
        fg,
        bg,
        min,
        use,
        light: contrastRatio(colour(light, fg), colour(light, bg)),
        dark: contrastRatio(colour(dark, fg), colour(dark, bg)),
      })),
    );
  }, []);

  const cell = (ratio: number, min: number) => (
    <td className="p-within-group text-right tabular-nums">
      {ratio.toFixed(2)}:1{" "}
      <strong className="font-emphasis">
        {ratio >= min ? "pass" : "fail"}
      </strong>
    </td>
  );

  return (
    <div ref={probe}>
      <div hidden>
        <ThemeScope theme="light">.</ThemeScope>
        <ThemeScope theme="dark">.</ThemeScope>
      </div>
      <ScrollRegion label="Contrast measurements">
        <table
          className="w-full border-collapse text-interface"
          data-testid="contrast-table"
        >
          <caption className="p-within-group text-left text-muted-foreground">
            Measured from the values the browser paints, in both themes. Text
            needs 4.5:1, interface elements 3:1.
          </caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-within-group">Foreground on background</th>
              <th className="p-within-group">Used for</th>
              <th className="p-within-group text-right">Minimum</th>
              <th className="p-within-group text-right">Light</th>
              <th className="p-within-group text-right">Dark</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.fg}-${r.bg}`} className="border-b border-border">
                <td className="p-within-group font-code">
                  {r.fg} on {r.bg}
                </td>
                <td className="p-within-group">{r.use}</td>
                <td className="p-within-group text-right tabular-nums">
                  {r.min}:1
                </td>
                {cell(r.light, r.min)}
                {cell(r.dark, r.min)}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
    </div>
  );
};

export const ColorRoles = () => (
  <div className="flex flex-col gap-section">
    {colorRoles.map(({ group, roles }) => (
      <section
        key={group}
        aria-labelledby={`roles-${group}`}
        className="flex flex-col gap-within-group"
      >
        <h3 id={`roles-${group}`} className="font-emphasis">
          {group}
        </h3>
        <ul className="grid gap-between-groups sm:grid-cols-2">
          {roles.map((r) => (
            <li
              key={r.token}
              className="flex items-center gap-between-groups border border-border bg-card p-panel-compact"
            >
              <span
                aria-hidden
                className="size-10 shrink-0 border border-border"
                style={{ background: `var(${r.token})` }}
              />
              <span className="flex flex-col">
                <code className="font-code">{r.token}</code>
                <span>{r.purpose}</span>
                <span className="text-muted-foreground">
                  Source: {r.source}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export const SpacingScale = () => (
  <ScrollRegion label="Spacing tokens">
    <table className="w-full border-collapse text-interface">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="p-within-group">Token</th>
          <th className="p-within-group">Size</th>
          <th className="p-within-group">Preview</th>
          <th className="p-within-group">Use for</th>
          <th className="p-within-group">Source</th>
        </tr>
      </thead>
      <tbody>
        {spacingRoles.map((s) => (
          <tr key={s.token} className="border-b border-border">
            <td className="p-within-group font-code">{s.token}</td>
            <td className="p-within-group tabular-nums">{s.px}px</td>
            <td className="p-within-group">
              <span
                aria-hidden
                className="block h-3 bg-primary"
                style={{ width: `var(${s.token})` }}
              />
            </td>
            <td className="p-within-group">{s.level}</td>
            <td className="p-within-group">{s.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </ScrollRegion>
);

const typeRoles = [
  {
    role: "Page heading",
    cls: "text-heading-page font-emphasis",
    sample: "Mentors for TypeScript",
    note: "Approved proposal, no reference source",
  },
  {
    role: "Section heading",
    cls: "text-heading-section font-emphasis",
    sample: "Available slots",
    note: "Approved proposal, no reference source",
  },
  {
    role: "Body (conversation, answers)",
    cls: "text-conversation font-body",
    sample:
      "Try pinning the version first, then check whether the lockfile changed.",
    note: "R02.1; at most about 65 characters per line",
  },
  {
    role: "Label and interface text",
    cls: "text-interface font-emphasis",
    sample: "Question for the mentor",
    note: "R01.1, R01.5",
  },
  {
    role: "Metadata",
    cls: "text-interface font-body text-muted-foreground",
    sample: "Anna K. · 14:25",
    note: "R02.3",
  },
  {
    role: "Numbers",
    cls: "text-interface font-body tabular-nums",
    sample: "from 90 PLN · 25 min",
    note: "Approved proposal, no reference source",
  },
  {
    role: "Code and filenames",
    cls: "text-interface font-code",
    sample: "package-lock.json",
    note: "R01.2, P09.2",
  },
];

export const TypeRoles = () => (
  <div className="flex flex-col">
    {typeRoles.map((t) => (
      <div
        key={t.role}
        className="grid gap-within-group border-b border-border py-between-groups sm:grid-cols-[14rem_1fr]"
      >
        <div className="text-interface">
          <div className="font-emphasis">{t.role}</div>
          <div className="text-muted-foreground">{t.note}</div>
        </div>
        <p className={`${t.cls} max-w-prose`}>{t.sample}</p>
      </div>
    ))}
  </div>
);

export const RadiusScale = () => (
  <ul className="flex flex-wrap gap-between-groups">
    {[
      ["rounded-sm", "--radius-sm"],
      ["rounded-md", "--radius-md"],
      ["rounded-lg", "--radius-lg"],
      ["rounded-xl", "--radius-xl"],
    ].map(([cls, token]) => (
      <li
        key={cls}
        className="flex flex-col items-start gap-within-group text-interface"
      >
        <span
          aria-hidden
          className={`${cls} size-16 border border-border bg-card`}
        />
        <code className="font-code">{token}</code>
      </li>
    ))}
  </ul>
);

export const ThemePair = ({ children }: { children: ReactNode }) => (
  <div className="grid gap-between-groups sm:grid-cols-2">
    {(["light", "dark"] as const).map((theme) => (
      <ThemeScope
        key={theme}
        theme={theme}
        className="flex flex-col gap-within-group border border-border p-panel"
      >
        <span className="text-interface text-muted-foreground">
          {theme === "dark" ? "Dark" : "Light"}
        </span>
        {children}
      </ThemeScope>
    ))}
  </div>
);

export const IconSamples = () => (
  <ul className="flex flex-wrap gap-between-groups text-interface">
    {[
      ["Clock", Clock, "Time of a slot"],
      ["CalendarDays", CalendarDays, "Date"],
      ["Link2", Link2, "Share link"],
      ["Check", Check, "Done, with text"],
      ["X", X, "Close, with accessible name"],
      ["TriangleAlert", TriangleAlert, "Warning, with text"],
    ].map(([name, Icon, use]) => {
      const I = Icon as typeof Clock;
      return (
        <li
          key={name as string}
          className="flex w-40 flex-col gap-within-group border border-border bg-card p-panel-compact"
        >
          <I aria-hidden className="size-4" />
          <code className="font-code">{name as string}</code>
          <span className="text-muted-foreground">{use as string}</span>
        </li>
      );
    })}
  </ul>
);
