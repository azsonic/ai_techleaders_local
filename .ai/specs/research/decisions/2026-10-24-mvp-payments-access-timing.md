# D03 — Take real customer payments in the MVP

- Date, owner: 2026-10-24; Product owner (the participant in this discovery session, attributed by role under `SDLC.md`).
- Source: the assistant asked whether the MVP should simulate payments or collect real ones. The participant answered `1. real`.
- Context and options weighed: a demonstrator using simulated payments versus a service collecting real customer payments.
- Decision and why: the MVP takes real payments. No additional rationale was supplied. Only real purchases can provide purchase evidence; they do not alone establish usefulness or repeat demand.
- Consequences: Stripe remains the permitted provider under the workshop constraint. Prices, payment/booking states, payouts, refunds and responsibility are resolved in later decisions. This discovery session does not authorize charging anyone.
- Supersedes: none.
- Review by: before implementation if real payment scope cannot fit D02; no date agreed.
- Required path to change: Product owner approves a superseding record.
- Status: active.

# D04 — Sessions must be able to start within two hours

- Date, owner: 2026-10-24; Product owner (same session participant).
- Source: asked how soon a developer must be able to start a session for the MVP to be useful, with the interview needs of 20–60 minutes and unconfirmed mentor availability stated as context. The participant answered `2. 2 hours`.
- Decision and why: two hours is the chosen time-to-session requirement. No further rationale was supplied.
- Consequences: this is a product requirement, not evidence of mentor coverage or a universal customer tolerance. The start of the clock, operating hours, covered technologies and behavior when no suitable mentor is available remain undecided. Do not silently interpret this as two hours after payment, all-day coverage, an initial reply deadline or a guaranteed fix. Some interviewees wanted help sooner; fit for a two-hour service remains untested.
- Review by: before launch if supply or customer evidence cannot support the requirement; no date agreed.
- Required path to change: Product owner approves a superseding record.
- Status: active.

# D05 — Include both mentor links and a searchable directory

- Date, owner: 2026-10-24; Product owner (same session participant).
- Source: asked whether customers should reach mentors through a mentor's shared link, a searchable directory, or both; the participant answered `3. both`.
- Context and options weighed: existing mentor audiences using shared links versus discovery of unfamiliar experts using a directory, or both entry routes.
- Decision and why: include both shared mentor links and a searchable directory in the MVP. No further rationale was supplied.
- Consequences: both entry routes must lead into the session flow. This does not decide search filters, ranking, whether every mentor must be listed, or an unverified acquisition benefit. The staff-engineer interview explicitly rejected being listed, so directory participation must be resolved without assuming consent.
- Review by: before implementation if both routes cannot fit D02, or before recruitment if listing policy prevents participation; no date agreed.
- Required path to change: Product owner approves a superseding record.
- Status: active.
