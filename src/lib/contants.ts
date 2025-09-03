// Define allowed network types
export type Network = "mainnet" | "testnet";

// Active network (change here to switch)
export const ACTIVE_NETWORK: Network = "testnet";

// Addresses mapped by network
export const PAYMON_MINTER_ADDRESS: Record<Network, string> = {
  mainnet: "EQA_Q9VUz3uvJUBEO3YeiRGFB7SjlHmU36F9XMc2_NTjiEUD",
  testnet: "kQCOlpoR9sBZRE8GGHsn2THqOogCzb5k1_NnYrrM4JHZjcz6",
};

export const USDT_MINTER_ADDRESS: Record<Network, string> = {
  mainnet: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  testnet: "kQBH5njRX28Yv_7gHg0H1Q9GkrtFOMeCmYUPTUV95caDS5iH",
};

export const DEX_ADDRESS: Record<Network, string> = {
  mainnet: "EQDIkwXtd98PNiJFN3GoeaYX4DejoeE8H9TOj71z-3P6Tjg_",
  testnet: "kQACbGUxBHjG3_uc6cebTmelpsMT6SGThb0i2HzMKpVI2RHU",
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
