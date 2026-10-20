# Lessons Learned

Long-term memory for AI agents working in this repo. Read this before starting any task.

- One entry per lesson, **newest at the top**, written as an actionable rule.
- Put longer write-ups in `lessons/YYYY-MM-DD-slug.md` and link them from the entry.
- Update or remove entries that become wrong or obsolete. Don't add duplicates.

Format:

```markdown
- **YYYY-MM-DD — <Short title>** `#tag` — <One or two sentence actionable lesson.> [details](lessons/YYYY-MM-DD-slug.md)
```

## Lessons

- **2026-10-20 — Check current docs before calling a dependency bogus** `#process` — I flagged the `cn` npm package as "unrelated" and removed it. It is shadcn's official class-merge package (repo `shadcn-ui/cn`). Before removing a dependency a tool added, check the tool's current docs and the package's repo and maintainer on npm.
- **2026-10-20 — `buttonVariants` must go through `cn()`** `#ui #shadcn` — `cva` concatenates classes without resolving conflicts (e.g. `border-transparent` + `border-border`), so the outline border vanished. Use `cn(buttonVariants(...))` on links. Don't use `<Button render={<Link/>}>` for navigation: Base UI adds `role="button"`.
- **2026-10-20 — shadcn CLI in this monorepo** `#ui #shadcn` — `shadcn init` fails in `packages/ui` (no framework detected), and `add` before the theme CSS exists produces broken output. Base setup is manual (deps, `globals.css`, `lib/utils.ts`). After that, run `npx shadcn@latest add <c>` from `packages/app`, and the files land in `packages/ui`.
- **2026-10-20 — `loadEnvConfig` in `next.config.ts` is a no-op** `#nextjs #env` — `@next/env` caches its first call (Next's own call, for `packages/app`), so a second call for the repo root loads nothing. Load the root `.env.local` with `process.loadEnvFile()` instead. It doesn't override real env vars.
- **2026-10-20 — `server-only` throws outside Next.js** `#db` — Importing `server-only` from code the MikroORM CLI loads crashes the CLI. Keep it in runtime entry points (`orm.ts`) only.
- **2026-10-20 — MikroORM is v7, not v6** `#mikro-orm` — v7 is ESM-only, needs Node `>=22.17`, and replaced knex with `@mikro-orm/sql` + `kysely`. Don't use v6/knex APIs from memory: check the installed `.d.ts` files (e.g. `pool`, `defineEntity`, `allowGlobalContext` in `Configuration.d.ts`). With zero entities, set `discovery.warnWhenNoEntities: false`, or init throws.
- **2026-10-20 — Next.js 16 differs from training data** `#nextjs` — Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` instead of relying on memory. `next dev` maintains `packages/app/AGENTS.md` (its project dir). Don't edit or remove its managed blocks; commit them.
