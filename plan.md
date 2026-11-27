# sched-prod incident board — plan

The on-call board for sched-prod. One page, one list: tonight's incidents, newest first, so on-call sees
what just broke and takes it.

## Flows

| flow | who | what happens |
|------|-----|--------------|
| `open-board` | on-call | opens the board; sees tonight's incidents |
| `ack-incident` | on-call | picks an incident row, which opens its incident panel, and acks it there — "I've got this one" |
| `watch-board` | on-call | keeps the board open; it stays current without a reload |

## Requirements

- **R1** New incidents appear live at the top of the list, newest first.
- **R2** Clicking an incident row (or Enter/Space on it) opens its **incident panel**, which names the incident id. The panel holds the **Ack** button; Ack sends the ack for the incident the panel names (`api.ack(id)`) and marks the row acked. Rows have no Ack button. (Changed by product's decision after the step-one recording, SCHED-4515.)
- **R3** Show a loader until incidents load.
- **R4** The board refreshes itself every 2 seconds while open.
- **R5** Times show in the viewer's local time; day before month for EU locales (dd/mm).
- **R6** The page names its build: `<meta name="build" content="<git sha>">` in the head and the same sha in the footer.

## Hooks (pinned — tests and the replay rely on them)

| `data-testid` | element |
|---------------|---------|
| `board` | the board's main area |
| `loader` | the loader (gone once incidents load) |
| `empty` | what shows when there are no incidents |
| `incident-list` | the list |
| `incident-row` | one incident row, with `data-id="<incident id>"` |
| `incident-panel` | the incident panel, naming the incident id (`data-id` too) |
| `panel-ack` | the Ack button in the panel |
| `acked` | the acked mark in a row |
| `build-sha` | the sha in the footer |

## Decisions

- **SCHED-4515 (product, after the step-one recording at 00:21):** with Ack in each row, a new incident inserted at the top moved the
  rows under the pointer, and the click acked INC-7268 instead of INC-2332. Product: "New incidents stay live at the top. Ack leaves
  the row: a row opens its incident panel, and Ack lives there." R1 and R4 stay as they were; R2 changed; the row `ack` hook is gone.

## Done

Every issue in `issues/` delivered, deployed to a public https address, and shown working.
