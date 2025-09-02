import { useEffect, useState } from 'react';
import { useTonClient } from './useTonClient';
import { Dex } from '@/contracts/dex';
import { Address } from '@ton/core';
import { getDexAddress } from '@/lib/contants';
import { useAsyncInitialize } from './useAsyncInitialize';

type DexData = {
    usdtWalletAddress: Address;
    owner: Address;
    manager: Address;
    usdtBalance: bigint;
    stopped: boolean;
    lockedUsdt: bigint;
    paymonMinterAddress: Address;
    taxRate: bigint;
    priceInUsdt: bigint;
    availableUsdt: bigint;
}

export function useDexContract() {
    const client = useTonClient();
    const [dexData, setDexData] = useState<DexData | null>(null);
    const [availableUsdt, setAvailableUsdt] = useState<bigint | null>(null);

    const dexContract = useAsyncInitialize(async () => {
        if (!client) return;
        return client.open(Dex.fromAddress(Address.parse(getDexAddress())));
    }, [client]);

    const refreshDexData = async () => {
        if (!dexContract) return;
        const data = await dexContract.getDexData();
        const withdrawableUsdtBalance = data.availableUsdt;
        setDexData(data);
        setAvailableUsdt(withdrawableUsdtBalance);
    };

    useEffect(() => {
        async function getDexData() {
            if (!dexContract) return;
            const data = await dexContract.getDexData();
            const withdrawableUsdtBalance = data.availableUsdt;
            setDexData(data);
            setAvailableUsdt(withdrawableUsdtBalance);
        }

        getDexData();
    }, [dexContract]);

    return {
        dexData,
        availableUsdt,
        refreshDexData,
    }
}
