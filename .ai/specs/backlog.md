# Backlogs

## .ai/specs/product-brief.md
Backlog source: .ai/specs/product-brief.md
Last filed: 2026-10-24

| Id | Issue | Title | Epic | Depends on | Adopted |
|---|---|---|---|---|---|
| E01 | [#8](https://github.com/azsonic/ai_techleaders_local/issues/8) | Mentor supply | — | — | no |
| E02 | [#9](https://github.com/azsonic/ai_techleaders_local/issues/9) | Find and book | — | — | no |
| E03 | [#10](https://github.com/azsonic/ai_techleaders_local/issues/10) | Payments | — | — | no |
| E04 | [#11](https://github.com/azsonic/ai_techleaders_local/issues/11) | Text session | — | — | no |
| E05 | [#12](https://github.com/azsonic/ai_techleaders_local/issues/12) | Supply gate and pilot measurement | — | — | no |
| E06 | [#13](https://github.com/azsonic/ai_techleaders_local/issues/13) | Later | — | — | no |
| E01-T01 | [#27](https://github.com/azsonic/ai_techleaders_local/issues/27) | Platform primitives (auth, validation, form kit) | #8 | — | no |
| E01-S01 | [#14](https://github.com/azsonic/ai_techleaders_local/issues/14) | A mentor signs in with GitHub and sets up a profile | #8 | E01-T01 (#27) | no |
| E01-S02 | [#15](https://github.com/azsonic/ai_techleaders_local/issues/15) | A mentor publishes bookable availability | #8 | E01-T01 (#27), E01-S01 (#14) | no |
| E02-S01 | [#16](https://github.com/azsonic/ai_techleaders_local/issues/16) | A mentee opens a mentor by link or from the directory | #9 | E01-S02 (#15) | no |
| E02-S02 | [#17](https://github.com/azsonic/ai_techleaders_local/issues/17) | A mentee sees prices and the nearest slot, then picks a length and a slot | #9 | E02-S01 (#16) | no |
| E02-S03 | [#18](https://github.com/azsonic/ai_techleaders_local/issues/18) | A mentee signs in, asks a question, books and gets notified | #9 | E02-S02 (#17) | no |
| E02-S04 | [#28](https://github.com/azsonic/ai_techleaders_local/issues/28) | A mentee sees and cancels their bookings | #9 | E02-S03 (#18), E03-S02 (#20) | no |
| E02-S05 | [#30](https://github.com/azsonic/ai_techleaders_local/issues/30) | A mentor sees booked sessions and can cancel one | #9 | E02-S03 (#18), E03-S02 (#20) | no |
| E03-S01 | [#19](https://github.com/azsonic/ai_techleaders_local/issues/19) | A mentee pays at booking in Stripe test mode | #10 | E02-S03 (#18) | no |
| E03-S02 | [#20](https://github.com/azsonic/ai_techleaders_local/issues/20) | Refunds, cancellations and no-shows follow R04 and R09 | #10 | E03-S01 (#19) | no |
| E03-S03 | [#21](https://github.com/azsonic/ai_techleaders_local/issues/21) | A mentor receives their price minus 20% | #10 | E03-S01 (#19) | no |
| E04-S01 | [#22](https://github.com/azsonic/ai_techleaders_local/issues/22) | A mentee and mentor exchange text in a session | #11 | E02-S03 (#18) | no |
| E04-S02 | [#23](https://github.com/azsonic/ai_techleaders_local/issues/23) | A mentee answers a usefulness check after the session | #11 | E04-S01 (#22) | no |
| E05-S01 | [#24](https://github.com/azsonic/ai_techleaders_local/issues/24) | The operator sees the gate status and paid booking stays closed until it passes | #12 | E01-S02 (#15) | no |
| E05-S02 | [#25](https://github.com/azsonic/ai_techleaders_local/issues/25) | The operator sees timing, payments, refunds and booking source | #12 | E03-S01 (#19) | no |
| E03-S03-T01 | [#26](https://github.com/azsonic/ai_techleaders_local/issues/26) | The Tech Lead confirms the Stripe Connect details at the first booking | #21 | — | no |
| E05-S03 | [#29](https://github.com/azsonic/ai_techleaders_local/issues/29) | The operator suspends a mentor and every operator action is logged | #12 | E03-S02 (#20), E04-S01 (#22), E01-T01 (#27) | no |
