import { createClient } from '@supabase/supabase-js';

const ENGINE_VERSION = 'market-radar-pro-v20-indices-15m-search';
const SCAN_TIMEFRAME = '15m';
const INDEX_SYMBOLS = ['NAS100', 'US500', 'UK100', 'US30'];

const SEARCH_HINTS = {
  NAS100: ['Nasdaq 100', 'NDX', 'Nasdaq-100'],
  US500: ['S&P 500', 'SPX', 'S&P500'],
  UK100: ['FTSE 100', 'FTSE'],
  US30: ['Dow Jones', 'DJI', 'Dow Jones Industrial Average']
};

const FALLBACKS = {
  NAS100: {
    state: 'Bullish',
    strength_score: 85,
    confidence_score: 83,
    confidence_level: 'High',
    volume_status: 'Buying Pressure',
    bias_note: 'Tech Strength',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '18200 - 18250',
    entry_status: 'Valid',
    reason: 'Fallback template used because live index candles were unavailable.'
  },
  US500: {
    state: 'Bullish',
    strength_score: 82,
    confidence_score: 80,
    confidence_level: 'High',
    volume_status: 'Confirmed',
    bias_note: 'Risk-On Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '5250 - 5260',
    entry_status: 'Valid',
    reason: 'Fallback template used because live index candles were unavailable.'
  },
  UK100: {
    state: 'Bearish',
    strength_score: 70,
    confidence_score: 67,
    confidence_level: 'Medium',
    volume_status: 'Selling Pressure',
    bias_note: 'UK Weakness',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: '7700 - 7720',
    entry_status: 'Near',
    reason: 'Fallback template used because live index candles were unavailable.'
  },
  US30: {
    state: 'Consolidating',
    strength_score: 55,
    confidence_score: 52,
    confidence_level: 'Low',
    volume_status: 'Mixed',
    bias_note: 'Mixed Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    reason: 'Fallback template used because live index candles were unavailable.'
  }
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ema(values, period) {
  const k = 2 / (period + 1);
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = values[i] * k + result * (1 - k);
  }
  return result;
}

function averageBody(candles, length = 10) {
  const sample = candles.slice(-length);
  if (!sample.length) return 0;
  return sample.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / sample.length;
}

function averageRange(candles, length = 14) {
  const sample = candles.slice(-length);
  if (!sample.length) return 0;
  return sample.reduce((sum, c) => sum + (c.high - c.low), 0) / sample.length;
}

function atr(candles, period = 14) {
  if (candles.length < period + 1) return 0;
  const trs = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trs.push(tr);
  }
  const sample = trs.slice(-period);
  return sample.reduce((a, b) => a + b, 0) / sample.length;
}

function parseCandles(payload) {
  const values = Array.isArray(payload?.values) ? payload.values : [];
  return values
    .map(v => ({
      datetime: v.datetime,
      open: Number(v.open),
      high: Number(v.high),
      low: Number(v.low),
      close: Number(v.close)
    }))
    .filter(v =>
      Number.isFinite(v.open) &&
      Number.isFinite(v.high) &&
      Number.isFinite(v.low) &&
      Number.isFinite(v.close)
    )
    .reverse();
}

async function twelveGet(url) {
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.message || 'Twelve Data request failed');
  }
  return data;
}

function scoreSearchMatch(result, appSymbol) {
  const hay = `${result.symbol || ''} ${result.instrument_name || ''} ${result.exchange || ''} ${result.country || ''}`.toLowerCase();
  const hints = (SEARCH_HINTS[appSymbol] || []).map(x => x.toLowerCase());

  let score = 0;

  for (const hint of hints) {
    if (hay.includes(hint)) score += 5;
  }

  if ((result.instrument_type || '').toLowerCase().includes('index')) score += 8;
  if ((result.exchange || '').toLowerCase().includes('index')) score += 2;
  if ((result.country || '').toLowerCase().includes('united states') && appSymbol !== 'UK100') score += 2;
  if ((result.country || '').toLowerCase().includes('united kingdom') && appSymbol === 'UK100') score += 3;

  return score;
}

async function resolveTwelveSymbol(appSymbol, apiKey) {
  const url = new URL('https://api.twelvedata.com/symbol_search');
  url.searchParams.set('symbol', SEARCH_HINTS[appSymbol]?.[0] || appSymbol);
  url.searchParams.set('apikey', apiKey);

  const data = await twelveGet(url.toString());
  const items = Array.isArray(data.data) ? data.data : [];

  if (!items.length) {
    throw new Error(`No symbol search results for ${appSymbol}`);
  }

  const ranked = items
    .map(item => ({ ...item, _score: scoreSearchMatch(item, appSymbol) }))
    .sort((a, b) => b._score - a._score);

  const best = ranked[0];

  if (!best?.symbol) {
    throw new Error(`Could not resolve Twelve Data symbol for ${appSymbol}`);
  }

  return best.symbol;
}

async function fetchCandles(resolvedSymbol, interval, apiKey) {
  const url = new URL('https://api.twelvedata.com/time_series');
  url.searchParams.set('symbol', resolvedSymbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', '120');
  url.searchParams.set('timezone', 'UTC');
  url.searchParams.set('apikey', apiKey);

  const data = await twelveGet(url.toString());
  const candles = parseCandles(data);

  if (candles.length < 60) {
    throw new Error(`Not enough candles for ${resolvedSymbol} ${interval}`);
  }

  return candles;
}

function minutesUntil(iso) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

function getLondonHour(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    hour12: false
  });
  return Number(fmt.format(date));
}

function getBiasNote(symbol, state) {
  if (state === 'Bullish') {
    if (symbol === 'NAS100') return 'Tech Strength';
    if (symbol === 'US500') return 'Risk-On Sentiment';
    if (symbol === 'US30') return 'Industrial Bid';
    if (symbol === 'UK100') return 'UK Equity Strength';
  }

  if (state === 'Bearish') {
    if (symbol === 'NAS100') return 'Tech Weakness';
    if (symbol === 'US500') return 'Risk-Off Sentiment';
    if (symbol === 'US30') return 'Industrial Weakness';
    if (symbol === 'UK100') return 'UK Weakness';
  }

  return 'Mixed Sentiment';
}

function getVolumeStatus(state, bodyRatio, rangeRatio) {
  if (state === 'Bullish') {
    if (bodyRatio >= 1.3) return 'Buying Pressure';
    if (rangeRatio >= 1.05) return 'Confirmed';
    if (bodyRatio >= 1.0) return 'Rising';
    return 'Weak';
  }

  if (state === 'Bearish') {
    if (bodyRatio >= 1.3) return 'Selling Pressure';
    if (rangeRatio >= 1.05) return 'Confirmed';
    if (bodyRatio >= 1.0) return 'Fading';
    return 'Weak';
  }

  if (rangeRatio < 0.9) return 'Quiet';
  return 'Mixed';
}

function getConfidenceLevel(score) {
  if (score >= 80) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
}

function applyEntryGate(signal) {
  if ((signal.strength_score || 0) >= 70) {
    return signal;
  }

  if ((signal.strength_score || 0) >= 65) {
    return {
      ...signal,
      entry_text: 'None',
      entry_status: 'Waiting',
      reason: `${signal.reason} Entry hidden because strength is below 70.`
    };
  }

  return {
    ...signal,
    entry_text: 'None',
    entry_status: 'None',
    reason: `${signal.reason} Entry hidden because strength is below 70.`
  };
}

function buildFallbackSignal(asset) {
  const base = FALLBACKS[asset.symbol] || {
    state: 'Consolidating',
    strength_score: 50,
    confidence_score: 50,
    confidence_level: 'Low',
    volume_status: 'Mixed',
    bias_note: 'Mixed Sentiment',
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: 'None',
    entry_status: 'Waiting',
    reason: 'Default fallback logic.'
  };

  return applyEntryGate({
    asset_id: asset.id,
    symbol: asset.symbol,
    timeframe: SCAN_TIMEFRAME,
    state: base.state,
    strength_score: base.strength_score,
    confidence_score: base.confidence_score,
    confidence_level: base.confidence_level,
    volume_status: base.volume_status,
    bias_note: base.bias_note,
    news_risk: base.news_risk,
    news_level: base.news_level,
    entry_text: base.entry_text,
    entry_status: base.entry_status,
    reason: base.reason,
    is_top_pick: false
  });
}

function buildIndexSignal(asset, candles) {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const ema20 = ema(closes.slice(-30), 20);
  const ema50 = ema(closes.slice(-60), 50);
  const atr14Value = atr(candles, 14) || Math.abs(last.high - last.low) || 1;
  const avgRange14 = averageRange(candles, 14) || atr14Value;
  const avgBody10 = averageBody(candles, 10) || Math.abs(last.close - last.open) || 1;
  const lastBody = Math.abs(last.close - last.open);
  const bodyRatio = lastBody / avgBody10;
  const rangeRatio = atr14Value / avgRange14;

  const prev8High = Math.max(...highs.slice(-9, -1));
  const prev8Low = Math.min(...lows.slice(-9, -1));

  const bullishAlignment = last.close > ema20 && ema20 > ema50;
  const bearishAlignment = last.close < ema20 && ema20 < ema50;
  const breakoutUp = last.close > prev8High;
  const breakoutDown = last.close < prev8Low;
  const expansionUp = last.close > last.open && bodyRatio >= 1.1;
  const expansionDown = last.close < last.open && bodyRatio >= 1.1;

  let state = 'Consolidating';

  const bullVotes = [
    bullishAlignment,
    breakoutUp,
    expansionUp,
    last.low > prev.low
  ].filter(Boolean).length;

  const bearVotes = [
    bearishAlignment,
    breakoutDown,
    expansionDown,
    last.high < prev.high
  ].filter(Boolean).length;

  if (bullVotes >= 3 && bullVotes > bearVotes) {
    state = 'Bullish';
  } else if (bearVotes >= 3 && bearVotes > bullVotes) {
    state = 'Bearish';
  }

  let trendPoints = 0;
  if (state === 'Bullish' || state === 'Bearish') trendPoints += 24;
  if (bullishAlignment || bearishAlignment) trendPoints += 10;

  let structurePoints = 0;
  if (breakoutUp || breakoutDown) structurePoints += 14;
  else if (state !== 'Consolidating') structurePoints += 7;

  let momentumPoints = 0;
  if (bodyRatio >= 1.4) momentumPoints += 18;
  else if (bodyRatio >= 1.15) momentumPoints += 12;
  else if (bodyRatio >= 0.95) momentumPoints += 7;
  else momentumPoints += 3;

  let volatilityPoints = 0;
  if (rangeRatio >= 1.15) volatilityPoints += 12;
  else if (rangeRatio >= 1.0) volatilityPoints += 8;
  else volatilityPoints += 4;

  let sessionPoints = 0;
  const londonHour = getLondonHour();
  if (londonHour >= 7 && londonHour <= 16) sessionPoints += 8;
  else sessionPoints += 4;

  let strength = trendPoints + structurePoints + momentumPoints + volatilityPoints + sessionPoints;
  if (state === 'Consolidating') strength = Math.min(strength, 58);
  strength = clamp(Math.round(strength), 35, 95);

  const confidenceScore = clamp(
    Math.round((trendPoints + structurePoints + momentumPoints + sessionPoints) / 0.65),
    35,
    95
  );

  const volumeStatus = getVolumeStatus(state, bodyRatio, rangeRatio);
  const biasNote = getBiasNote(asset.symbol, state);

  let entryText = 'None';
  let entryStatus = 'None';

  if (state !== 'Consolidating') {
    if (state === 'Bullish') {
      const zoneLow = Math.min(ema20, last.low);
      const zoneHigh = Math.max(ema20, last.low);
      entryText = `${zoneLow.toFixed(2)} - ${zoneHigh.toFixed(2)}`;

      if (last.close > zoneHigh + atr14Value * 0.2) entryStatus = 'Triggered';
      else if (last.close >= zoneLow - atr14Value * 0.1) entryStatus = 'Near';
      else entryStatus = 'Valid';
    } else {
      const zoneLow = Math.min(ema20, last.high);
      const zoneHigh = Math.max(ema20, last.high);
      entryText = `${zoneLow.toFixed(2)} - ${zoneHigh.toFixed(2)}`;

      if (last.close < zoneLow - atr14Value * 0.2) entryStatus = 'Triggered';
      else if (last.close <= zoneHigh + atr14Value * 0.1) entryStatus = 'Near';
      else entryStatus = 'Valid';
    }
  }

  let reason = 'Range-bound conditions with no clean directional commitment.';
  if (state === 'Bullish') {
    reason = `Bullish index structure with EMA alignment${breakoutUp ? ', breakout acceptance' : ''} and ${volumeStatus.toLowerCase()}.`;
  } else if (state === 'Bearish') {
    reason = `Bearish index structure with EMA alignment${breakoutDown ? ', breakdown acceptance' : ''} and ${volumeStatus.toLowerCase()}.`;
  }

  const signal = {
    asset_id: asset.id,
    symbol: asset.symbol,
    timeframe: SCAN_TIMEFRAME,
    state,
    strength_score: strength,
    confidence_score: confidenceScore,
    confidence_level: getConfidenceLevel(confidenceScore),
    volume_status: volumeStatus,
    bias_note: biasNote,
    news_risk: 'No major news',
    news_level: 'low',
    entry_text: entryText,
    entry_status: entryStatus,
    reason,
    is_top_pick: false
  };

  return applyEntryGate(signal);
}

function eventAffectsSignal(signal, event) {
  const affectedAssets = Array.isArray(event.affected_assets) ? event.affected_assets : [];
  if (affectedAssets.includes(signal.symbol)) return true;

  const currency = event.currency || '';
  if (!currency) return false;

  if (['NAS100', 'US500', 'US30'].includes(signal.symbol)) return currency === 'USD';
  if (signal.symbol === 'UK100') return currency === 'GBP' || currency === 'USD';

  return false;
}

function applyNews(signals, newsEvents) {
  return signals.map((signal) => {
    const relevant = (newsEvents || []).filter((event) => eventAffectsSignal(signal, event));
    if (!relevant.length) return signal;

    const next = relevant[0];
    const mins = minutesUntil(next.event_time);
    const label =
      mins <= -1
        ? `${next.event_name} passed`
        : mins <= 0
          ? `${next.event_name} live`
          : `${next.event_name} in ${mins} min`;

    let entryStatus = signal.entry_status;
    if (next.impact_level === 'high' && mins <= 30 && mins >= -1) {
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
  signals.forEach(row => {
    row.is_top_pick = false;
  });

  const pick = signals
    .filter(row =>
      row.timeframe === SCAN_TIMEFRAME &&
      row.entry_status === 'Valid' &&
      row.news_level !== 'high' &&
      row.state !== 'Consolidating' &&
      row.strength_score >= minScore
    )
    .sort((a, b) => b.strength_score - a.strength_score)[0];

  if (pick) pick.is_top_pick = true;
  return pick?.symbol || null;
}

async function buildSignalForAsset(asset, apiKey) {
  try {
    const resolvedSymbol = await resolveTwelveSymbol(asset.symbol, apiKey);
    await delay(250);
    const candles = await fetchCandles(resolvedSymbol, '15min', apiKey);
    return buildIndexSignal(asset, candles);
  } catch (error) {
    const fallback = buildFallbackSignal(asset);
    return {
      ...fallback,
      reason: `${fallback.reason} ${String(error.message || error)}`
    };
  }
}

export async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  if (!twelveDataApiKey) {
    return json(500, { ok: false, error: 'Missing TWELVE_DATA_API_KEY' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, symbol, asset_class')
      .in('symbol', INDEX_SYMBOLS)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (assetsError) throw assetsError;
    if (!assets || !assets.length) {
      throw new Error('No active index assets found in assets table');
    }

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
        notes: 'Indices-only 15m scan started'
      }])
      .select('id')
      .limit(1);

    if (runStartError) throw runStartError;
    const runId = runRows[0].id;

    const signals = [];
    for (const asset of assets) {
      const signal = await buildSignalForAsset(asset, twelveDataApiKey);
      signals.push(signal);
      await delay(500);
    }

    let finalSignals = applyNews(signals, newsEvents || []);
    const topPickSymbol = markTopPick(finalSignals, settings.top_pick_min_score || 75);
    finalSignals = finalSignals.map(row => ({
      ...row,
      scan_run_id: runId
    }));

    const upsertRows = finalSignals.map(row => ({
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
      .insert(upsertRows.map(row => ({ ...row })));

    if (historyError) throw historyError;

    const { error: cleanupError } = await supabase
      .from('scanner_signals')
      .delete()
      .in('symbol', INDEX_SYMBOLS)
      .neq('timeframe', SCAN_TIMEFRAME);

    if (cleanupError) {
      console.warn('Cleanup warning:', cleanupError.message);
    }

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
      engine_version: ENGINE_VERSION,
      scanned_assets: assets.length,
      timeframe: SCAN_TIMEFRAME,
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
