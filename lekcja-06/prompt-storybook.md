# Task

Build my product’s design system with Storybook documentation. Storybook must be
an operating manual, not a gallery. Three people read it: a developer building a
screen, an AI agent building a screen, and a designer checking screen compliance.

Done means a developer or agent can build a new screen from this documentation
without guessing. They know which component to use and why, how to compose it
with others, which tokens to use, how each state behaves and what not to do.

# My materials

- Product and users: DevMentor connects developers with experienced mentors
  for paid text sessions (25 or 50 minutes); a mentee finds a mentor and books
  a slot, a mentor publishes availability and prices, an operator handles invitations and disputes.
- Brief and research: .ai/specs/product-brief.md, .ai/specs/research/
- Backlog and specifications: .ai/specs/backlog.md and the other .md files in .ai/specs/
- References file from exercise 2: lekcja-06/referencje.md
- Tokens from exercise 2: lekcja-06/tokeny.md
- Audit report from exercise 1: none
- Component base: shadcn/ui on Radix
- Design system location: packages/ui
- Storybook location: packages/ui/.storybook
- Product UI language: English. Documentation language: English

# How to work

Work through stages 0 to 5. After each stage, stop, show what you did and checked,
and wait for my “continue”. Do not proceed to the next stage on your own.

Maintain POSTEP.md in the design system directory: completed stages, decisions I
approved, open questions and the next step. In a new session, read POSTEP.md first
and continue where you left off.

# Rules that must not be broken

1. Product style comes from my materials: references, tokens, brief and specifications.
   Do not invent it. If anything is missing, ask. Mark your own suggestions as proposals.
2. The base’s appearance (e.g. shadcn) is not the product’s style. Changing the palette
   alone is insufficient: shape, typography, spacing, density and states must also
   follow my decisions. After stage 2, components must not look like the default library.
3. Every component value comes from a token. No hex, rgb, hsl or oklch colors outside
   the token file, no Tailwind palette classes like bg-zinc-900 or text-white and no
   arbitrary values like p-[13px].
4. Every documentation rule cites a source: reference ID (e.g. R01.2), negative
   reference (e.g. A01), brief or specification decision, WCAG or WAI-ARIA. Mark a
   rule with no source as a proposal and list it in the report for my decision.
5. Stories use real package components. No HTML copies or components made only
   for Storybook. Exception: documentation helpers (e.g. color samples, token
   tables) may live in the Storybook directory without being exported from the package.
6. Add no components, variants or dependencies outside the approved plan. Record
   gaps on “What is missing”. After every CLI command (e.g. shadcn), check
   package.json and remove dependencies absent from the plan.
7. Example data is fictional but realistic and drawn from the brief and specifications.
   No lorem ipsum. No invented customer counts, ratings or testimonials absent
   from the materials.
8. Tables in MDX: without remark-gfm, Markdown tables render as raw text with pipes.
   Add the plugin or use JSX tables. Check every page in the built Storybook.
9. The theme switch sets the theme on the document root so dialogs, menus and
   popovers rendered outside the story also receive it.
10. Only my product’s name appears in Storybook’s interface. Document the base’s
    origin in a technical note. Disable Storybook’s onboarding checklist and
    new-version messages.
11. Do not change application code outside the design system directory except to
    connect scripts and configuration. Push nothing to the remote repository and
    publish nothing.
12. If a design system, Storybook or tokens already exist, do not delete or rewrite
    themes, palettes, tokens, components or pages without my approval. Propose
    justified changes and wait for a decision.

# Target Storybook structure

Design system
  Start here: how to build a screen
  Components: catalog of all components with previews and links
  How to choose: how to choose a component
  Usage and accessibility: usage and accessibility rules
  Content: content and messages
  What to avoid: what to avoid
  What is missing: what is missing
  Contributing: how to change the system
  one page per backlog epic: flow, screens and their states
Foundations: color, typography, spacing and layout, shape and depth, motion, icons, themes
Primitives: base components
Product: product components, grouped by epic
Patterns: form, filtered list, detail view, deletion confirmation
  and key patterns from the backlog

Match menu names to the documentation language.

# Stage 0. Inventory and plan

Read all my materials and inspect the repository: package manager, framework,
Tailwind version, existing styles and components. For now, save only POSTEP.md.
Show me:

1. My decisions in ten lines: character words, anti-character, main traits from
   “Keep”, negative references and resolved conflicts, with IDs.
2. Gaps in the materials, at most five questions at once.
3. The component base and rationale, if I did not specify it.
4. Technical plan: package location, Storybook version, addons (documentation,
   accessibility, interaction tests, API mocking if the app uses an API) and scripts.
5. A list of base components, product components and patterns derived from screens
   in specifications. For each, name the screen that needs it.
6. Storybook menu tree and approximate story count.
7. If a design system already exists: what stays unchanged, what you want to change
   or remove, each item justified and submitted for my decision.

# Stage 1. Foundations

1. Install and configure Storybook for the project stack: documentation, accessibility
   addon, interaction tests, MDX table support, storybook and build-storybook scripts.
   Accessibility checks must fail with an error: set a11y: { test: 'error' } in the
   preview, run stories as tests (e.g. with Storybook's Vitest addon) and add a script
   that runs them in both themes if the product has a dark theme.
2. Save tokens in code in three layers: raw values, meanings named by purpose
   (e.g. action-primary, text-muted, space-section, never blue-500), and component
   tokens only where needed. Take them from tokeny.md. Record the source of every
   semantic token in a comment. If the product has a dark theme, define both.
   Before saving, recalculate contrast for the actual saved values. If a pair
   drops below the threshold, stop and ask.
3. Connect tokens to Tailwind or the project’s styling system so classes use tokens.
   Bundle fonts with the project; do not load them from an external CDN.
4. Add the theme switch (rule 9).
5. Build Foundations pages rendering real CSS variables. Wrap MDX previews in
   Storybook’s Unstyled block, otherwise documentation styles override components:
   - color: roles and a measured contrast table for every text/background pair in
     both themes. Flag pairs below 4.5 : 1 for text and 3 : 1 for interface elements
     and propose fixes. Color is never the sole carrier of meaning;
   - typography: roles (page heading, section heading, body, label, metadata,
     numbers, code), not just sizes. Body text has at most about 65 characters per line;
   - spacing: relationship rules (within groups, between groups, inside panels,
     between sections), with a specific token at each level;
   - shape and depth: radii, borders, shadows and when they may be used;
   - motion: durations and behavior under prefers-reduced-motion;
   - icons: library, sizes, when an icon needs a label;
   - layout: 320, 768 and 1440 px widths, maximum content width.
6. Add a script finding colors outside the token file, Tailwind palette classes and
   arbitrary Tailwind values, exiting with an error so it can be added to CI.

# Stage 2. Base components

Add base components from the chosen base (e.g. through shadcn CLI) and adapt them
to tokens and my decisions. Work in batches of about six and stop after every batch.

Before the first batch, list how shape, density and states should differ from the
default base: control height, radii, borders, padding, focus appearance. Cite the
decision behind each difference. If my materials are silent, ask instead of
keeping the base’s defaults.

Minimum set, adapted to the stage 0 plan: button, text action and link, text input,
textarea, select, checkbox, radio group, switch, label and form field (label, hint,
error, required or optional), card or panel, status badge, avatar, alert, dialog,
confirmation dialog, menu, popover, tooltip, tabs, loading skeleton, empty state,
error state, toast notification if the product needs one.

Give each component a documentation page with the same structure. Do not skip
sections; if one does not apply, explain why:
1. Purpose: one sentence about the user problem.
2. When to use: specific situations in my product.
3. When not to use and what to use instead.
4. Anatomy: parts and which are optional.
5. Variants: each with guidance on when to choose it.
6. States: default, hover, focus, pressed, disabled, loading, selected and error
   where applicable. For disabled, explain how users learn why the action is unavailable.
7. Behavior and accessibility: keyboard, focus order, ARIA roles and attributes,
   screen reader announcements, click target at least 24 × 24 px.
8. Content: labels, maximum length, long text, numbers, translation into a longer language.
9. Responsiveness: 320, 768 and 1440 px.
10. API: props with types, defaults and descriptions.
11. Code: minimal example and a typical example from my product.
12. Good and bad: side-by-side pairs, each with a one-sentence explanation.
13. Related: commonly confused components and patterns in which it appears.

Stories for every component:
- Playground with controls,
- every variant and size,
- state matrix: show hover and focus as frozen previews, using the same declarations
  as the component’s :hover and :focus-visible, bound in Storybook CSS to an
  attribute such as data-preview-state (documentation only),
- long content and a narrow screen,
- a play function interaction test for the main behavior: clicking, keyboard, validation.

Every story passes accessibility checks without violations or has a documented exception.

# Stage 3. Product components, patterns and screens

1. For every backlog epic, build product components from base components, e.g.
   main-object card, list row, status. Each has data states: loading, empty, error,
   partial data, lots of data and long text.
2. Patterns, each with all states as separate stories:
   - form: always-visible label (placeholder is an example, not a field name),
     validation on blur and submit, focus the first error after failed submission,
     preserve entered data, prevent double submission, show success only after
     server confirmation. Mock API responses in Storybook: success, pending,
     field error, server error, offline;
   - filtered list: result count, visible filters easy to remove, separate “no
     results for these filters” state (clear filters action) and “nothing here yet”
     state (create action);
   - detail view: main information and primary action visible without scrolling,
     “does not exist or no access” state;
   - deletion confirmation: object name in the question, easy-to-find cancel button,
     delete button labeled with a verb (“Delete profile”), not “OK”;
   - key patterns from my backlog.
3. Key screens of every epic as fullscreen stories, with a state map connecting
   each screen state to a story.

# Stage 4. Pages that teach

- Start here: product character in three sentences and character words, five steps
  to build a screen (find a pattern, select components through “How to choose”,
  use semantic tokens, design data states, check “What to avoid”), and a table of
  all components: name, import, when to use, when not to use.
- Components: catalog with a small working preview, group, one-sentence description
  and documentation link for every component.
- How to choose: “if… then use…” tables with product examples for:
  button, link, icon button and action menu; radio, select and search field;
  switch and checkbox; dialog, confirmation dialog, side panel, separate page,
  popover and tooltip; field error, alert and toast (an error requiring action is
  never a toast); skeleton and loading indicator; table, list and cards;
  tabs and separate pages.
- Usage and accessibility: keyboard and focus, forms and messages, color, motion
  and content, layout at different widths and product rules enforced by the UI.
  Each rule cites a source.
- Content: tone from references, with three things the product says and three it
  does not; buttons (verb and object); errors (what happened and what to do);
  empty states (why empty and the next step); date, time, currency and number formats.
- What to avoid: three parts, with how to recognize each item in code too, why it
  is a problem and what to use instead:
  1. my product’s anti-patterns from references,
  2. generic AI appearance: gradients in backgrounds, text and buttons, glass and
     blur, glow, emoji instead of icons, sparkles as an AI symbol, three identical
     icon cards, pills everywhere, a card inside a card, shadow as the only way
     to separate content, everything centered,
  3. implementation mistakes: non-token values, incidental variants, div instead
     of button, placeholder instead of label, status indicated only by color,
     disabled button without explanation, toast for an error requiring action,
     tooltip with information essential for taking action.
- What is missing: a table of readiness and backlog coverage: backlog item,
  component or screen, state, priority.
- Contributing: when to add a component (same need in at least two places), when
  a variant or nothing; documentation requirements for a new component; checks
  after token changes; who approves; commands.
- Each epic’s page: flow steps, screens and stories, states, source files and
  product work that remains.

Agent file: write a design system summary (e.g. docs/design-system.md) and link to
it in AGENTS.md. Include product character, a component table with import, when
to use and when not to use, semantic tokens and their purposes, “if… then use…”
guides, the “what to avoid” list and Storybook commands. An agent building a screen
reads this file first.

# Stage 5. Verification and report

1. Build Storybook and run typecheck and lint.
2. Run the stage 1 script and list every non-token value with file and line.
3. Check accessibility of all stories and list violations.
4. Check 320, 768 and 1440 px widths in a browser, both themes, keyboard operation
   and overlays.
5. Prepare the agent test, but do not run it in this session, because this conversation
   gives you answers that are not in the files. Choose one new backlog screen that is not
   in Storybook yet and record its description in POSTEP.md. I will run the test in a new
   session with a separate prompt. Afterwards, document every point where the test agent
   guessed or add it to “What is missing”.
6. Count documentation pages, components, stories and interaction tests.

Report what you built, checked and did not check, proposals for my decision and
missing items. Do not describe anything as ready unless you checked it.

# When the design system is ready

- Every component has a page with 13 sections and a state matrix.
- Every pattern has all data states; forms also have API response states.
- Every key backlog screen has a story and state map.
- The script finds no non-token values.
- No accessibility violations, or each has a documented exception.
- Both themes work, including in dialogs and menus.
- An agent built a new screen from the documentation, and every point where it
  guessed is documented or listed in “What is missing”.