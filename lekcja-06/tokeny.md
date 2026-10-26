# Tokens: DevMentor

Date: 2026-10-25. Status: approved by the Product owner in this conversation.

Source decisions: [references](referencje.md). Existing token source: [packages/ui/src/styles/globals.css](../packages/ui/src/styles/globals.css). The requested `packages/ui/src/tokens.css` does not exist. Existing font aliases come from [the app globals](../packages/app/src/app/globals.css), backed by Geist and Geist Mono loaded in [the root layout](../packages/app/src/app/layout.tsx).

This is the approved token proposal and usage contract, saved as documentation. It does not change application CSS or implement the component adaptations below. Existing semantic names are retained, the installed Tailwind stone palette supplies warm grays, and the existing Geist fonts are retained. Values initially proposed in the table were accepted by the Product owner; “proposed” in provenance records their origin.

In the table, **L / D** means light/dark. `S100` means `var(--color-stone-100)`; `R700` means `var(--color-red-700)`. Raw tokens are referenced only inside the token file; components consume semantic or component tokens. Pixel equivalents assume a 16px root size; spacing and typography use the listed rem-based values.

| token | layer | value | provenance | where to use | where not to use |
|---|---|---|---|---|---|
| `--color-stone-50` | raw (existing) | `oklch(98.5% 0.001 106.423)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-100` | raw (existing) | `oklch(97% 0.001 106.424)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-200` | raw (existing) | `oklch(92.3% 0.003 48.717)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-300` | raw (existing) | `oklch(86.9% 0.005 56.366)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-400` | raw (existing) | `oklch(70.9% 0.01 56.259)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-500` | raw (existing) | `oklch(55.3% 0.013 58.071)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-600` | raw (existing) | `oklch(44.4% 0.011 73.639)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-800` | raw (existing) | `oklch(26.8% 0.007 34.298)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-900` | raw (existing) | `oklch(21.6% 0.006 56.043)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-stone-950` | raw (existing) | `oklch(14.7% 0.004 49.25)` | R01.4; installed Tailwind palette | Semantic aliases in the token file | Direct component/page styling |
| `--color-red-300` | raw (existing) | `oklch(80.8% 0.114 19.571)` | P12.1; existing destructive role; proposed accessible shade | Error-role aliases in the token file | Decorative accent or direct styling |
| `--color-red-700` | raw (existing) | `oklch(50.5% 0.213 27.518)` | P12.1; existing destructive role; proposed accessible shade | Error-role aliases in the token file | Decorative accent or direct styling |
| `--spacing` | raw (existing) | `0.25rem`; allowed multipliers 1, 2, 3, 4, 6, 8, 12 → 4, 8, 12, 16, 24, 32, 48px | R01.1; P03; installed Tailwind scale | Derive relational spacing inside token file | Independent page-specific spacing scales |
| `--font-sans` / `--font-mono` | raw aliases (existing) | `var(--font-geist-sans)` / `var(--font-geist-mono)` | P09.1–P09.2; app globals/layout | Back semantic font roles; retain existing Geist fonts | Choose a font by category directly in components |
| `--text-sm` / `--text-sm--line-height` | raw (existing) | `0.875rem` / `1.428571…` (14/20px) | R01.1; existing Tailwind type scale | Derive interface typography | Unmapped font-size literals |
| `--text-base` / `--text-base--line-height` | raw (existing) | `1rem` / `1.5` (16/24px) | R02.1; existing Tailwind type scale | Derive conversation typography | Unmapped font-size literals |
| `--font-weight-normal` / `--font-weight-semibold` | raw (existing) | `400` / `600` | R01.5; existing Tailwind weight scale | Derive normal/emphasis roles | Ad hoc weights |
| `--raw-stroke-1` | raw (new) | `1px` | R01.3; proposed numeric interpretation of thin | Derive divider width | Direct page/component styling |
| `--background` | semantic (existing names) | L: `S100`; D: `S950` | R01.4, A01.1 | Page canvas | Filled primary actions |
| `--foreground` | semantic (existing names) | L: `S900`; D: `S50` | R01.5, R02.3 | Main text and non-error statuses on canvas/card/muted surfaces | Primary/destructive filled-action labels |
| `--card` | semantic (existing names) | L: `S50`; D: `S900` | R01.4, A01.2 | Opaque panels and composer surfaces | Glass/translucent panels |
| `--card-foreground` | semantic (existing names) | `var(--foreground)` | R01.5, A01.2 | Text on cards | Unverified backgrounds |
| `--popover` / `--sidebar` | semantic (existing names) | `var(--card)` | A01.2, R02.6 | Opaque popovers and navigation surface | Translucent navigation/popovers |
| `--popover-foreground` / `--sidebar-foreground` | semantic (existing names) | `var(--foreground)` | R01.5, R02.6 | Text on the corresponding surface | Filled primary actions |
| `--muted` | semantic (existing names) | L: `S200`; D: `S800` | R01.4, R01.5 | Supporting surface | A sole selected-state or control-boundary cue |
| `--muted-foreground` | semantic (existing names) | L: `S600`; D: `S300` | R01.5, R02.3 | Timestamps, metadata, secondary descriptions | Primary labels or color-only status meaning |
| `--secondary` / `--accent` | semantic (existing names) | `var(--muted)` | R01.5, R02.6 | Secondary controls and interaction surface | Brand/accent decoration or a sole selection cue |
| `--secondary-foreground` / `--accent-foreground` | semantic (existing names) | `var(--foreground)` | R01.5, R02.6 | Labels on secondary/accent fills | Primary-filled controls |
| `--primary` | semantic (existing names) | L: `S900`; D: `S200` | R01.5; retain existing neutral primary role | Main action fill; underlined links; meaningful icons | Decorative accent |
| `--primary-foreground` | semantic (existing names) | L: `S50`; D: `S950` | R01.5 | Labels on primary and primary-hover fills | General body text |
| `--primary-hover` | semantic (new) | L: `S800`; D: `S300` | R01.5, P11.1; proposed opaque hover value | Primary hover fill; pressed can reuse this checked value | Opacity-based hover or a new action priority |
| `--destructive` | semantic (existing names) | L: `R700`; D: `R300` | P12.1–P12.2; existing error role | Error text; opaque destructive action fill | Success, pending status or decoration |
| `--destructive-foreground` | semantic (define existing alias) | L: `S50`; D: `S950` | P12.1–P12.2; fills currently undefined alias | Labels on opaque destructive fill | Error text on canvas/cards |
| `--border` / `--input` | semantic (existing names) | L: `S500`; D: `S400` | R01.3, R01.5; requested 3:1 threshold | Dividers and meaningful control boundaries, at full opacity | Text or faded boundaries relied on to identify controls |
| `--ring` | semantic (existing names) | L: `S600`; D: `S400` | R01.5, P11.1; requested 3:1 threshold | Full-opacity focus indicator, separated from a filled control by the surrounding surface | 50%-opacity focus ring or untested adjacent fills |
| `--sidebar-primary` / `--sidebar-primary-foreground` | semantic (existing names) | `var(--primary) / var(--primary-foreground)` | R01.5, R02.6 | Main navigation action; corresponding label | Preserving the unrelated default blue as a new brand choice |
| `--sidebar-accent` / `--sidebar-accent-foreground` | semantic (existing names) | `var(--accent) / var(--accent-foreground)` | R02.6 | Navigation interaction surface and text | Sole selected-state cue |
| `--sidebar-border` / `--sidebar-ring` | semantic (existing names) | `var(--border) / var(--ring)` | R01.3, R02.6 | Navigation divider/focus indicator | Low-opacity boundary/focus variants |
| `--font-interface` | semantic (new) | `var(--font-sans)` | P09.1 | Controls, prose, conversation | Code and filenames |
| `--font-code` | semantic (new) | `var(--font-mono)` | R01.2, P09.2 | Code and filenames | Whole interface |
| `--font-size-interface` | semantic (new) | `var(--text-sm)` | R01.1, R02.3; proposed existing-scale mapping | Dense interface labels and metadata | Long conversation text |
| `--line-height-interface` | semantic (new) | `var(--text-sm--line-height)` | R01.1, R02.3; proposed existing-scale mapping | Interface text at interface size | Conversation text |
| `--font-size-conversation` | semantic (new) | `var(--text-base)` | R02.1; proposed existing-scale mapping | Messages and written answers, including code | Forcing every browsing row to this size |
| `--line-height-conversation` | semantic (new) | `var(--text-base--line-height)` | R02.1; proposed existing-scale mapping | Conversation and answer text | Replacing layout spacing |
| `--weight-body` | semantic (new) | `var(--font-weight-normal)` | R01.1; proposed existing-scale mapping | Normal text | Establishing main priority |
| `--weight-emphasis` | semantic (new) | `var(--font-weight-semibold)` | R01.5; proposed existing-scale mapping | Primary action, current status, key labels | Every label or every message |
| `--space-inline` | semantic (new) | `calc(var(--spacing) * 1) = 4px` | R02.3; proposed scale mapping | Tightly related inline items | Separate groups |
| `--space-within-group` | semantic (new) | `calc(var(--spacing) * 2) = 8px` | R01.1, R02.3; proposed scale mapping | Items within one group | Between sections |
| `--space-between-groups` | semantic (new) | `calc(var(--spacing) * 4) = 16px` | R01.1, P03; proposed scale mapping | Separate groups | Tight metadata pairs |
| `--space-panel` | semantic (new) | `calc(var(--spacing) * 4) = 16px` | R01.1, A01.2; existing card default | Inside normal panels | Section-to-section gap |
| `--space-panel-compact` | semantic (new) | `calc(var(--spacing) * 3) = 12px` | R01.1; existing compact card | Inside compact browsing panels | Forcing dense packing on the conversation |
| `--space-section` | semantic (new) | `calc(var(--spacing) * 8) = 32px` | P03; proposed scale mapping | Between major task sections | Between every row/message |
| `--space-page-inline` | semantic (new) | `calc(var(--spacing) * 6) = 24px` | P03; existing app/hero padding | Page content inset | Fixed conversation/sidebar width |
| `--border-width-divider` | semantic (new) | `var(--raw-stroke-1) = 1px` | R01.3 | Thin row separators | Replacing a focus-indicator geometry decision |
| `--card-spacing` | component (existing) | Normal: `var(--space-panel)`; compact: `var(--space-panel-compact)` | R01.1, A01.2; existing Card variants | Card internal padding/gap | Global page spacing; applying a Card to every row |

New semantic names cover purposes that existing names do not express. `--primary-hover` adds an explicit opaque state; `--destructive-foreground` completes an existing but undefined alias. Only Card currently needs its own component token. Existing radii, shadows and chart tokens receive no new values from these references. Existing `@theme inline` color aliases remain bridges to the corresponding semantic tokens, rather than another token layer.

## Color pairs and contrast

Calculated from the actual OKLCH values converted to sRGB, using relative luminance and alpha compositing where applicable. Results are displayed rounded; pass/fail uses unrounded values. Thresholds follow the requested **4.5:1 for text** and **3:1 for meaningful interface indicators**. [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

These are the supported pairings. Popovers/sidebar use card equivalents; secondary/accent use muted equivalents. Their foreground aliases therefore inherit the corresponding results.

| Foreground / background | Light | Dark | Minimum |
|---|---:|---:|---:|
| `--foreground` on `--background` | 16.04:1 | 18.92:1 | 4.5:1 |
| `--foreground` on `--card` | 16.76:1 | 16.76:1 | 4.5:1 |
| `--foreground` on `--muted` | 13.92:1 | 14.56:1 | 4.5:1 |
| `--muted-foreground` on `--background` | 7.01:1 | 13.27:1 | 4.5:1 |
| `--muted-foreground` on `--card` | 7.32:1 | 11.75:1 | 4.5:1 |
| `--muted-foreground` on `--muted` | 6.08:1 | 10.21:1 | 4.5:1 |
| `--primary` on `--background` | 16.04:1 | 15.72:1 | 4.5:1 |
| `--primary` on `--card` | 16.76:1 | 13.92:1 | 4.5:1 |
| `--primary` on `--muted` | 13.92:1 | 12.10:1 | 4.5:1 |
| `--destructive` on `--background` | 5.89:1 | 10.28:1 | 4.5:1 |
| `--destructive` on `--card` | 6.15:1 | 9.11:1 | 4.5:1 |
| `--destructive` on `--muted` | 5.11:1 | 7.91:1 | 4.5:1 |
| `--border / --input` on `--background` | 4.41:1 | 7.63:1 | 3:1 |
| `--border / --input` on `--card` | 4.61:1 | 6.76:1 | 3:1 |
| `--border / --input` on `--muted` | 3.83:1 | 5.87:1 | 3:1 |
| `--ring` on `--background` | 7.01:1 | 7.63:1 | 3:1 |
| `--ring` on `--card` | 7.32:1 | 6.76:1 | 3:1 |
| `--ring` on `--muted` | 6.08:1 | 5.87:1 | 3:1 |
| `--primary-foreground` on `--primary` | 16.76:1 | 15.72:1 | 4.5:1 |
| `--primary-foreground` on `--primary-hover` | 14.56:1 | 13.27:1 | 4.5:1 |
| `--destructive-foreground` on `--destructive` | 6.15:1 | 10.28:1 | 4.5:1 |

Pairs below threshold, with approved fixes:

- **Current light metadata on muted:** 4.34:1; **current error text on muted:** 4.37:1. Approved replacements reach **6.08:1** and **5.11:1**.
- **Current input boundaries against the page:** 1.26:1 light / 1.47:1 dark. Approved opaque boundaries reach **4.41:1 / 7.63:1**.
- **Current focus ring at 50% opacity against the page:** 1.54:1 light / 1.87:1 dark. Use the approved full-opacity ring against the surrounding surface: **7.01:1 / 7.63:1**. Filled controls need a separating surface gap; adjacent-fill combinations require checking.
- **Existing destructive hover pattern with the approved colors**, over a muted surface: 3.55:1 light / 4.06:1 dark. Replace the tinted treatment with opaque `--destructive` and `--destructive-foreground`: **6.15:1 / 10.28:1**.
- **Approved card versus canvas:** 1.04:1 light / 1.13:1 dark. **Muted versus card:** 1.20:1 light / 1.15:1 dark. These fills cannot independently identify a control boundary or selected state. Use the checked border or another explicit indicator where that distinction carries meaning.

These are token-level checks. Existing component opacity modifiers and hard-coded frontend colors need adapting during implementation; changing declarations alone does not produce all these results.

## Decisions that are not tokens

- **Principle — R01.1, R02.1, P03:** use dense rows for mentor/booking browsing; keep supporting information secondary during sessions.
- **Principle — R01.5:** distinguish the main action/current status from metadata. Color and weight tokens support this; placement and hierarchy remain design decisions.
- **Component trait — R01.3:** separate adjacent rows with thin lines. Width/color are tokens; drawing the separator is component behavior.
- **Component trait — R02.2:** keep the composer visible. Positioning, scrolling and mobile-keyboard behavior are not spacing tokens.
- **Component trait — R02.3:** associate author and time with each message.
- **Component trait — R02.4:** place necessary booking notices alongside the relevant booking; retain the brief's notification scope.
- **Principle — R02.5, A01.3:** use text labels without decorative emoji or sparkles; participant-message emoji remain allowed.
- **Component trait — R02.6:** use short, labeled navigation rather than a channel-heavy sidebar.
- **Principle — A01.1–A01.2:** use flat backgrounds and opaque surfaces. These do not establish a ban on all purple, rounded corners or shadows.
- **Principle — R01.2, P09.1–P09.2:** use the interface font for prose/controls and the code font for code/filenames.
- **Principle — P10.1:** write short, direct, respectful action/outcome/next-step messages.
- **Principle — P11.1:** omit decorative animation; communicate state without movement. This does not justify setting every functional animation duration to zero.
- **Component traits — P12.1–P12.2:** show sending/sent/failure feedback beside the message and offer retry. State logic is not a token.
- **Principle — N01.1–N01.3:** present the question, session and written answer instead of course modules, completion bars or certificates.
- **Principle — N02.1–N02.2:** show public work and relevant experience instead of star scores/rating badges.
- **Usage principle:** consume semantic tokens; reserve raw values for the token file. Recalculate contrast for additional color pairings or opacity treatments.

The Product owner approved the complete proposal without changing values. Any future color-value change requires recalculating its affected pairs before saving and reporting any pair that falls below its threshold.
