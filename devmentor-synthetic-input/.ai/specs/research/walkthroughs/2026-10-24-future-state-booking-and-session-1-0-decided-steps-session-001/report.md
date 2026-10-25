# Walkthrough: Future state, booking and session (1.0), decided steps, devmentor-synthetic-input/.ai/specs/product-brief.md, 2026-10-24

One run cannot support a finding, so nothing below is a finding. The most consequential item that appeared in both personas is that a slot at least two hours out does not fit the "within the hour" need that the urgent persona describes (and that the indifferent persona repeats as a condition). The next real check is to ask developers who were blocked before a release how long they waited for help last time, and to read the booking-to-start measurement that D22 already plans. Everything here is synthetic and does not satisfy the Definition of Ready.

Stance: adversary (set explicitly; matches the brief's mode `own`). A run that merely agreed would have been discarded; this one did not.
Panel: 1 run × 2 personas; run 1: P01, P02
Basis: product-brief.md (Product, Key flows, Business rules, Scope, Non-goals, Glossary; Target group used only to choose segments), `[INTERVIEW]` 2026-08-20-interview-working-dev and 2026-09-02-interview-platform-dev-solves-alone, `[DOCUMENT]` D07, D09, D21, D22, D27, N01. Not assumption-only; the segment shares are `[ASSUMPTION]`.
Panel snapshot: `personas.md` in this session directory
Session: `devmentor-synthetic-input/.ai/specs/research/walkthroughs/2026-10-24-future-state-booking-and-session-1-0-decided-steps-session-001/`; subject `devmentor-synthetic-input/.ai/specs/product-brief.md`; flow "Future state, booking and session (1.0), decided steps" (exact match to the Key flow heading)
Composition: assumed. One seat per Target-group segment (urgent, indifferent) because the material gives no proportions. Each segment rests on one note, so each has one persona.
Saturation: not reached. Of the 20 topics the second interview raised, roughly 11 were new against the first (normalised once by the interviewer); two interviews are far too few to say more.
Parity: 10 of 14 held-out themes (9 of 14 if the one theme whose threshold I supplied is excluded); 1 held-out note, `holdout/2026-09-01-interview-backend-dev-fintech.md`; exclusive themes below.
Elapsed: the two persona subagents ran in parallel for about 35 seconds each; setup, composition, consolidation and parity were not timed.
Not askable of this panel: A02 and A04 are both askable of mentee personas, so no assumption was skipped. Mentor-side assumptions are not in this brief.

## 🎯 Scope and limits

Narrative walk of the five-step flow; no browser, no screens, no role logged in as. Payments, cancellation, mentor onboarding, payouts and the note after the session are outside the flow and were not walked. Both personas were told they know the product only through the brief's text, so every "not described" is a real gap in the text, not an imagined screen.

Limits of this run:
- One run means no repetition and no spread. Every item is *Seen once*.
- The script's pressure for D1 said "thirty seconds of patience". That figure was my addition, not from the brief or a note; both personas echoed it, and no item below rests on it.
- D2 ("open the first mentor") and D3 ("pick 25 minutes") answers from P01 are the model's choices without a source and carry no weight.
- Several "still not" lines on P01 (Q1, Q7) are inference beyond its note.
- The persona subagents answered the whole script in one pass rather than turn by turn, so a later answer may have been shaped by an earlier one.

## 🔍 Barriers that repeated (worst first, ties marked)

None. With one run nothing can have repeated.

## 📋 Missing cases that repeated

None reported; see *Seen once*.

## ⚠️ Contradictions with the brief

None reported; see *Seen once*.

## 🔍 Outliers

P02 (the indifferent seat) left the flow in every decision pressure (D1 closes the tab, D2 leaves from the list, D3 leaves before choosing a length, D4 drops it) and stayed only for D5, where text was a neutral point. Its one opening was the variation: a once-only migration costing a whole day, paid by the company. Even there it said it would ask the internal channel first and that the two-hour floor already broke "within an hour". That is what its note describes and what the stance expects of this seat. It is reported separately because an average with P01 would hide it.

## 🔁 Seen once, not reported as a finding

Each item is `[SYNTHETIC]`, run 1.

1. **The two-hour floor against a "within the hour" need** (P01 strongly, P02 as a stated condition). `[SYNTHETIC]` Touches R03, D22 and assumption A04. P01's fast reaction at D4 was tension (strong); its considered answer said it would accept it only because it is desperate. P01 also said "within the hour is the whole point and nothing I know about this product promises it". The brief itself says the product does not promise it.
2. **Price visible only after choosing a length** (P01: wary, would back out if high; P02: leaves without choosing). `[SYNTHETIC]` Touches D09, R02, assumption A02. No price exists in the material, so no value was used. P02's exit here is tied to its company-pays condition.
3. **No signal for choosing a stranger in a list ordered by recent availability** (P01 uneasy, P02 skeptical; both say the text gives no way to judge). `[SYNTHETIC]` Touches D21. Both asked for evidence of having done the same thing before (P01: "someone who has actually done this"; P02: what the mentor did, or someone they know). The text describes nothing of the profile, which is itself the gap.
4. **Sign-in before any mentor is visible** (P01 mild impatience, P02 closes the tab). `[SYNTHETIC]` Touches D07, R05. Weakest item: the thirty-second threshold was mine, and the persona had no basis for GitHub versus e-mail.
5. **Who pays is not in the flow** (P02: only "na firmę", the company; P01: "can't say"). `[SYNTHETIC]` Touches assumption A02. Payments are out of scope here; the question is about the person choosing, who can be a different person from the payer.
6. **Whether code can be pasted into the text session, and what is kept afterwards** (P01 raised both; P02 does not want anything kept). `[SYNTHETIC]` Touches R04, D27. The two personas disagree on retention.
7. **What happens if no slot fits before the deadline** (P01). `[SYNTHETIC]` Touches R03, A04. The brief states no fallback.
8. **P02's one buying condition: a once-only, day-long, company-paid task, found in five minutes, done within the hour.** `[SYNTHETIC]` Touches A02 and A04. It comes from P02's own note and was repeated, not discovered.

Dropped as slop: P01's "with a week of slack I might not book at all" (inference from removing the deadline, no source), P01's unsourced D2 and D3 choices, and the "I'd repeat the same free routine" line.

## 🧪 To confirm with real users

| # | Hypothesis | Persona ids / runs | Settles | Who to recruit | How |
|---|---|---|---|---|---|
| 1 | Developers blocked before a release would not accept a slot at least two hours out | P01, P02 / run 1 | A04, R03, D22 | developers who were blocked within 24 hours of a release in the last 3 months | Ask: "Tell me about the last time you were blocked before a release. How long until you had a usable answer, and what had you done by then?" Also read D22's booking-to-start measurement in the first four weeks. |
| 2 | Not seeing a price until a length is chosen makes people leave | P01, P02 / run 1 | A02, D09, R02 | developers who bought or expensed outside technical help in the past year | Ask: "Last time you paid or expensed outside technical help, when did you learn the price, and what did you do?" Usability test of the price step once a screen exists. |
| 3 | A list ordered by recent availability, with no ratings, does not tell a stranger apart from another | P01, P02 / run 1 | D21 | developers who looked for an outside expert in the last year | Ask: "How did you decide who to trust last time?" Task: pick a mentor from a mock list and say why. |
| 4 | The sign-in gate before browsing costs sessions | P01, P02 / run 1 | D07, R05 | developers who abandoned or completed a sign-up for outside help | Ask what they did at the last sign-up wall; measure drop-off at sign-in once the flow is live. |
| 5 | The person choosing is often not the one paying | P02 / run 1 | A02 | developers at companies of different sizes who bought outside help | Ask: "Last time, who paid and who approved it?" |
| 6 | Pasting code into the session matters; what is kept afterwards matters to some and not to others | P01, P02 / run 1 (they disagree) | R04, D27 | developers who got outside help in text | Ask: "Last time you got help by text, what did you paste, and what did you do with the answer afterwards?" |
| 7 | When no slot fits before a deadline, the person leaves | P01 / run 1 | A04, R03 | developers blocked before a release | Ask what they did when help was not available in time; test the no-fitting-slot state. |
| 8 | Low-urgency developers at large companies will not pay unless the task is once-only, day-long, fast to find and company-paid | P02 / run 1 | A02 | platform developers at companies with an internal channel | Ask for the last time they paid anyone for technical help, and what the conditions were. |

## 📝 Interviews

Transcripts: `transcripts/run-1-P01.md`, `transcripts/run-1-P02.md`. Each holds the question, the passages attached, the fast reaction and feeling, the considered answer, the "still not" line, the pressure results, the walk's step records and topics, with the interviewer's notes at the end.

Acquiescence: of the six answered yes/no questions across both personas, 2 were yes (P01 asked someone outside the team; P01 shipped without a proper answer) and 4 were no; two had no basis. That is a third yes, not above one half, so no acquiescence flag. The yes answers rest on P01's note.

Story against pressure: in P01, the "I want speed" story held through D1, D3 and D5 and broke only at D4 (the two-hour floor). In P02, the stated story held through every decision. The one place a pressure changed an answer was P01's variation (release moved a week), where urgency, and with it the speed story, loosened; that answer is the persona's inference, not a note's statement.

## 🔍 Parity with real interviews

Held-out note opened only after the transcripts were written. It was used for no persona line and appears nowhere in the persona blocks.

Shared (10 of 14): urgent block with nobody reachable; free outside channels giving wrong or contradictory answers; needing a fast reply window; account or sign-up friction (counted, but the persona's threshold came from my pressure, so this one is weak); text preferred; wanting evidence the mentor did the same thing before; saved answers not needed (P02; P01 diverges); no subscription (not community or learning path); who pays unresolved; price unclear.

Real only (the panel is blind here): (1) ratings are worthless ("every profile has five stars"), while both personas complained about missing ratings; (2) a past paid-help attempt that took 40 minutes to find and failed on a technical detail; (3) the cost of the miss, a release slipped and a lead who was not pleased; (4) help needed outside office hours (Friday evening, a weekend). Each names material to gather: a persona with a recent paid-help story, and a persona whose problem lands out of hours.

Panel only (questions for the next real interview, never findings): login wall, two-hour floor against a "within the hour" need, nearest slot unknown, price after length, list ordered by availability, "people ask me" and the internal channel, the once-only company-paid condition, pasting code into the session, wanting something kept afterwards. Most of these are reactions to the product text, which the real interview never showed, so their absence from the real note is expected.

Sentiment: aligned on text, subscription, saved answers and free channels failing. Misaligned on ratings, on who pays (the real person leaned to paying themselves, "chyba"; P02 said the company), and on specificity: the real person named an exact upgrade and a five-minute booking limit ("if booking takes more than five minutes I roll back and go home"), where the panel stayed at "within the hour" and "someone who has done this". The panel reaches the theme but not the number.

Recorded in `calibration.md`. One note and two personas make this a first trend point, not a score.

## 📸 Evidence

Narrative walk; no screens.

## Quality gate

Critical items 1, 2, 5, 9, 10, 11, 12, 15 and 16 pass: personas are sourced and the assumed lines listed (3 of 29 are assumed), no demographics, no stated-preference question in the script, no item presented as a finding, every item tagged and paired with a real check, no persona-supplied number quoted as a share (the "thirty seconds" and the passages' own "five minutes", "hour" and "two hours" are quoted as such), no "validated" language, the hold-out stayed closed until step 6, and acquiescence was measured.

Biases checked: over-positivity absent (adversary stance); the panel is skeptical throughout, which the stance asks for and which may overstate objections; the two personas differ in segment, tools and vocabulary but both hit the same product gaps, which come from a shared stimulus; both come from payments or product-company settings; both were engaged enough to answer, though P02 is deliberately indifferent. Homogeneity: not flagged, but each segment has one note, so every persona is one voice per segment.

## Hypotheses source files

`product-brief.md`, `research/2026-08-20-interview-working-dev.md`, `research/2026-09-02-interview-platform-dev-solves-alone.md`, `research/decisions/D07-login.md`, `D09-pricing.md`, `D21-finding-a-mentor.md`, `D22-session-timing.md`, `D27-session-channel.md`, `N01-no-video.md`; hold-out `research/holdout/2026-09-01-interview-backend-dev-fintech.md` (step 6 only).

Next: none. The subject brief sits outside `${SPECS_DIR}`, and `om-discover --refresh` only refreshes `.ai/specs/product-brief.md`, so these hypotheses stay with this brief.
