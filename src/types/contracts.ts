export type SupportedTokenSymbol = 'USDC' | 'WLD';

export interface RequestItem {
  id: string;
  manager: string;
  title: string;
  description?: string;
  budgetToken: SupportedTokenSymbol;
  budgetAmount: string; // base units as string
  ownerWalletAddress?: string; // wallet that created the request (server persisted)
  createdAt: number;
}

export interface SettlementPreview {
  gross: string; // base units
  commission: string; // base units
  requesterAmount: string; // base units
}


