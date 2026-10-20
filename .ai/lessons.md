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

- **2026-10-20 — Next.js 16 differs from training data** `#nextjs` — Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` instead of relying on memory. Do not remove the `nextjs-agent-rules` block from `AGENTS.md`, because `next dev` re-adds it.
