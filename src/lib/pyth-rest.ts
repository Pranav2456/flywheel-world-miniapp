export async function fetchPythUpdateDataREST(priceIds: string[]) {
  const base = process.env.PYTH_HERMES_URL || 'https://hermes.pyth.network';
  // Try fresh updates first
  const tryFetch = async (stale: boolean) => {
    const url = new URL('/v2/updates/price/latest', base);
    for (const id of priceIds) url.searchParams.append('ids[]', id);
    url.searchParams.set('encoding', 'hex');
    if (stale) url.searchParams.set('stale', 'true');
    console.log('[pyth-rest] url', url.toString());
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      console.warn('[pyth-rest] non-200 response', { status: res.status, statusText: res.statusText });
      return [] as string[];
    }
    const json = (await res.json()) as unknown as {
      priceUpdateData?: unknown;
      updateData?: unknown;
      updates?: unknown[];
      [k: string]: unknown;
    };
    // Common shapes observed across Hermes variants
    const priceUpdateData = Array.isArray(json?.priceUpdateData) ? (json.priceUpdateData as string[]) : undefined;
    if (priceUpdateData && priceUpdateData.length) return priceUpdateData;
    const updateData = Array.isArray(json?.updateData) ? (json.updateData as string[]) : undefined;
    if (updateData && updateData.length) return updateData;

    const updates = Array.isArray(json?.updates) ? (json.updates as Array<Record<string, unknown>>) : [];
    if (updates.length) {
      const nested = updates
        .map((u) => (typeof u?.priceUpdateData === 'string' ? (u.priceUpdateData as string) : typeof u?.updateData === 'string' ? (u.updateData as string) : typeof (u as { data?: unknown })?.data === 'string' ? ((u as { data: string }).data as string) : undefined))
        .filter(Boolean) as string[];
      if (nested.length) return nested;
    }
    // Nothing matched
    console.warn('[pyth-rest] empty updates payload shape', { keys: Object.keys(json || {}) });
    return [] as string[];
  };

  let data = await tryFetch(false);
  if (!data.length) data = await tryFetch(true);
  return data;
}


