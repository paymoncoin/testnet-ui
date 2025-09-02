// Define allowed network types
export type Network = "mainnet" | "testnet";

// Active network (change here to switch)
export const ACTIVE_NETWORK: Network = "testnet";

// Addresses mapped by network
export const PAYMON_MINTER_ADDRESS: Record<Network, string> = {
  mainnet: "EQA_Q9VUz3uvJUBEO3YeiRGFB7SjlHmU36F9XMc2_NTjiEUD",
  testnet: "kQC_JIVVHryhbpXYKuUHpS3APB7saNz3oXK1-OBrmrNKa78_",
};

export const USDT_MINTER_ADDRESS: Record<Network, string> = {
  mainnet: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  testnet: "kQD0GKBM8ZbryVk2aESmzfU6b9b_8era_IkvBSELujFZPsyy",
};

export const DEX_ADDRESS: Record<Network, string> = {
  mainnet: "EQDIkwXtd98PNiJFN3GoeaYX4DejoeE8H9TOj71z-3P6Tjg_",
  testnet: "kQBy98-6zjTXgrOhZM6pUDEHPKOgNvKQ6Qu8HA3LaRbSB5rK",
};

// Helper functions
export function getPaymonMinterAddress(): string {
  return PAYMON_MINTER_ADDRESS[ACTIVE_NETWORK];
}

export function getUsdtMinterAddress(): string {
  return USDT_MINTER_ADDRESS[ACTIVE_NETWORK];
}

export function getDexAddress(): string {
  return DEX_ADDRESS[ACTIVE_NETWORK];
}
