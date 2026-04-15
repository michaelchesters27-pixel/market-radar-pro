import { createClient } from '@supabase/supabase-js';

const ENGINE_VERSION = 'market-radar-pro-v16-fixed';
const timeframes = ['15m', '1h', '4h'];

const templates = {
  'XAU/USD': { state: 'Bullish', strength_score: 88, confidence_score: 86, confidence_level: 'High', volume_status: 'Confirmed', bias_note: 'Weak USD / Metals Bid', news_risk: 'No major news', news_level: 'low', entry_text: '3228 - 3232', entry_status: 'Valid', reason: 'Clean bullish continuation with strong participation and no immediate red-folder pressure.' },
  'EUR/USD': { state: 'Bullish', strength_score: 79, confidence_score: 76, confidence_level: 'High', volume_status: 'Rising', bias_note: 'USD Weak', news_risk: 'CPI in 48 min', news_level: 'medium', entry_text: '1.0842 - 1.0848', entry_status: 'Near', reason: 'Directional pressure is constructive, but upcoming data keeps it below the top rank.' },
  'GBP/USD': { state: 'Consolidating', strength_score: 44, confidence_score: 41, confidence_level: 'Low', volume_status: 'Quiet', bias_note: 'Mixed Sentiment', news_risk: 'High-impact UK event in 18 min', news_level: 'high', entry_text: 'None', entry_status: 'Waiting', reason: 'Compression dominates and imminent event risk keeps this in stand-aside mode.' },
  'USD/JPY': { state: 'Bearish', strength_score: 74, confidence_score: 72, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'Yen Strength', news_risk: 'No major news', news_level: 'low', entry_text: '154.18 - 154.24', entry_status: 'Valid', reason: 'Breakdown held cleanly below intraday support and sellers controlled the retest.' },
  'USD/CHF': { state: 'Consolidating', strength_score: 47, confidence_score: 45, confidence_level: 'Low', volume_status: 'Mixed', bias_note: 'No Clear Bias', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Overlapping candles and conflicting flow keep this neutral.' },
  'AUD/USD': { state: 'Bullish', strength_score: 68, confidence_score: 65, confidence_level: 'Medium', volume_status: 'Confirmed', bias_note: 'Commodity Support', news_risk: 'No major news', news_level: 'low', entry_text: '0.6580 - 0.6588', entry_status: 'Triggered', reason: 'Trend is constructive, but the ideal zone has already gone.' },
  'NZD/USD': { state: 'Bullish', strength_score: 66, confidence_score: 64, confidence_level: 'Medium', volume_status: 'Rising', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '0.6122 - 0.6130', entry_status: 'Valid', reason: 'Higher lows remain intact and participation is still building.' },
  'USD/CAD': { state: 'Bearish', strength_score: 71, confidence_score: 69, confidence_level: 'Medium', volume_status: 'Confirmed', bias_note: 'CAD Strength', news_risk: 'No major news', news_level: 'low', entry_text: '1.3564 - 1.3572', entry_status: 'Valid', reason: 'Price rolled over from supply and downside structure remains clean.' },
  'EUR/JPY': { state: 'Bullish', strength_score: 76, confidence_score: 73, confidence_level: 'High', volume_status: 'Buying Pressure', bias_note: 'Euro Strength', news_risk: 'No major news', news_level: 'low', entry_text: '168.42 - 168.58', entry_status: 'Valid', reason: 'Momentum resumed after a controlled pullback and buyers remain active.' },
  'GBP/JPY': { state: 'Bearish', strength_score: 72, confidence_score: 69, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'Pound Weakness', news_risk: 'No major news', news_level: 'low', entry_text: '201.14 - 201.32', entry_status: 'Near', reason: 'Lower highs remain intact and selling pressure is still visible on retests.' },
  'EUR/GBP': { state: 'Bullish', strength_score: 64, confidence_score: 61, confidence_level: 'Medium', volume_status: 'Weak', bias_note: 'Euro Strength', news_risk: 'No major news', news_level: 'low', entry_text: '0.8540 - 0.8548', entry_status: 'Valid', reason: 'Bias is positive, but participation is not yet fully convincing.' },
  'EUR/CHF': { state: 'Consolidating', strength_score: 43, confidence_score: 40, confidence_level: 'Low', volume_status: 'Quiet', bias_note: 'Mixed Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Range conditions remain dominant and no clean directional edge is present.' },
  'GBP/CHF': { state: 'Bearish', strength_score: 65, confidence_score: 62, confidence_level: 'Medium', volume_status: 'Fading', bias_note: 'Pound Weakness', news_risk: 'No major news', news_level: 'low', entry_text: '1.1268 - 1.1280', entry_status: 'Near', reason: 'Pressure remains lower, but conviction is softer than the stronger bearish pairs.' },
  'AUD/JPY': { state: 'Bullish', strength_score: 73, confidence_score: 70, confidence_level: 'Medium', volume_status: 'Confirmed', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '101.42 - 101.58', entry_status: 'Valid', reason: 'Bullish continuation remains orderly with supportive participation.' },
  'NZD/JPY': { state: 'Bullish', strength_score: 69, confidence_score: 66, confidence_level: 'Medium', volume_status: 'Rising', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '93.18 - 93.30', entry_status: 'Valid', reason: 'Trend is constructive and momentum is still building.' },
  'XAG/USD': { state: 'Bullish', strength_score: 72, confidence_score: 70, confidence_level: 'Medium', volume_status: 'Rising', bias_note: 'Metals Bid', news_risk: 'No major news', news_level: 'low', entry_text: '29.64 - 29.71', entry_status: 'Valid', reason: 'Trend quality is constructive, though still slightly behind gold on total score.' },
  'BTC/USD': { state: 'Consolidating', strength_score: 39, confidence_score: 37, confidence_level: 'Low', volume_status: 'Mixed', bias_note: 'Mixed Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Range-bound rotation with weak commitment on both sides.' },
  'ETH/USD': { state: 'Bearish', strength_score: 69, confidence_score: 66, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'Risk-Off Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '3024 - 3038', entry_status: 'Valid', reason: 'Lower highs remain intact and rejection into supply is still orderly.' },
  'SOL/USD': { state: 'Bullish', strength_score: 75, confidence_score: 73, confidence_level: 'High', volume_status: 'Buying Pressure', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '142.6 - 144.0', entry_status: 'Valid', reason: 'Relative strength is firm and buyers continue to support dips.' },
  'XRP/USD': { state: 'Consolidating', strength_score: 46, confidence_score: 44, confidence_level: 'Low', volume_status: 'Quiet', bias_note: 'No Clear Bias', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Price remains trapped inside a narrow range with no clear control.' },
  'US500': { state: 'Bullish', strength_score: 82, confidence_score: 80, confidence_level: 'High', volume_status: 'Confirmed', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '5250 - 5260', entry_status: 'Valid', reason: 'Strong continuation with broad market support.' },
  'NAS100': { state: 'Bullish', strength_score: 85, confidence_score: 83, confidence_level: 'High', volume_status: 'Buying Pressure', bias_note: 'Tech Strength', news_risk: 'No major news', news_level: 'low', entry_text: '18200 - 18250', entry_status: 'Valid', reason: 'Momentum driven rally with strong participation.' },
  'US30': { state: 'Consolidating', strength_score: 55, confidence_score: 52, confidence_level: 'Low', volume_status: 'Mixed', bias_note: 'Mixed Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Range-bound behaviour with no clear direction.' },
  'UK100': { state: 'Bearish', strength_score: 70, confidence_score: 67, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'UK Weakness', news_risk: 'No major news', news_level: 'low', entry_text: '7700 - 7720', entry_status: 'Near', reason: 'Downside pressure following rejection from highs.' }
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

function minutesUntil(iso) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
}

function buildSignal(asset, timeframe) {
  const base = templates[asset.symbol] || {
    state: 'Consolidating',
    strength_score: 50,
    confidence_score: 50,
    confidence_level: 'Low',
    volume_status: 'Mixed',
    bias_note: 'No Clear Bias',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    reason: 'Default placeholder logic.'
  };

  const tfAdjust = timeframe === '15m' ? 0 : timeframe === '1h' ? -4 : -8;

  const signal = {
    asset_id: asset.id,
    symbol: asset.symbol,
    timeframe,
    state: base.state,
    strength_score: Math.max(38, Math.min(96, base.strength_score + tfAdjust)),
    confidence_score: Math.max(30, Math.min(95, base.confidence_score + tfAdjust)),
    confidence_level: timeframe === '15m' ? base.confidence_level : timeframe === '1h' ? 'Medium' : 'Low',
    volume_status: base.volume_status,
    bias_note: base.bias_note,
    news_risk: base.news_risk,
    news_level: base.news_level,
    entry_text: base.entry_text,
    entry_status: base.entry_status,
    reason: base.reason,
    is_top_pick: false
  };

  if (timeframe === '1h') {
    signal.entry_status = signal.entry_status === 'Valid' ? 'Waiting' : signal.entry_status;
    signal.entry_text = signal.entry_text === 'None' ? 'None' : 'Watch 15m for confirmation';
    signal.reason = `${signal.reason} Higher timeframe supportive, but entry is refined on 15m.`;
  }

  if (timeframe === '4h') {
    signal.entry_status = 'None';
    signal.entry_text = 'None';
    signal.reason = `${signal.reason} Context only on 4H. Use for direction, not immediate entry.`;
  }

  return signal;
}

function eventAffectsSignal(signal, event) {
  const symbol = signal.symbol;
  const affectedAssets = Array.isArray(event.affected_assets) ? event.affected_assets : [];
  if (affectedAssets.includes(symbol)) return true;

  const currency = event.currency || '';
  if (!currency) return false;

  if (symbol.includes(`${currency}/`) || symbol.includes(`/${currency}`)) return true;
  if (symbol.startsWith('XAU/') || symbol.startsWith('XAG/')) return currency === 'USD';
  if (['US500', 'NAS100', 'US30'].includes(symbol)) return currency === 'USD';
  if (symbol === 'UK100') return currency === 'GBP' || currency === 'USD';

  return false;
}

function applyNews(signals, newsEvents) {
  return signals.map((signal) => {
    const relevant = (newsEvents || []).filter((event) => eventAffectsSignal(signal, event));
    if (!relevant.length) return signal;

    const next = relevant[0];
    const mins = minutesUntil(next.event_time);
    const label = mins <= 0 ? `${next.event_name} live` : `${next.event_name} in ${mins} min`;

    let entryStatus = signal.entry_status;
    if (next.impact_level === 'high' && mins <= 30 && signal.timeframe === '15m') {
      entryStatus = 'Waiting';
    }

    return {
      ...signal,
      news_risk: label,
      news_level: next.impact_level || signal.news_level,
      entry_status: entryStatus
    };
  });
}

function markTopPick(signals, minScore) {
  signals.forEach((row) => {
    row.is_top_pick = false;
  });

  const pick = signals
    .filter((row) =>
      row.timeframe === '15m' &&
      row.entry_status === 'Valid' &&
      row.news_level !== 'high' &&
      row.state !== 'Consolidating' &&
      row.strength_score >= minScore
    )
    .sort((a, b) => b.strength_score - a.strength_score)[0];

  if (pick) pick.is_top_pick = true;
  return pick?.symbol || null;
}

export async function handler() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return json(500, { ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const supabase = createClient(url, serviceKey);

    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, symbol, asset_class')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (assetsError) throw assetsError;

    const { data: settingsRows, error: settingsError } = await supabase
      .from('scanner_settings')
      .select('*')
      .eq('is_active', true)
      .limit(1);
    if (settingsError) throw settingsError;
    const settings = settingsRows?.[0] || { top_pick_min_score: 75 };

    const { data: newsEvents, error: newsError } = await supabase
      .from('news_events')
      .select('*')
      .in('event_status', ['upcoming', 'live'])
      .gte('event_time', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .lte('event_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .order('event_time', { ascending: true });
    if (newsError) throw newsError;

    const { data: runRows, error: runStartError } = await supabase
      .from('scanner_runs')
      .insert([{
        status: 'running',
        assets_scanned: 0,
        engine_version: ENGINE_VERSION,
        notes: 'Scheduled/manual scan started'
      }])
      .select('id')
      .limit(1);
    if (runStartError) throw runStartError;
    const runId = runRows[0].id;

    let signals = assets.flatMap((asset) => timeframes.map((tf) => buildSignal(asset, tf)));
    signals = applyNews(signals, newsEvents || []);
    const topPickSymbol = markTopPick(signals, settings.top_pick_min_score || 75);
    signals = signals.map((row) => ({ ...row, scan_run_id: runId }));

    const upsertRows = signals.map((row) => ({
      asset_id: row.asset_id,
      symbol: row.symbol,
      timeframe: row.timeframe,
      state: row.state,
      strength_score: row.strength_score,
      confidence_score: row.confidence_score,
      confidence_level: row.confidence_level,
      volume_status: row.volume_status,
      bias_note: row.bias_note,
      news_risk: row.news_risk,
      news_level: row.news_level,
      entry_text: row.entry_text,
      entry_status: row.entry_status,
      reason: row.reason,
      is_top_pick: row.is_top_pick,
      scan_run_id: row.scan_run_id
    }));

    const { error: upsertError } = await supabase
      .from('scanner_signals')
      .upsert(upsertRows, { onConflict: 'asset_id,timeframe' });
    if (upsertError) throw upsertError;

    const { error: historyError } = await supabase
      .from('signal_history')
      .insert(upsertRows.map((row) => ({ ...row })));
    if (historyError) throw historyError;

    const { error: runEndError } = await supabase
      .from('scanner_runs')
      .update({
        status: 'completed',
        assets_scanned: assets.length,
        top_pick_symbol: topPickSymbol,
        completed_at: new Date().toISOString()
      })
      .eq('id', runId);
    if (runEndError) throw runEndError;

    return json(200, {
      ok: true,
      mode: 'supabase',
      run_id: runId,
      scanned_assets: assets.length,
      signal_rows: upsertRows.length,
      top_pick_symbol: topPickSymbol,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    try {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('scanner_runs').insert([{
        status: 'failed',
        assets_scanned: 0,
        engine_version: ENGINE_VERSION,
        notes: String(error.message || error)
      }]);
    } catch {}

    return json(500, {
      ok: false,
      error: error.message || 'Unknown scanner error'
    });
  }
}

