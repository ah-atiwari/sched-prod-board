---
id: SCHED-4515
title: Ack moves from the row to an incident panel
status: done
plan: R2
---

Found in the step-one recording at 00:21: the pointer was on Ack for INC-2332 when a refresh put INC-7268 on top, so the click
acked INC-7268. R1 (live at the top) and R4 (2 s refresh) moved the row's Ack button under the pointer.

Product's decision: "New incidents stay live at the top. Ack leaves the row: a row opens its incident panel, and Ack lives there."

- A row click (or Enter/Space) opens the incident panel (`data-testid="incident-panel"`), naming the incident id.
- The panel's Ack (`data-testid="panel-ack"`, labelled "Ack <id>") acks the incident the panel names, then marks its row
  `acked` and shows when it was acked.
- Rows have no Ack button (`data-testid="ack"` removed). New incidents still appear live at the top.

Acceptance: a new incident landing while on-call clicks can only open the wrong panel, never ack the wrong incident; the panel
names the incident before Ack.
