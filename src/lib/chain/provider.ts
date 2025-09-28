export function getWorldChainRpcUrl(): string {
  const url = process.env.WORLDCHAIN_RPC_URL;
  if (!url) {
    throw new Error('WORLDCHAIN_RPC_URL is not set');
  }
  return url;
}

export function getWorldChainId(): number {
  const id = Number(process.env.WORLDCHAIN_CHAIN_ID ?? 480);
  if (!Number.isFinite(id)) {
    throw new Error('WORLDCHAIN_CHAIN_ID is invalid');
  }
  return id;
}


