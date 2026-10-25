# D06 — Mentors opt in to the directory; soonest slot first

- Date, owner: 2026-10-24; Product owner (the participant in this discovery session, attributed by role under `SDLC.md`).
- Source: the Product owner chose "Q07 B" (opt-in listing, link-only allowed, no ratings), an option proposed by the assistant over listing every mentor or directory only. On ordering they first wrote "order by recent availability, not earliest slot", then accepted the assistant's option, whose recommendation was soonest slot; asked to resolve it, they answered "Q12 soonest slot".
- Decision and why: mentors choose whether to appear in the directory; an unlisted mentor is reachable by share link only; the directory filters by stack, has no ratings, and orders by soonest available slot. The staff engineer refused to be listed and another mentor agreed only conditionally. The stack filter was part of the assistant's recommendation. No further rationale was supplied.
- Consequences: supply for the directory depends on how many mentors opt in (D12). Soonest-slot ordering means mentors with no published slot do not appear in the ordered list.
- Supersedes: nothing; refines D05.
- Review by: before recruitment if too few mentors opt in for the directory to be useful.
- Required path to change: Product owner approves a superseding record.
- Status: active.

# D07 — The two-hour start is a measured coverage rule

- Date, owner: 2026-10-24; Product owner.
- Source: "Q06 A" (clock starts at confirmed booking; no slot within two hours means no charge), chosen over an operator guarantee or request/accept. Hours given as "Provisional 10:00–22:00 Europe/Warsaw; replace with mentor-published hours after batch 1; no slot → no charge."
- Decision and why: the clock starts at confirmed booking; no charge when no published slot starts within two hours; covered stacks are TypeScript, React, Python and AI agents (the assistant's recommendation, matching the mentor list); provisional hours 10:00–22:00 Europe/Warsaw, days of the week not set (Q09), replaced by mentor-published hours after the first mentor batch. This is honest about supply without on-call mentors. The hours are the Product owner's provisional choice and the Discord export's time zone is unrecorded.
- Consequences: defines D04. Whether a mentee may book a later slot when none starts within two hours is open (Q09).
- Review by: after the first mentor batch.
- Required path to change: Product owner approves a superseding record.
- Status: active.

# D08 — Price bounds and commission

- Date, owner: 2026-10-24; Product owner.
- Source: "PLN 90–600 / 25 min and 180–1200 / 50 min", and "20% fee" accepted "as proposed".
- Decision and why: mentors set prices within 90–600 PLN for 25 minutes and 180–1200 PLN for 50 minutes; both prices are shown before the length is chosen; a 20% commission is taken out of the mentor's price. Four of five benchmarks show the price before booking. Stated price signals in the interviews are intentions, not purchases. The visibility rule and the commission basis were part of the assistant's recommendation.
- Consequences: no EUR/PLN comparison is recorded; the bounds are untested.
- Review by: unknown.
- Required path to change: Product owner approves a superseding record.
- Status: active.

# D09 — Acceptance, charge and refunds

- Date, owner: 2026-10-24; Product owner.
- Source: "auto-confirm with question up front, charge at booking, same-day refund on mentor no-show/decline", chosen "as proposed". The earlier request "auto-refunds conflict with R09 — need founder A decision" is not answered by a repo record; the assistant found no R09 here.
- Decision and why: bookings are auto-confirmed with the mentee's question; the charge is taken at booking; a mentee no-show pays the mentor; a mentor cancellation or non-attendance is refunded in full the same day. Auto-confirm avoids adding acceptance latency to a two-hour clock. The mentee no-show rule was in the assistant's recommendation, following the Python mentor's request.
- Consequences: auto-confirm removes the mentor's chance to screen questions, which may reduce supply (A02).
- Review by: unknown.
- Required path to change: Product owner approves a superseding record.
- Status: active.

# D10 — In-product text session, GitHub sign-in

- Date, owner: 2026-10-24; Product owner.
- Source: "in-app text, GitHub login", chosen "as proposed".
- Decision and why: the session is an in-product text session visible only to its two participants and the operator in a dispute; sign-in is by GitHub, with e-mail as fallback, and is required before booking. Refund and no-show rules need the exchange in the product. The access rule and e-mail fallback were part of the assistant's recommendation.
- Consequences: the backend developer interviewed named a condition this may breach: no account creation or e-mail verification, and booking over five minutes means he rolls back.
- Review by: if Q08 shows a live chat does not fit.
- Required path to change: Product owner approves a superseding record.
- Status: active.
