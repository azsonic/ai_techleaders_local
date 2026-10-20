# CLAUDE.md

@AGENTS.md

## Claude-specific reminders

`AGENTS.md` (imported above) is the canonical guide. Edit it there, not here. The non-negotiables:

- **Start of every task:** read `.ai/lessons.md` and check `.ai/specs/` for a relevant spec.
- **Plan first:** complex work starts in plan mode with a spec in `.ai/specs/YYYY-MM-DD-slug.md`. Re-plan when things go sideways. Move the spec to `implemented/` or `archive/` when its lifecycle ends.
- **Verify:** run lint and build, and check the actual behaviour, before claiming done.
- **Runs:** every autonomous run writes a log to `.ai/runs/YYYY-MM-DD-slug.md`.
- **Lessons:** after any correction, record the lesson in `.ai/lessons.md` straight away. Put longer write-ups in `.ai/lessons/YYYY-MM-DD-slug.md`.
