
// Build V10 - syntax fixed and fallback populated
const fallbackSignals = [
{
    symbol: 'XAU/USD',
    asset_class: 'metal',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 88,
    volume_status: 'Confirmed',
    bias_note: 'Weak USD / Metals Bid',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '3228 - 3232',
    entry_status: 'Valid',
    is_top_pick: true,
    reason: 'Clean bullish continuation with strong participation and no immediate red-folder pressure.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'EUR/USD',
    asset_class: 'forex',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 79,
    volume_status: 'Rising',
    bias_note: 'USD Weak',
    news_risk: 'CPI in 48 min',
    news_level: 'medium',
    entry_text: '1.0842 - 1.0848',
    entry_status: 'Near',
    is_top_pick: false,
    reason: 'Directional pressure is constructive, but upcoming data keeps it below the top rank.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'GBP/USD',
    asset_class: 'forex',
    timeframe: '15m',
    state: 'Consolidating',
    strength_score: 44,
    volume_status: 'Quiet',
    bias_note: 'Mixed Sentiment',
    news_risk: 'High-impact UK event in 18 min',
    news_level: 'high',
    entry_text: 'None',
    entry_status: 'Waiting',
    is_top_pick: false,
    reason: 'Compression dominates and imminent event risk keeps this in stand-aside mode.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'USD/JPY',
    asset_class: 'forex',
    timeframe: '15m',
    state: 'Bearish',
    strength_score: 74,
    volume_status: 'Selling Pressure',
    bias_note: 'Yen Strength',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '154.18 - 154.24',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Breakdown held cleanly below intraday support and sellers controlled the retest.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'AUD/USD',
    asset_class: 'forex',
    timeframe: '1h',
    state: 'Bullish',
    strength_score: 68,
    volume_status: 'Confirmed',
    bias_note: 'Commodity Support',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '0.6580 - 0.6588',
    entry_status: 'Triggered',
    is_top_pick: false,
    reason: 'Trend is constructive, but the ideal zone has already gone.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'NZD/USD',
    asset_class: 'forex',
    timeframe: '1h',
    state: 'Bullish',
    strength_score: 66,
    volume_status: 'Rising',
    bias_note: 'Risk-On Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '0.6122 - 0.6130',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Higher lows remain intact and participation is still building.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'USD/CAD',
    asset_class: 'forex',
    timeframe: '1h',
    state: 'Bearish',
    strength_score: 71,
    volume_status: 'Confirmed',
    bias_note: 'CAD Strength',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '1.3564 - 1.3572',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Price rolled over from supply and downside structure remains clean.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'USD/CHF',
    asset_class: 'forex',
    timeframe: '1h',
    state: 'Consolidating',
    strength_score: 47,
    volume_status: 'Mixed',
    bias_note: 'No Clear Bias',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    is_top_pick: false,
    reason: 'Overlapping candles and conflicting flow keep this neutral.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'EUR/JPY',
    asset_class: 'forex',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 76,
    volume_status: 'Buying Pressure',
    bias_note: 'Euro Strength',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '168.42 - 168.58',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Momentum resumed after a controlled pullback and buyers remain active.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'GBP/JPY',
    asset_class: 'forex',
    timeframe: '15m',
    state: 'Bearish',
    strength_score: 72,
    volume_status: 'Selling Pressure',
    bias_note: 'Pound Weakness',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '201.14 - 201.32',
    entry_status: 'Near',
    is_top_pick: false,
    reason: 'Lower highs remain intact and selling pressure is still visible on retests.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'EUR/GBP',
    asset_class: 'forex',
    timeframe: '1h',
    state: 'Bullish',
    strength_score: 64,
    volume_status: 'Weak',
    bias_note: 'Euro Strength',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '0.8540 - 0.8548',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Bias is positive, but participation is not yet fully convincing.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'EUR/CHF',
    asset_class: 'forex',
    timeframe: '1h',
    state: 'Consolidating',
    strength_score: 43,
    volume_status: 'Quiet',
    bias_note: 'Mixed Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    is_top_pick: false,
    reason: 'Range conditions remain dominant and no clean directional edge is present.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'AUD/JPY',
    asset_class: 'forex',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 73,
    volume_status: 'Confirmed',
    bias_note: 'Risk-On Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '101.42 - 101.58',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Bullish continuation remains orderly with supportive participation.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'NZD/JPY',
    asset_class: 'forex',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 69,
    volume_status: 'Rising',
    bias_note: 'Risk-On Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '93.18 - 93.30',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Trend is constructive and momentum is still building.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'XAG/USD',
    asset_class: 'metal',
    timeframe: '1h',
    state: 'Bullish',
    strength_score: 72,
    volume_status: 'Rising',
    bias_note: 'Metals Bid',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '29.64 - 29.71',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Trend quality is constructive, though still slightly behind gold on total score.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'BTC/USD',
    asset_class: 'crypto',
    timeframe: '15m',
    state: 'Consolidating',
    strength_score: 39,
    volume_status: 'Mixed',
    bias_note: 'Mixed Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    is_top_pick: false,
    reason: 'Range-bound rotation with weak commitment on both sides.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'ETH/USD',
    asset_class: 'crypto',
    timeframe: '1h',
    state: 'Bearish',
    strength_score: 69,
    volume_status: 'Selling Pressure',
    bias_note: 'Risk-Off Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '3024 - 3038',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Lower highs remain intact and rejection into supply is still orderly.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'SOL/USD',
    asset_class: 'crypto',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 75,
    volume_status: 'Buying Pressure',
    bias_note: 'Risk-On Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '142.6 - 144.0',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Relative strength is firm and buyers continue to support dips.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'XRP/USD',
    asset_class: 'crypto',
    timeframe: '15m',
    state: 'Consolidating',
    strength_score: 46,
    volume_status: 'Quiet',
    bias_note: 'No Clear Bias',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    is_top_pick: false,
    reason: 'Price remains trapped inside a narrow range with no clear control.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'US500',
    asset_class: 'index',
    underlying_symbol: 'ES',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 82,
    volume_status: 'Confirmed',
    bias_note: 'Risk-On Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '5250 - 5260',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Strong continuation with broad market support.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'NAS100',
    asset_class: 'index',
    underlying_symbol: 'NQ',
    timeframe: '15m',
    state: 'Bullish',
    strength_score: 85,
    volume_status: 'Buying Pressure',
    bias_note: 'Tech Strength',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '18200 - 18250',
    entry_status: 'Valid',
    is_top_pick: false,
    reason: 'Momentum driven rally with strong participation.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'US30',
    asset_class: 'index',
    underlying_symbol: 'YM',
    timeframe: '15m',
    state: 'Consolidating',
    strength_score: 55,
    volume_status: 'Mixed',
    bias_note: 'Mixed Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    is_top_pick: false,
    reason: 'Range-bound behaviour with no clear direction.',
    updated_at: new Date().toISOString()
  },
{
    symbol: 'UK100',
    asset_class: 'index',
    underlying_symbol: 'UK100',
    timeframe: '15m',
    state: 'Bearish',
    strength_score: 70,
    volume_status: 'Selling Pressure',
    bias_note: 'UK Weakness',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '7700 - 7720',
    entry_status: 'Near',
    is_top_pick: false,
    reason: 'Downside pressure following rejection from highs.',
    updated_at: new Date().toISOString()
  },
];

function expandSignalsAcrossTimeframes(baseSignals) {
  const timeframeProfiles = {
    '15m': { strengthAdjust: 0, entryMode: 'fast' },
    '1h': { strengthAdjust: -4, entryMode: 'swing' },
    '4h': { strengthAdjust: -8, entryMode: 'macro' }
  };

  return baseSignals.flatMap((item) => {
    return Object.entries(timeframeProfiles).map(([tf, profile]) => {
      const clone = { ...item };
      clone.timeframe = tf;

      if (tf === '15m') {
        clone.strength_score = item.strength_score;
        clone.entry_text = item.entry_text;
        clone.entry_status = item.entry_status;
        clone.reason = item.reason;
        return clone;
      }

      clone.strength_score = Math.max(38, Math.min(96, (item.strength_score || 60) + profile.strengthAdjust));

      if (clone.state === 'Consolidating') {
        clone.entry_text = 'None';
        clone.entry_status = tf === '1h' ? 'Waiting' : 'None';
      } else if (tf === '1h') {
        if (clone.entry_status === 'Triggered') clone.entry_status = 'Waiting';
        if (clone.entry_text !== 'None') clone.entry_text = 'Wait for 1H confirmation';
      } else if (tf === '4h') {
        clone.entry_text = 'None';
        clone.entry_status = 'None';
      }

      if (tf === '1h') {
        clone.reason = `${clone.state} structure on 1H with cleaner directional context.`;
      } else if (tf === '4h') {
        clone.reason = `${clone.state} higher-timeframe bias on 4H. Use for direction, not immediate entry.`;
      }

      return clone;
    });
  });
}

const state = {
  asset: 'all',
  timeframe: 'all',
  marketState: 'all',
  validOnly: false,
  topPickOnly: false,
  hideHighRisk: false,
  search: '',
  data: fallbackSignals,
  selectedSymbol: null,
  marketRailAsset: 'all'
};

const summaryGrid = document.getElementById('summaryGrid');
const scannerTableBody = document.getElementById('scannerTableBody');
const topPickContent = document.getElementById('topPickContent');
const boardMeta = document.getElementById('boardMeta');
const liveStatus = document.getElementById('liveStatus');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const template = document.getElementById('summaryCardTemplate');
const marketRail = document.getElementById('marketRail');
const marketRailTabs = document.getElementById('marketRailTabs');

let lastUpdatedAt = null;
let statusTickTimer = null;
let autoRefreshTimer = null;
let newsTickTimer = null;

function startStatusTicker() {
  if (statusTickTimer) clearInterval(statusTickTimer);
  statusTickTimer = setInterval(() => {
    if (!lastUpdatedAt) return;
    setLiveStatus('', `LIVE — ${formatRelative(lastUpdatedAt)}`);
  }, 1000);
}

function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(async () => {
    setLiveStatus('scanning', 'SCANNING MARKETS...');
    try {
      await fetch('/api/refresh', { cache: 'no-store' });
    } catch {
    }
    await loadSignals();
  }, 60000);
}

function startNewsTicker() {
  if (newsTickTimer) clearInterval(newsTickTimer);
  newsTickTimer = setInterval(() => {
    render();
  }, 30000);
}

function formatRelative(ts) {
  if (!ts) return 'Updated just now';
  const diffMs = Math.max(0, Date.now() - new Date(ts).getTime());
  const secs = Math.floor(diffMs / 1000);
  if (secs < 5) return 'Updated just now';
  if (secs < 60) return `Updated ${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins === 1) return 'Updated 1 min ago';
  return `Updated ${mins} mins ago`;
}

function setLiveStatus(mode, text) {
  liveStatus.classList.remove('scanning', 'demo');
  if (mode) liveStatus.classList.add(mode);
  liveStatus.innerHTML = `<span class="live-dot"></span><span class="status-copy">${text}</span>`;
}

function strengthMarkup(score) {
  return `
    <div class="strength-meta">
      <div class="strength-bar"><span class="strength-fill" style="width:${score}%"></span></div>
      <span>${score}/100</span>
    </div>
  `;
}

function stateClassName(marketState) {
  return marketState.toLowerCase();
}

function getAssetClass(item) {
  return item.asset_class || item.type || 'unknown';
}

function getDisplayEntryText(item) {
  return (item.strength_score || 0) >= 70 ? item.entry_text : 'None';
}

function getDisplayEntryStatus(item) {
  return (item.strength_score || 0) >= 70 ? item.entry_status : ((item.strength_score || 0) >= 65 ? 'Waiting' : 'None');
}

function getDisplayNewsRisk(item) {
  if (!item.news_event_name || !item.news_event_time) {
    return item.news_risk;
  }

  const diffMs = new Date(item.news_event_time).getTime() - Date.now();
  const mins = Math.round(diffMs / 60000);

  if (mins <= -1) return `${item.news_event_name} passed`;
  if (mins <= 0) return `${item.news_event_name} live`;
  if (mins === 1) return `${item.news_event_name} in 1 min`;
  if (mins < 60) return `${item.news_event_name} in ${mins} min`;

  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${item.news_event_name} in ${hours}h`;
  return `${item.news_event_name} in ${hours}h ${rem}m`;
}

function getPreferredSelection(data) {
  if (!data.length) return null;
  const stillVisible = data.find(item => item.symbol === state.selectedSymbol && (state.timeframe === 'all' || item.timeframe === state.timeframe));
  if (stillVisible) return stillVisible.symbol;
  const topVisible = data.find(item => item.is_top_pick && (state.timeframe === 'all' || item.timeframe === state.timeframe));
  if (topVisible) return topVisible.symbol;
  return data[0].symbol;
}

function filteredRailData() {
  const source = getFilteredData();
  return source
    .filter(item => state.marketRailAsset === 'all' ? true : getAssetClass(item) === state.marketRailAsset)
    .sort((a, b) => {
      if (a.is_top_pick && !b.is_top_pick) return -1;
      if (!a.is_top_pick && b.is_top_pick) return 1;
      return b.strength_score - a.strength_score;
    });
}

function renderMarketRail() {
  const data = filteredRailData();
  const selectedSymbol = getPreferredSelection(data);
  state.selectedSymbol = selectedSymbol;

  if (!data.length) {
    marketRail.innerHTML = '<div class="muted">No markets match these filters.</div>';
    return;
  }

  marketRail.innerHTML = data.map(item => {
    const selected = item.symbol === selectedSymbol ? 'selected' : '';
    const topPick = item.is_top_pick ? 'top-pick' : '';
    return `
      <button class="market-card ${selected} ${topPick}" data-symbol="${item.symbol}" type="button">
        <span class="market-state-dot ${stateClassName(item.state)}"></span>
        <span class="market-card-main">
          <span class="market-symbol">${item.symbol}</span>
          <span class="market-meta">
            <span>${getAssetClass(item)}</span>
            <span>${item.timeframe}</span>
            <span>${item.volume_status}</span>
          </span>
          <span class="market-state-text">${item.state} · ${item.bias_note}${getAssetClass(item) === 'index' && item.underlying_symbol ? ` · Ref ${item.underlying_symbol}` : ''}</span>
        </span>
        <span class="market-card-side">
          <span class="market-strength">${item.strength_score}</span>
          ${item.is_top_pick ? '<span class="top-pick-tag">Top Pick</span>' : ''}
        </span>
      </button>
    `;
  }).join('');
}

function syncSelectedTableRow() {
  const rows = scannerTableBody.querySelectorAll('tr');
  rows.forEach(row => {
    row.classList.toggle('selected-row', row.dataset.symbol === state.selectedSymbol);
  });
}

function bindMarketRail() {
  marketRailTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.market-tab');
    if (!btn) return;
    marketRailTabs.querySelectorAll('.market-tab').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    state.marketRailAsset = btn.dataset.value;
    render();
  });

  marketRail.addEventListener('click', (e) => {
    const card = e.target.closest('.market-card');
    if (!card) return;
    state.selectedSymbol = card.dataset.symbol;
    renderMarketRail();
    syncSelectedTableRow();
    const row = scannerTableBody.querySelector(`tr[data-symbol="${CSS.escape(state.selectedSymbol)}"]`);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function getFilteredData() {
  return state.data.filter(item => {
    if (state.asset !== 'all' && getAssetClass(item) !== state.asset) return false;
    if (state.timeframe !== 'all' && item.timeframe !== state.timeframe) return false;
    if (state.marketState !== 'all' && item.state !== state.marketState) return false;
    if (state.validOnly && getDisplayEntryStatus(item) !== 'Valid') return false;
    if (state.topPickOnly && !item.is_top_pick) return false;
    if (state.hideHighRisk && item.news_level === 'high') return false;
    if (state.search && !item.symbol.toLowerCase().includes(state.search.toLowerCase())) return false;
    return true;
  });
}

function renderSummary(data) {
  const counts = {
    Bullish: data.filter(x => x.state === 'Bullish').length,
    Bearish: data.filter(x => x.state === 'Bearish').length,
    Consolidating: data.filter(x => x.state === 'Consolidating').length,
    HighNews: data.filter(x => x.news_level === 'high').length,
  };

  const cards = [
    ['Bullish Markets', counts.Bullish],
    ['Bearish Markets', counts.Bearish],
    ['Consolidating', counts.Consolidating],
    ['High News Risk', counts.HighNews],
  ];

  summaryGrid.innerHTML = '';
  cards.forEach(([label, value]) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.summary-label').textContent = label;
    node.querySelector('.summary-value').textContent = value;
    summaryGrid.appendChild(node);
  });
}

function renderTopPick(data) {
  const top = data.find(item => item.is_top_pick) || data.slice().sort((a, b) => b.strength_score - a.strength_score)[0];
  if (!top) {
    topPickContent.innerHTML = '<p class="muted">No standout market available.</p>';
    return;
  }

  const topEntryText = getDisplayEntryText(top);
  const topEntryStatus = getDisplayEntryStatus(top);
  const topNewsRisk = getDisplayNewsRisk(top);

  topPickContent.innerHTML = `
    <div class="top-pick-symbol">
      <div class="symbol-badge">${top.symbol.replace('/USD', '').slice(0, 3)}</div>
      <div class="top-pick-main">
        <h3>${top.symbol}</h3>
        <span class="state-pill ${top.state.toLowerCase()}">${top.state}</span>
      </div>
    </div>
    <div class="top-pick-grid">
      <div class="metric-box"><p>Strength</p><p>${top.strength_score}/100</p></div>
      <div class="metric-box"><p>Volume</p><p>${top.volume_status}</p></div>
      <div class="metric-box"><p>News Risk</p><p>${topNewsRisk}</p></div>
      <div class="metric-box"><p>Suggested Entry</p><p>${topEntryText}</p></div>
      <div class="metric-box"><p>Entry Status</p><p>${topEntryStatus}</p></div>
      <div class="metric-box"><p>Bias</p><p>${top.bias_note}</p></div>
    </div>
    <div class="top-pick-reason">${top.reason}</div>
  `;
}

function renderTable(data) {
  const selectedSymbol = getPreferredSelection(data);
  state.selectedSymbol = selectedSymbol;

  scannerTableBody.innerHTML = data.map(item => {
    const displayEntryText = getDisplayEntryText(item);
    const displayEntryStatus = getDisplayEntryStatus(item);
    const displayNewsRisk = getDisplayNewsRisk(item);

    const statusClass = displayEntryStatus.toLowerCase();
    const newsClass = item.news_level;
    const pickCell = item.is_top_pick ? '<span class="pick-pill top">Top Pick</span>' : '';
    const rowClass = item.is_top_pick ? 'green-ring-row' : '';
    const selectedClass = item.symbol === selectedSymbol ? 'selected-row' : '';

    return `
      <tr class="${rowClass} ${selectedClass}" data-symbol="${item.symbol}">
        <td>
          <div class="symbol-cell">
            <span class="inline-state-dot ${stateClassName(item.state)}"></span>
            <span>${item.symbol}${getAssetClass(item) === 'index' && item.underlying_symbol ? ` <span class="underlying-chip">${item.underlying_symbol}</span>` : ''}</span>
          </div>
        </td>
        <td><span class="asset-pill">${getAssetClass(item)}</span></td>
        <td>${item.timeframe}</td>
        <td><span class="state-pill ${item.state.toLowerCase()}">${item.state}</span></td>
        <td>${strengthMarkup(item.strength_score)}</td>
        <td>${item.volume_status}</td>
        <td>${item.bias_note}</td>
        <td><span class="news-pill ${newsClass}">${displayNewsRisk}</span></td>
        <td>${displayEntryText}</td>
        <td><span class="status-pill ${statusClass}">${displayEntryStatus}</span></td>
        <td>${pickCell}</td>
      </tr>
    `;
  }).join('');

  boardMeta.textContent = `${data.length} market${data.length === 1 ? '' : 's'} shown${state.timeframe !== 'all' ? ` • ${state.timeframe} view` : ''}`;
}

function render() {
  const filtered = getFilteredData();
  const renderSet = filtered;
  renderSummary(renderSet);
  renderTopPick(renderSet);
  renderTable(renderSet);
  renderMarketRail();
  syncSelectedTableRow();
}

function wirePillGroup(id, stateKey) {
  const el = document.getElementById(id);
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    [...el.querySelectorAll('.pill')].forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    state[stateKey] = btn.dataset.value;
    render();
  });
}

function bindFilters() {
  wirePillGroup('assetFilter', 'asset');
  wirePillGroup('timeframeFilter', 'timeframe');
  wirePillGroup('stateFilter', 'marketState');

  document.getElementById('validOnlyFilter').addEventListener('change', (e) => { state.validOnly = e.target.checked; render(); });
  document.getElementById('topPickOnlyFilter').addEventListener('change', (e) => { state.topPickOnly = e.target.checked; render(); });
  document.getElementById('hideHighRiskFilter').addEventListener('change', (e) => { state.hideHighRisk = e.target.checked; render(); });
  searchInput.addEventListener('input', (e) => { state.search = e.target.value.trim(); render(); });

  document.getElementById('clearFilters').addEventListener('click', () => {
    state.asset = 'all';
    state.timeframe = 'all';
    state.marketState = 'all';
    state.validOnly = false;
    state.topPickOnly = false;
    state.hideHighRisk = false;
    state.search = '';
    state.selectedSymbol = null;
    state.marketRailAsset = 'all';
    searchInput.value = '';
    ['assetFilter', 'timeframeFilter', 'stateFilter'].forEach(id => {
      const pills = document.getElementById(id).querySelectorAll('.pill');
      pills.forEach((p, idx) => p.classList.toggle('active', idx === 0));
    });
    ['validOnlyFilter', 'topPickOnlyFilter', 'hideHighRiskFilter'].forEach(id => document.getElementById(id).checked = false);
    marketRailTabs.querySelectorAll('.market-tab').forEach((tab, idx) => tab.classList.toggle('active', idx === 0));
    render();
  });
}

async function loadSignals(showRefreshState = false) {
  if (showRefreshState) setLiveStatus('scanning', 'SCANNING MARKETS...');

  try {
    const res = await fetch('/api/signals', { cache: 'no-store' });
    if (!res.ok) throw new Error('Signal endpoint unavailable');
    const payload = await res.json();

    if (Array.isArray(payload.signals) && payload.signals.length) {
      state.data = Array.isArray(payload.signals) ? payload.signals : [];
      lastUpdatedAt = payload.generated_at || new Date().toISOString();
    } else {
      state.data = expandSignalsAcrossTimeframes(fallbackSignals);
      lastUpdatedAt = new Date().toISOString();
      setLiveStatus('demo', 'DEMO DATA — scanner table empty');
    }
  } catch (error) {
    state.data = expandSignalsAcrossTimeframes(fallbackSignals);
    lastUpdatedAt = new Date().toISOString();
    setLiveStatus('demo', 'DEMO DATA — API error');
  }

  const visibleNow = state.data.filter(item => state.timeframe === 'all' ? true : item.timeframe === state.timeframe);
  if (!visibleNow.find(item => item.symbol === state.selectedSymbol)) {
    const preferred = visibleNow.find(item => item.is_top_pick) || visibleNow[0] || state.data[0];
    state.selectedSymbol = preferred ? preferred.symbol : null;
  }

  setLiveStatus('', `LIVE — ${formatRelative(lastUpdatedAt)}`);
  render();
}

refreshBtn.addEventListener('click', async () => {
  setLiveStatus('scanning', 'SCANNING MARKETS...');
  refreshBtn.disabled = true;
  try {
    await fetch('/api/refresh', { cache: 'no-store' });
  } catch {
  }
  await loadSignals(true);
  refreshBtn.disabled = false;
});

bindFilters();
bindMarketRail();
startStatusTicker();
startAutoRefresh();
startNewsTicker();
loadSignals(true);
