const API_URL = '/api/signals';

async function loadSignals() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const table = document.querySelector('#scanner-body');
  if (!table) return;

  table.innerHTML = '';

  data.signals
    .filter(s => s.timeframe === '15m')
    .forEach(row => {

      // ✅ RULE 1: ENTRY GATE
      let entryText = 'None';
      let entryStatus = 'None';

      if (row.strength_score >= 70) {
        entryText = row.entry_text || 'None';
        entryStatus = row.entry_status || 'None';
      } else if (row.strength_score >= 65) {
        entryStatus = 'Waiting';
      }

      // ✅ RULE 2: LIVE NEWS COUNTDOWN
      let newsText = row.news_risk || 'No major news';

      if (row.news_event_name && row.news_event_time) {
        const mins = Math.round((new Date(row.news_event_time) - new Date()) / 60000);

        if (mins <= -1) {
          newsText = `${row.news_event_name} passed`;
        } else if (mins <= 0) {
          newsText = `${row.news_event_name} live`;
        } else if (mins < 60) {
          newsText = `${row.news_event_name} in ${mins} min`;
        } else {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          newsText = `${row.news_event_name} in ${h}h ${m}m`;
        }
      }

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${row.symbol}</td>
        <td>${row.asset_class}</td>
        <td>${row.timeframe}</td>
        <td>${row.state}</td>
        <td>${row.strength_score}/100</td>
        <td>${row.volume_status}</td>
        <td>${row.bias_note}</td>
        <td>${newsText}</td>
        <td>${entryText}</td>
        <td>${entryStatus}</td>
      `;

      table.appendChild(tr);
    });
}

// 🔁 Refresh data every 60s
setInterval(loadSignals, 60000);

// 🔁 Update countdown every 30s (NO STICKING)
setInterval(loadSignals, 30000);

// 🚀 Initial load
loadSignals();
