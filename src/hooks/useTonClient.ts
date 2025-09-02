import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';
import { useAsyncInitialize } from './useAsyncInitialize';
import { ACTIVE_NETWORK } from '@/lib/contants';

export function useTonClient() {
    const tonClient = useAsyncInitialize(async () => {
    // resolve decentralized endpoint dynamically
    const endpoint = await getHttpEndpoint({
      network: ACTIVE_NETWORK
    });

    // initialize ton client with this endpoint
    return new TonClient({ endpoint });
  });

  return tonClient;
}
