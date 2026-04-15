const API_URL = '/api/signals';
const REFRESH_INTERVAL_MS = 60000;
const NEWS_TICK_MS = 30000;

const tbody = document.getElementById('scanner-body');
const searchInput = document.getElementById('searchInput');
const timeframePill = document.getElementById('timeframePill');
const countText = document.getElementById('countText');
const liveDot = document.getElementById('liveDot');
const lastUpdatedText = document.getElementById('lastUpdatedText');
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));

let allSignals = [];
let currentFilter = 'all';
let currentSearch = '';
let currentTimeframe = '15m';
let lastLoadedAt = null;

function fmtRelativeTime(date) {
  if (!date) return '—';
  const diffMs = Date.now() - new Date(date).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

function minutesUntil(iso) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

function formatNewsLabel(row) {
  if (!row.news_event_name || !row.news_event_time) {
    return row.news_risk || 'No major news';
  }

  const mins = minutesUntil(row.news_event_time);

  if (mins <= -1) {
    return `${row.news_event_name} passed`;
  }

  if (mins <= 0) {
    return `${row.news_event_name} live`;
  }

  if (mins === 1) {
    return `${row.news_event_name} in 1 min`;
  }

  if (mins < 60) {
    return `${row.news_event_name} in ${mins} min`;
  }

  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) {
    return `${row.news_event_name} in ${hrs}h`;
  }
  return `${row.news_event_name} in ${hrs}h ${rem}m`;
}

function displayEntryText(row) {
  if ((row.strength_score ?? 0) < 70) return 'None';
  return row.entry_text || 'None';
}

function displayEntryStatus(row) {
  if ((row.strength_score ?? 0) < 70) {
    if ((row.strength_score ?? 0) >= 65) return 'Waiting';
    return 'None';
  }
  return row.entry_status || 'None';
}

function statusClass(status) {
  switch (status) {
    case 'Valid': return 'status-valid';
    case 'Near': return 'status-near';
    case 'Triggered': return 'status-triggered';
    case 'Expired': return 'status-expired';
    case 'Waiting': return 'status-waiting';
    case 'None': return 'status-none';
    default: return 'status-none';
  }
}

function stateClass(state) {
  switch (state) {
    case 'Bullish': return 'state-bullish';
    case 'Bearish': return 'state-bearish';
    case 'Consolidating': return 'state-consolidating';
    default: return 'state-consolidating';
  }
}

function dotClass(state) {
  switch (state) {
    case 'Bullish': return 'dot-green';
    case 'Bearish': return 'dot-red';
    case 'Consolidating': return 'dot-yellow';
    default: return 'dot-yellow';
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatStrength(value) {
  return `${value ?? 0}/100`;
}

function sortSignals(rows) {
  return [...rows].sort((a, b) => {
    if (a.is_top_pick && !b.is_top_pick) return -1;
    if (!a.is_top_pick && b.is_top_pick) return 1;
    return (b.strength_score ?? 0) - (a.strength_score ?? 0);
  });
}

function applyFilters() {
  let rows = [...allSignals];

  rows = rows.filter((row) => row.timeframe === currentTimeframe);

  if (currentFilter !== 'all') {
    rows = rows.filter((row) => row.asset_class === currentFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    rows = rows.filter((row) =>
      String(row.symbol || '').toLowerCase().includes(q) ||
      String(row.display_name || '').toLowerCase().includes(q)
    );
  }

  rows = sortSignals(rows);
  renderTable(rows);
}

function renderTable(rows) {
  countText.textContent = `${rows.length} markets shown • ${currentTimeframe} view`;

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="empty-state">No markets match this filter.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map((row) => {
    const entryText = displayEntryText(row);
    const entryStatus = displayEntryStatus(row);
    const newsLabel = formatNewsLabel(row);

    return `
      <tr>
        <td class="symbol-cell">
          <div class="symbol-wrap">
            <span class="state-dot ${dotClass(row.state)}"></span>
            <div>
              <div class="symbol-main">${escapeHtml(row.symbol)}</div>
              <div class="symbol-sub">${escapeHtml(row.underlying_symbol || '')}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="type-pill">${escapeHtml(row.asset_class)}</span>
        </td>
        <td>${escapeHtml(row.timeframe)}</td>
        <td>
          <span class="state-pill ${stateClass(row.state)}">${escapeHtml(row.state)}</span>
        </td>
        <td class="strength-cell">
          <div class="strength-bar">
            <div class="strength-fill" style="width:${Math.max(0, Math.min(100, row.strength_score || 0))}%"></div>
          </div>
          <div class="strength-text">${formatStrength(row.strength_score)}</div>
        </td>
        <td>${escapeHtml(row.volume_status || '—')}</td>
        <td>${escapeHtml(row.bias_note || '—')}</td>
        <td>
          <span class="news-pill">${escapeHtml(newsLabel)}</span>
        </td>
        <td>${escapeHtml(entryText)}</td>
        <td>
          <span class="status-pill ${statusClass(entryStatus)}">${escapeHtml(entryStatus)}</span>
        </td>
        <td>
          ${row.is_top_pick ? '<span class="pick-pill">Top Pick</span>' : ''}
        </td>
      </tr>
    `;
  }).join('');
}

async function loadSignals() {
  try {
    liveDot.classList.add('is-live');

    const res = await fetch(API_URL, { cache: 'no-store' });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Failed to load signals');
    }

    allSignals = Array.isArray(data.signals) ? data.signals : [];
    lastLoadedAt = new Date().toISOString();
    lastUpdatedText.textContent = fmtRelativeTime(lastLoadedAt);

    applyFilters();
  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="empty-state">Failed to load scanner data.</td>
      </tr>
    `;
    lastUpdatedText.textContent = 'load failed';
    console.error(err);
  } finally {
    liveDot.classList.remove('is-live');
  }
}

function setupFilters() {
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      applyFilters();
    });
  });

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    applyFilters();
  });

  timeframePill.addEventListener('click', () => {
    currentTimeframe = currentTimeframe === '15m' ? '1h' : currentTimeframe === '1h' ? '4h' : '15m';
    timeframePill.textContent = currentTimeframe;
    applyFilters();
  });
}

function startTimers() {
  setInterval(() => {
    if (lastLoadedAt) {
      lastUpdatedText.textContent = fmtRelativeTime(lastLoadedAt);
    }
  }, 1000);

  setInterval(() => {
    applyFilters();
  }, NEWS_TICK_MS);

  setInterval(() => {
    loadSignals();
  }, REFRESH_INTERVAL_MS);
}

setupFilters();
loadSignals();
startTimers();
