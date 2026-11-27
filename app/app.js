import { fetchIncidents, ack } from './api.js';

const REFRESH_MS = 2000;
const list = document.querySelector('[data-testid="incident-list"]');
const loader = document.querySelector('[data-testid="loader"]');
const empty = document.querySelector('[data-testid="empty"]');
const rows = new Map();

const build = document.querySelector('meta[name="build"]')?.content || 'dev';
document.querySelector('[data-testid="build-sha"]').textContent = build;

const timeFormat = new Intl.DateTimeFormat(undefined, {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
});

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function markAcked(row) {
  row.querySelector('[data-testid="ack"]')?.remove();
  if (!row.querySelector('[data-testid="acked"]')) {
    const mark = el('span', 'acked', 'acked');
    mark.dataset.testid = 'acked';
    row.append(mark);
  }
  row.classList.add('is-acked');
}

function makeRow(i) {
  const row = el('li', `row ${i.severity}`);
  row.dataset.testid = 'incident-row';
  row.dataset.id = i.id;
  const time = el('time', '', timeFormat.format(new Date(i.openedAt)));
  time.dateTime = i.openedAt;
  time.title = i.openedAt;
  const button = el('button', 'ack', 'Ack');
  button.type = 'button';
  button.dataset.testid = 'ack';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await ack(i.id);
      markAcked(row);
    } catch (err) {
      console.error(err);
      button.disabled = false;
    }
  });
  row.append(
    el('span', 'id', i.id),
    el('span', 'sev', i.severity),
    el('span', 'what', `${i.service} · ${i.region} · ${i.summary}`),
    time,
    button,
  );
  return row;
}

function render(incidents) {
  const seen = new Set();
  let before = list.firstChild;
  for (const i of incidents) {
    seen.add(i.id);
    let row = rows.get(i.id);
    if (!row) {
      row = makeRow(i);
      rows.set(i.id, row);
    }
    if (row !== before) list.insertBefore(row, before);
    before = row.nextSibling;
  }
  for (const [id, row] of rows) {
    if (!seen.has(id)) {
      row.remove();
      rows.delete(id);
    }
  }
  empty.hidden = incidents.length > 0;
}

async function refresh() {
  try {
    const page = await fetchIncidents();
    render(page.incidents);
    loader.remove();
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(refresh, REFRESH_MS);
  }
}

refresh();