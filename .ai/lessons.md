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

- **2026-10-22 — Count discovery markers as whole lines** `#process #tooling` — When validating discovery sections in `SDLC.md`, anchor marker checks to entire lines. The Amending section also quotes marker strings in inline code, so counting every occurrence overcounts the actual section boundaries.
- **2026-10-22 — Root scripts need their own place in the test gate** `#test #tooling` — `vitest.config.ts` only measured `packages/*/src`. Code under root `scripts/` is covered because its `include`/`coverage.include` list `scripts/**`. Vitest 5 has no per-glob environment, so each `scripts/**` test starts with `// @vitest-environment node`. Keep logic behind injected adapters (`scripts/setup/system.mjs` is the only impure file).
- **2026-10-22 — `db:migration:list` shows executed migrations, not pending ones** `#mikro-orm` — To decide "is anything pending" you would need `migration:pending`, which has no script. `migration:up` is already idempotent, so run it instead of trying to skip it.
- **2026-10-21 — jsdom's URL resolves file paths against the page** `#test` — In Vitest's jsdom environment, `new URL(relative, import.meta.url)` turns a `file://` base into `http://localhost:3000/...`. Unit-test modules that resolve paths from `import.meta.url` with `// @vitest-environment node`.
- **2026-10-21 — `agent-browser` engines field is for a source build** `#test` — `agent-browser@0.39` declares `node >= 24`. That applies to compiling the native CLI. The published binary runs on this repo's Node 22. Don't bump the runtime to silence the warning.
- **2026-10-21 — Don't re-ask a request that already states the outcome** `#process` — When the user names the checks, the coverage rule, and the tools, decide the technical defaults and implement. Don't turn that into a questionnaire. They are not a programmer; explain the result in plain language.
- **2026-10-20 — Catch-all route wrappers must call `unstable_rethrow`** `#nextjs` — `notFound()`, `redirect()` and prerender signals are thrown errors. A generic `try/catch` (like `apiHandler`) would turn them into 500s. `core` can't import Next, so `createApiHandler({ rethrow })` takes it as an option and the app passes `unstable_rethrow` (`packages/app/src/http/api-handler.ts`). Also, `export const dynamic` doesn't exist under `cacheComponents`; use `await connection()`.
- **2026-10-20 — Check imported standards docs against `AGENTS.md` first** `#process` — `.ai/docs/engineering-standards.md` was written for another bootstrap (reversed dependency direction, services in `core`, `force-dynamic`, files that don't exist). Before implementing an external doc, diff its assumptions against `AGENTS.md` and the real tree, and get the conflicts decided in a spec. Don't apply it literally.
- **2026-10-20 — Check current docs before calling a dependency bogus** `#process` — I flagged the `cn` npm package as "unrelated" and removed it. It is shadcn's official class-merge package (repo `shadcn-ui/cn`). Before removing a dependency a tool added, check the tool's current docs and the package's repo and maintainer on npm.
- **2026-10-20 — `buttonVariants` must go through `cn()`** `#ui #shadcn` — `cva` concatenates classes without resolving conflicts (e.g. `border-transparent` + `border-border`), so the outline border vanished. Use `cn(buttonVariants(...))` on links. Don't use `<Button render={<Link/>}>` for navigation: Base UI adds `role="button"`.
- **2026-10-20 — shadcn CLI in this monorepo** `#ui #shadcn` — `shadcn init` fails in `packages/ui` (no framework detected), and `add` before the theme CSS exists produces broken output. Base setup is manual (deps, `globals.css`, `lib/utils.ts`). After that, run `npx shadcn@latest add <c>` from `packages/app`, and the files land in `packages/ui`.
- **2026-10-20 — `loadEnvConfig` in `next.config.ts` is a no-op** `#nextjs #env` — `@next/env` caches its first call (Next's own call, for `packages/app`), so a second call for the repo root loads nothing. Load the root `.env.local` with `process.loadEnvFile()` instead. It doesn't override real env vars.
- **2026-10-20 — `server-only` throws outside Next.js** `#db` — Importing `server-only` from code the MikroORM CLI loads crashes the CLI. Keep it in runtime entry points (`orm.ts`) only.
- **2026-10-20 — MikroORM is v7, not v6** `#mikro-orm` — v7 is ESM-only, needs Node `>=22.17`, and replaced knex with `@mikro-orm/sql` + `kysely`. Don't use v6/knex APIs from memory: check the installed `.d.ts` files (e.g. `pool`, `defineEntity`, `allowGlobalContext` in `Configuration.d.ts`). With zero entities, set `discovery.warnWhenNoEntities: false`, or init throws.
- **2026-10-20 — Next.js 16 differs from training data** `#nextjs` — Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` instead of relying on memory. `next dev` maintains `packages/app/AGENTS.md` (its project dir). Don't edit or remove its managed blocks; commit them.
