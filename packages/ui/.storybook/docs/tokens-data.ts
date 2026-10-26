// Documentation data for the Foundations pages. Provenance IDs refer to lekcja-06/referencje.md.
export type Role = { token: string; purpose: string; source: string };

export const colorRoles: { group: string; roles: Role[] }[] = [
  {
    group: "Surfaces",
    roles: [
      { token: "--background", purpose: "Page canvas", source: "R01.4, A01.1" },
      {
        token: "--card",
        purpose: "Opaque panels and composer",
        source: "R01.4, A01.2",
      },
      {
        token: "--muted",
        purpose: "Supporting surface",
        source: "R01.4, R01.5",
      },
      {
        token: "--popover",
        purpose: "Opaque popovers and menus",
        source: "A01.2",
      },
      { token: "--sidebar", purpose: "Navigation surface", source: "R02.6" },
    ],
  },
  {
    group: "Text",
    roles: [
      { token: "--foreground", purpose: "Main text", source: "R01.5, R02.3" },
      {
        token: "--muted-foreground",
        purpose: "Timestamps, metadata, secondary descriptions",
        source: "R01.5, R02.3",
      },
      {
        token: "--destructive",
        purpose: "Error text and destructive action fill",
        source: "P12.1, P12.2",
      },
    ],
  },
  {
    group: "Actions",
    roles: [
      {
        token: "--primary",
        purpose: "Main action fill, links, meaningful icons",
        source: "R01.5",
      },
      {
        token: "--primary-hover",
        purpose: "Opaque hover and pressed fill",
        source: "R01.5, P11.1",
      },
      {
        token: "--secondary",
        purpose: "Secondary control fill",
        source: "R01.5, R02.6",
      },
      {
        token: "--accent",
        purpose: "Interaction surface (hover on rows, menu items)",
        source: "R01.5, R02.6",
      },
    ],
  },
  {
    group: "Lines and focus",
    roles: [
      {
        token: "--border",
        purpose: "Dividers and control boundaries, full opacity",
        source: "R01.3, R01.5",
      },
      {
        token: "--input",
        purpose: "Form control boundary",
        source: "R01.3, R01.5",
      },
      {
        token: "--ring",
        purpose: "Focus indicator, full opacity",
        source: "R01.5, P11.1",
      },
    ],
  },
];

export const spacingRoles = [
  {
    token: "--space-inline",
    px: 4,
    level: "Tightly related inline items (icon and label, author and time)",
    source: "R02.3",
  },
  {
    token: "--space-within-group",
    px: 8,
    level: "Items within one group (label and field, badge and text)",
    source: "R01.1, R02.3",
  },
  {
    token: "--space-between-groups",
    px: 16,
    level: "Separate groups (field to field, row to row)",
    source: "R01.1, P03",
  },
  {
    token: "--space-panel",
    px: 16,
    level: "Inside normal panels",
    source: "R01.1, A01.2",
  },
  {
    token: "--space-panel-compact",
    px: 12,
    level: "Inside compact browsing panels (mentor cards, booking rows)",
    source: "R01.1",
  },
  {
    token: "--space-section",
    px: 32,
    level: "Between major task sections",
    source: "P03",
  },
  {
    token: "--space-page-inline",
    px: 24,
    level: "Page content inset left and right",
    source: "P03",
  },
];
