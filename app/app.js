import { fetchIncidents, ack } from './api.js';

const REFRESH_MS = 2000;
const list = document.querySelector('[data-testid="incident-list"]');
const loader = document.querySelector('[data-testid="loader"]');
const empty = document.querySelector('[data-testid="empty"]');
const panel = document.querySelector('[data-testid="incident-panel"]');
const rows = new Map();
const incidents = new Map();
const acked = new Map();
let openId = null;

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

function timeEl(iso) {
  const time = el('time', '', timeFormat.format(new Date(iso)));
  time.dateTime = iso;
  time.title = iso;
  return time;
}

function markAcked(row) {
  if (!row.querySelector('[data-testid="acked"]')) {
    const mark = el('span', 'acked', 'acked');
    mark.dataset.testid = 'acked';
    row.append(mark);
  }
  row.classList.add('is-acked');
}

// The panel is bound to one incident id, so rows moving under the pointer cannot change what Ack acks.
function renderPanel() {
  panel.replaceChildren();
  const i = incidents.get(openId);
  if (!i) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  panel.dataset.id = i.id;
  const close = el('button', 'close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => select(null));
  const title = el('h2', 'panel-id', i.id);
  const facts = el('dl');
  for (const [k, v] of [['severity', i.severity], ['service', i.service], ['region', i.region], ['summary', i.summary]]) {
    facts.append(el('dt', '', k), el('dd', '', v));
  }
  const opened = el('dd');
  opened.append(timeEl(i.openedAt));
  facts.append(el('dt', '', 'opened'), opened);
  panel.append(close, title, facts);

  const done = acked.get(i.id);
  if (done) {
    const note = el('p', 'panel-acked', 'Acked ');
    note.append(timeEl(done.ackedAt));
    panel.append(note);
    return;
  }
  const button = el('button', 'panel-ack', `Ack ${i.id}`);
  button.type = 'button';
  button.dataset.testid = 'panel-ack';
  button.addEventListener('click', async () => {
    const id = panel.dataset.id;
    button.disabled = true;
    try {
      acked.set(id, await ack(id));
      const row = rows.get(id);
      if (row) markAcked(row);
      if (openId === id) renderPanel();
    } catch (err) {
      console.error(err);
      button.disabled = false;
    }
  });
  panel.append(button);
}

function select(id) {
  rows.get(openId)?.classList.remove('is-open');
  rows.get(openId)?.setAttribute('aria-expanded', 'false');
  openId = id;
  rows.get(openId)?.classList.add('is-open');
  rows.get(openId)?.setAttribute('aria-expanded', 'true');
  renderPanel();
}

function makeRow(i) {
  const row = el('li', `row ${i.severity}`);
  row.dataset.testid = 'incident-row';
  row.dataset.id = i.id;
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  row.setAttribute('aria-expanded', 'false');
  row.addEventListener('click', () => select(i.id));
  row.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(i.id);
    }
  });
  row.append(
    el('span', 'id', i.id),
    el('span', 'sev', i.severity),
    el('span', 'what', `${i.service} · ${i.region} · ${i.summary}`),
    timeEl(i.openedAt),
  );
  return row;
}

function render(page) {
  const seen = new Set();
  let before = list.firstChild;
  for (const i of page) {
    seen.add(i.id);
    incidents.set(i.id, i);
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
      incidents.delete(id);
      if (openId === id) select(null);
    }
  }
  empty.hidden = page.length > 0;
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