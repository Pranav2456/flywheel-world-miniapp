export async function fetchPythUpdateDataREST(priceIds: string[]) {
  const base = process.env.PYTH_HERMES_URL || 'https://hermes.pyth.network';
  // Try fresh updates first
  const tryFetch = async (stale: boolean) => {
    const url = new URL('/v2/updates/price/latest', base);
    for (const id of priceIds) url.searchParams.append('ids[]', id);
    url.searchParams.set('encoding', 'hex');
    if (stale) url.searchParams.set('stale', 'true');
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [] as string[];
    const json = await res.json();
    const direct = Array.isArray(json?.priceUpdateData) ? (json.priceUpdateData as string[]) : [];
    if (direct.length) return direct;
    // Fallback: some variants return nested updates
    const updates = Array.isArray(json?.updates) ? (json.updates as any[]) : [];
    const nested = updates
      .map((u) => (typeof u?.priceUpdateData === 'string' ? (u.priceUpdateData as string) : undefined))
      .filter(Boolean) as string[];
    return nested;
  };

  let data = await tryFetch(false);
  if (!data.length) data = await tryFetch(true);
  return data;
}


