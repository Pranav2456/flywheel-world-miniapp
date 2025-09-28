import PythOracleJson from '@/abi/PythOracle.json';

export const PythOracleAbi = PythOracleJson as unknown as readonly { type: string }[];

// Minimal ABI for the core Pyth contract (getUpdateFee)
export const PythCoreAbi = [
  {
    type: 'function',
    name: 'getUpdateFee',
    stateMutability: 'view',
    inputs: [{ name: 'updateData', type: 'bytes[]' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;


