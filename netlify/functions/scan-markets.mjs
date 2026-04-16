import { createClient } from '@supabase/supabase-js';

const ENGINE_VERSION = 'market-radar-pro-v18-forex-real';
const timeframes = ['15m', '1h', '4h'];

const FOREX_SYMBOLS = new Set([
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'NZD/USD',
  'USD/CAD',
  'EUR/JPY',
  'GBP/JPY',
  'EUR/GBP',
  'EUR/CHF',
  'GBP/CHF',
  'AUD/JPY',
  'NZD/JPY'
]);

const fallbackTemplates = {
  'EUR/USD': { state: 'Bullish', strength_score: 79, confidence_score: 76, confidence_level: 'High', volume_status: 'Rising', bias_note: 'USD Weak', news_risk: 'No major news', news_level: 'medium', entry_text: '1.0842 - 1.0848', entry_status: 'Near', reason: 'Fallback template used because live forex candles were unavailable.' },
  'GBP/USD': { state: 'Consolidating', strength_score: 44, confidence_score: 41, confidence_level: 'Low', volume_status: 'Quiet', bias_note: 'Mixed Sentiment', news_risk: 'No major news', news_level: 'high', entry_text: 'None', entry_status: 'Waiting', reason: 'Fallback template used because live forex candles were unavailable.' },
  'USD/JPY': { state: 'Bearish', strength_score: 74, confidence_score: 72, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'Yen Strength', news_risk: 'No major news', news_level: 'low', entry_text: '154.18 - 154.24', entry_status: 'Valid', reason: 'Fallback template used because live forex candles were unavailable.' },
  'USD/CHF': { state: 'Consolidating', strength_score: 47, confidence_score: 45, confidence_level: 'Low', volume_status: 'Mixed', bias_note: 'No Clear Bias', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Fallback template used because live forex candles were unavailable.' },
  'AUD/USD': { state: 'Bullish', strength_score: 68, confidence_score: 65, confidence_level: 'Medium', volume_status: 'Confirmed', bias_note: 'Commodity Support', news_risk: 'No major news', news_level: 'low', entry_text: '0.6580 - 0.6588', entry_status: 'Triggered', reason: 'Fallback template used because live forex candles were unavailable.' },
  'NZD/USD': { state: 'Bullish', strength_score: 66, confidence_score: 64, confidence_level: 'Medium', volume_status: 'Rising', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '0.6122 - 0.6130', entry_status: 'Valid', reason: 'Fallback template used because live forex candles were unavailable.' },
  'USD/CAD': { state: 'Bearish', strength_score: 71, confidence_score: 69, confidence_level: 'Medium', volume_status: 'Confirmed', bias_note: 'CAD Strength', news_risk: 'No major news', news_level: 'low', entry_text: '1.3564 - 1.3572', entry_status: 'Valid', reason: 'Fallback template used because live forex candles were unavailable.' },
  'EUR/JPY': { state: 'Bullish', strength_score: 76, confidence_score: 73, confidence_level: 'High', volume_status: 'Buying Pressure', bias_note: 'Euro Strength', news_risk: 'No major news', news_level: 'low', entry_text: '168.42 - 168.58', entry_status: 'Valid', reason: 'Fallback template used because live forex candles were unavailable.' },
  'GBP/JPY': { state: 'Bearish', strength_score: 72, confidence_score: 69, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'Pound Weakness', news_risk: 'No major news', news_level: 'low', entry_text: '201.14 - 201.32', entry_status: 'Near', reason: 'Fallback template used because live forex candles were unavailable.' },
  'EUR/GBP': { state: 'Bullish', strength_score: 64, confidence_score: 61, confidence_level: 'Medium', volume_status: 'Weak', bias_note: 'Euro Strength', news_risk: 'No major news', news_level: 'low', entry_text: '0.8540 - 0.8548', entry_status: 'Valid', reason: 'Fallback template used because live forex candles were unavailable.' },
  'EUR/CHF': { state: 'Consolidating', strength_score: 43, confidence_score: 40, confidence_level: 'Low', volume_status: 'Quiet', bias_note: 'Mixed Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Fallback template used because live forex candles were unavailable.' },
  'GBP/CHF': { state: 'Bearish', strength_score: 65, confidence_score: 62, confidence_level: 'Medium', volume_status: 'Fading', bias_note: 'Pound Weakness', news_risk: 'No major news', news_level: 'low', entry_text: '1.1268 - 1.1280', entry_status: 'Near', reason: 'Fallback template used because live forex candles were unavailable.' },
  'AUD/JPY': { state: 'Bullish', strength_score: 73, confidence_score: 70, confidence_level: 'Medium', volume_status: 'Confirmed', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '101.42 - 101.58', entry_status: 'Valid', reason: 'Fallback template used because live forex candles were unavailable.' },
  'NZD/JPY': { state: 'Bullish', strength_score: 69, confidence_score: 66, confidence_level: 'Medium', volume_status: 'Rising', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '93.18 - 93.30', entry_status: 'Valid', reason: 'Fallback template used because live forex candles were unavailable.' },

  'XAU/USD': { state: 'Bullish', strength_score: 88, confidence_score: 86, confidence_level: 'High', volume_status: 'Confirmed', bias_note: 'Weak USD / Metals Bid', news_risk: 'No major news', news_level: 'low', entry_text: '3228 - 3232', entry_status: 'Valid', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'XAG/USD': { state: 'Bullish', strength_score: 72, confidence_score: 70, confidence_level: 'Medium', volume_status: 'Rising', bias_note: 'Metals Bid', news_risk: 'No major news', news_level: 'low', entry_text: '29.64 - 29.71', entry_status: 'Valid', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'BTC/USD': { state: 'Consolidating', strength_score: 39, confidence_score: 37, confidence_level: 'Low', volume_status: 'Mixed', bias_note: 'Mixed Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'ETH/USD': { state: 'Bearish', strength_score: 69, confidence_score: 66, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'Risk-Off Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '3024 - 3038', entry_status: 'Valid', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'SOL/USD': { state: 'Bullish', strength_score: 75, confidence_score: 73, confidence_level: 'High', volume_status: 'Buying Pressure', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '142.6 - 144.0', entry_status: 'Valid', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'XRP/USD': { state: 'Consolidating', strength_score: 46, confidence_score: 44, confidence_level: 'Low', volume_status: 'Quiet', bias_note: 'No Clear Bias', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'US500': { state: 'Bullish', strength_score: 82, confidence_score: 80, confidence_level: 'High', volume_status: 'Confirmed', bias_note: 'Risk-On Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: '5250 - 5260', entry_status: 'Valid', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'NAS100': { state: 'Bullish', strength_score: 85, confidence_score: 83, confidence_level: 'High', volume_status: 'Buying Pressure', bias_note: 'Tech Strength', news_risk: 'No major news', news_level: 'low', entry_text: '18200 - 18250', entry_status: 'Valid', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'US30': { state: 'Consolidating', strength_score: 55, confidence_score: 52, confidence_level: 'Low', volume_status: 'Mixed', bias_note: 'Mixed Sentiment', news_risk: 'No major news', news_level: 'low', entry_text: 'None', entry_status: 'Waiting', reason: 'Fallback template while forex-only real logic is being phased in.' },
  'UK100': { state: 'Bearish', strength_score: 70, confidence_score: 67, confidence_level: 'Medium', volume_status: 'Selling Pressure', bias_note: 'UK Weakness', news_risk: 'No major news', news_level: 'low', entry_text: '7700 - 7720', entry_status: 'Near', reason: 'Fallback template while forex-only real logic is being phased in.' }
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

function formatFxPrice(symbol, value) {
  const decimals = symbol.includes('JPY') ? 3 : 4;
  return Number(value).toFixed(decimals);
}

function ema(values, period) {
  const k = 2 / (period + 1);
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = values[i] * k + result * (1 - k);
  }
  return result;
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
    .filter(v => Number.isFinite(v.open) && Number.isFinite(v.high) && Number.isFinite(v.low) && Number.isFinite(v.close))
    .reverse();
}

async function fetchCandles(symbol, interval, apiKey) {
  const url = new URL('https://api.twelvedata.com/time_series');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', '120');
  url.searchParams.set('timezone', 'UTC');
  url.searchParams.set('apikey', apiKey);

  const res = await fetch(url.toString(), { method: 'GET' });
  const data = await res.json();

  if (!res.ok || data.status === 'error') {
    throw new Error(`Twelve Data ${symbol} ${interval}: ${data.message || 'request failed'}`);
  }

  const candles = parseCandles(data);
  if (candles.length < 60) {
    throw new Error(`Not enough candle data for ${symbol} ${interval}`);
  }

  return candles;
}

function getBiasNote(symbol, state) {
  const [base, quote] = symbol.split('/');

  if (state === 'Bullish') {
    if (quote === 'USD') return 'USD Weak';
    if (base === 'USD') return `${quote} Weak`;
    return `${base} Strength`;
  }

  if (state === 'Bearish') {
    if (quote === 'USD') return `${base} Weak`;
    if (base === 'USD') return 'USD Strength';
    return `${quote} Strength`;
  }

  return 'Mixed Sentiment';
}

function getVolumeStatus(state, momentumRatio, atrRatio) {
  if (state === 'Bullish') {
    if (momentumRatio >= 1.3) return 'Buying Pressure';
    if (atrRatio >= 1.05) return 'Confirmed';
    if (momentumRatio >= 1.0) return 'Rising';
    return 'Weak';
  }

  if (state === 'Bearish') {
    if (momentumRatio >= 1.3) return 'Selling Pressure';
    if (atrRatio >= 1.05) return 'Confirmed';
    if (momentumRatio >= 1.0) return 'Fading';
    return 'Weak';
  }

  if (atrRatio < 0.9) return 'Quiet';
  return 'Mixed';
}

function getConfidenceLevel(score) {
  if (score >= 80) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
}

function applyEntryGate(signal) {
  if ((signal.strength_score || 0) >= 70) return signal;

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

function buildFallbackSignal(asset, timeframe) {
  const base = fallbackTemplates[asset.symbol] || {
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
    reason: 'Default fallback logic.'
  };

  const tfAdjust = timeframe === '15m' ? 0 : timeframe === '1h' ? -4 : -8;

  let signal = {
    asset_id: asset.id,
    symbol: asset.symbol,
    timeframe,
    state: base.state,
    strength_score: clamp(base.strength_score + tfAdjust, 38, 96),
    confidence_score: clamp(base.confidence_score + tfAdjust, 30, 95),
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
    if (signal.entry_status === 'Triggered') signal.entry_status = 'Waiting';
    if (signal.entry_text !== 'None') signal.entry_text = 'Watch 15m for confirmation';
  }

  if (timeframe === '4h') {
    signal.entry_text = 'None';
    signal.entry_status = 'None';
  }

  return applyEntryGate(signal);
}

function buildForexSignal(asset, timeframe, candles15m, candles1h) {
  const candles = timeframe === '15m' ? candles15m : candles1h;
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const ema20 = ema(closes.slice(-30), 20);
  const ema50 = ema(closes.slice(-60), 50);
  const lastBody = Math.abs(last.close - last.open);
  const avgBody10 = averageBody(candles, 10) || lastBody || 0.0001;
  const bodyRatio = lastBody / avgBody10;
  const atr14Value = atr(candles, 14) || Math.abs(last.high - last.low) || 0.0001;
  const avgRange14 = averageRange(candles, 14) || atr14Value;
  const atrRatio = atr14Value / (avgRange14 || 0.0001);

  const prev20High = Math.max(...highs.slice(-21, -1));
  const prev20Low = Math.min(...lows.slice(-21, -1));
  const prev8High = Math.max(...highs.slice(-9, -1));
  const prev8Low = Math.min(...lows.slice(-9, -1));

  const bullishAlignment = last.close > ema20 && ema20 > ema50;
  const bearishAlignment = last.close < ema20 && ema20 < ema50;
  const breakoutUp = last.close > prev8High;
  const breakoutDown = last.close < prev8Low;
  const expansionUp = (last.close > last.open) && bodyRatio >= 1.15;
  const expansionDown = (last.close < last.open) && bodyRatio >= 1.15;

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

  if (bullVotes >= 3 && bullVotes > bearVotes) state = 'Bullish';
  else if (bearVotes >= 3 && bearVotes > bullVotes) state = 'Bearish';

  const h1Closes = candles1h.map(c => c.close);
  const h1Ema20 = ema(h1Closes.slice(-30), 20);
  const h1Ema50 = ema(h1Closes.slice(-60), 50);
  const higherTfBull = candles1h[candles1h.length - 1].close > h1Ema20 && h1Ema20 > h1Ema50;
  const higherTfBear = candles1h[candles1h.length - 1].close < h1Ema20 && h1Ema20 < h1Ema50;

  let trendPoints = 0;
  if (state === 'Bullish' || state === 'Bearish') trendPoints += 24;
  if (bullishAlignment || bearishAlignment) trendPoints += 10;

  let structurePoints = 0;
  if (breakoutUp || breakoutDown) structurePoints += 14;
  else if (state !== 'Consolidating') structurePoints += 7;

  let momentumPoints = 0;
  if (bodyRatio >= 1.4) momentumPoints += 18;
  else if (bodyRatio >= 1.1) momentumPoints += 12;
  else if (bodyRatio >= 0.9) momentumPoints += 7;
  else momentumPoints += 3;

  let volatilityPoints = 0;
  if (atrRatio >= 1.15) volatilityPoints += 12;
  else if (atrRatio >= 1.0) volatilityPoints += 8;
  else volatilityPoints += 4;

  let higherTfPoints = 0;
  if ((state === 'Bullish' && higherTfBull) || (state === 'Bearish' && higherTfBear)) higherTfPoints += 12;
  else if (state !== 'Consolidating') higherTfPoints += 5;

  let sessionPoints = 0;
  const londonHour = getLondonHour();
  if (timeframe === '15m' && londonHour >= 7 && londonHour <= 16) sessionPoints += 8;
  else if (timeframe === '1h') sessionPoints += 4;
  else sessionPoints += 2;

  let strength = trendPoints + structurePoints + momentumPoints + volatilityPoints + higherTfPoints + sessionPoints;
  if (state === 'Consolidating') strength = Math.min(strength, 58);
  strength = clamp(Math.round(strength), 35, 95);

  const confidenceScore = clamp(
    Math.round((trendPoints + structurePoints + higherTfPoints + momentumPoints) / 0.7),
    35,
    95
  );

  const volumeStatus = getVolumeStatus(state, bodyRatio, atrRatio);
  const biasNote = getBiasNote(asset.symbol, state);

  let entryText = 'None';
  let entryStatus = 'None';

  if (timeframe === '15m' && state !== 'Consolidating') {
    if (state === 'Bullish') {
      const zoneLow = Math.min(ema20, last.low);
      const zoneHigh = Math.max(ema20, last.low);
      entryText = `${formatFxPrice(asset.symbol, zoneLow)} - ${formatFxPrice(asset.symbol, zoneHigh)}`;

      if (last.close > zoneHigh + atr14Value * 0.25) entryStatus = 'Triggered';
      else if (last.close >= zoneLow - atr14Value * 0.15) entryStatus = 'Near';
      else entryStatus = 'Valid';
    } else {
      const zoneLow = Math.min(ema20, last.high);
      const zoneHigh = Math.max(ema20, last.high);
      entryText = `${formatFxPrice(asset.symbol, zoneLow)} - ${formatFxPrice(asset.symbol, zoneHigh)}`;

      if (last.close < zoneLow - atr14Value * 0.25) entryStatus = 'Triggered';
      else if (last.close <= zoneHigh + atr14Value * 0.15) entryStatus = 'Near';
      else entryStatus = 'Valid';
    }
  }

  if (timeframe === '1h') {
    entryText = state === 'Consolidating' ? 'None' : 'Watch 15m for confirmation';
    entryStatus = state === 'Consolidating' ? 'Waiting' : 'Waiting';
  }

  if (timeframe === '4h') {
    entryText = 'None';
    entryStatus = 'None';
  }

  let reason = 'Range-bound conditions with no clean directional commitment.';
  if (state === 'Bullish') {
    reason = `Bullish structure with EMA alignment${breakoutUp ? ', breakout acceptance' : ''} and ${volumeStatus.toLowerCase()}.`;
  } else if (state === 'Bearish') {
    reason = `Bearish structure with EMA alignment${breakoutDown ? ', breakdown acceptance' : ''} and ${volumeStatus.toLowerCase()}.`;
  }

  if (timeframe === '1h') {
    reason += ' Higher timeframe context only; refine entry on 15m.';
  }

  if (timeframe === '4h') {
    reason += ' 4H view is directional context only.';
  }

  const signal = {
    asset_id: asset.id,
    symbol: asset.symbol,
    timeframe,
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
    const label = mins <= -1 ? `${next.event_name} passed` : mins <= 0 ? `${next.event_name} live` : `${next.event_name} in ${mins} min`;

    let entryStatus = signal.entry_status;
    if (next.impact_level === 'high' && mins <= 30 && mins >= -1 && signal.timeframe === '15m') {
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

async function buildSignalsForAsset(asset, apiKey) {
  if (!FOREX_SYMBOLS.has(asset.symbol)) {
    return timeframes.map(tf => buildFallbackSignal(asset, tf));
  }

  try {
    const [candles15m, candles1h] = await Promise.all([
      fetchCandles(asset.symbol, '15min', apiKey),
      fetchCandles(asset.symbol, '1h', apiKey)
    ]);

    return [
      buildForexSignal(asset, '15m', candles15m, candles1h),
      buildForexSignal(asset, '1h', candles15m, candles1h),
      buildForexSignal(asset, '4h', candles15m, candles1h)
    ];
  } catch (error) {
    return timeframes.map(tf => {
      const fallback = buildFallbackSignal(asset, tf);
      return {
        ...fallback,
        reason: `${fallback.reason} ${String(error.message || error)}`
      };
    });
  }
}

export async function handler() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;

  if (!url || !serviceKey) {
    return json(500, { ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  if (!twelveDataApiKey) {
    return json(500, { ok: false, error: 'Missing TWELVE_DATA_API_KEY' });
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

    const signalChunks = [];
    for (const asset of assets) {
      const chunk = await buildSignalsForAsset(asset, twelveDataApiKey);
      signalChunks.push(chunk);
    }

    let signals = signalChunks.flat();
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
      updated_at: new Date().toISOString(),
      real_forex_logic: true
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
