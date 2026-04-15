import { createClient } from '@supabase/supabase-js';

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

function signalAffectedByEvent(row, event) {
  const symbol = row.symbol || '';
  const cls = row.asset_class || '';
  const affected = Array.isArray(event.affected_assets) ? event.affected_assets : [];

  if (affected.includes(symbol)) return true;
  if (affected.includes(cls)) return true;

  const currency = event.currency || '';
  if (!currency) return false;

  if (symbol.includes(`${currency}/`) || symbol.includes(`/${currency}`)) return true;
  if (cls === 'metal' && currency === 'USD') return true;
  if (cls === 'index' && (currency === 'USD' || (currency === 'GBP' && symbol === 'UK100'))) return true;

  return false;
}

export async function handler() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return json(500, { ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const supabase = createClient(url, serviceKey);

    const { data, error } = await supabase
      .from('scanner_signals')
      .select(`
        id,
        asset_id,
        symbol,
        timeframe,
        state,
        strength_score,
        confidence_score,
        confidence_level,
        volume_status,
        bias_note,
        news_risk,
        news_level,
        entry_text,
        entry_status,
        reason,
        is_top_pick,
        updated_at,
        assets!inner(display_name, asset_class, underlying_symbol, is_active, sort_order)
      `)
      .eq('assets.is_active', true)
      .order('is_top_pick', { ascending: false })
      .order('strength_score', { ascending: false });

    if (error) throw error;

    const { data: upcomingNews, error: newsError } = await supabase
      .from('news_events')
      .select('*')
      .in('event_status', ['upcoming', 'live'])
      .gte('event_time', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .lte('event_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .order('event_time', { ascending: true });

    if (newsError) throw newsError;

    const signals = (data || []).map((row) => {
      const flattened = {
        ...row,
        display_name: row.assets?.display_name || row.symbol,
        asset_class: row.assets?.asset_class || 'unknown',
        underlying_symbol: row.assets?.underlying_symbol || null,
        sort_order: row.assets?.sort_order || 9999,
        news_event_name: null,
        news_event_time: null,
        news_event_status: null
      };

      const relevantEvents = (upcomingNews || []).filter((event) => signalAffectedByEvent(flattened, event));
      if (!relevantEvents.length) return flattened;

      const nextEvent = relevantEvents[0];

      return {
        ...flattened,
        news_event_name: nextEvent.event_name || null,
        news_event_time: nextEvent.event_time || null,
        news_event_status: nextEvent.event_status || null,
        news_level: nextEvent.impact_level || flattened.news_level
      };
    });

    return json(200, {
      source: 'supabase',
      generated_at: new Date().toISOString(),
      signals
    });
  } catch (error) {
    return json(500, {
      source: 'error',
      generated_at: new Date().toISOString(),
      error: error.message,
      signals: []
    });
  }
}
 
