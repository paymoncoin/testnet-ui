import { useEffect, useState } from 'react';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonClient } from './useTonClient';
import { Address, beginCell, JettonMaster, JettonWallet, type OpenedContract, toNano } from '@ton/ton';
import { useTonConnect } from './useTonConnect';
import { storeJettonTransfer } from '../contracts/dex';
import { toMicro } from '../lib/utils';
import { getDexAddress, getUsdtMinterAddress } from '@/lib/contants';

export function useUsdtContract() {
    const [usdtBalance, setUsdtBalance] = useState<bigint | null>(null);
    const client = useTonClient();
    const { sender, walletAddress, wallet } = useTonConnect();

    const usdtContract = useAsyncInitialize(async () => {
        if (!client || !wallet) return;
        const contract = JettonMaster.create(Address.parse(getUsdtMinterAddress()));
        return client.open(contract) as OpenedContract<JettonMaster>;
    }, [client, wallet]);

    const usdtWalletContract = useAsyncInitialize(async () => {
        if (!client || !walletAddress || !usdtContract) return;
        const jwAddress = await usdtContract.getWalletAddress(walletAddress);
        return client.open(JettonWallet.create(jwAddress)) as OpenedContract<JettonWallet>;
    }, [client, usdtContract]);

    const refreshUsdtBalance = async (): Promise<bigint> => {
        if (!usdtWalletContract) throw new Error('Wallet contract not ready');
        const balance = await usdtWalletContract.getBalance();
        setUsdtBalance(balance);
        return balance;
    };

    useEffect(() => {
        async function fetchUsdtBalance() {
            if (!usdtWalletContract) return;
            try {
                const balance = await usdtWalletContract.getBalance();
                setUsdtBalance(balance);
            } catch (error) {
                console.error('Failed to fetch USDT wallet balance:', error);
            }
        }
        if (usdtWalletContract) {
            fetchUsdtBalance();
        }
    }, [usdtWalletContract]);

    const waitForUsdtDeduction = async (previousBalance: bigint, timeout = 100000, maxRetries = 3): Promise<void> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const start = Date.now();
            try {
                await new Promise<void>((resolve, reject) => {
                    const interval = setInterval(async () => {
                        try {
                            const current = await refreshUsdtBalance();
                            if (current < previousBalance) {
                                clearInterval(interval);
                                return resolve();
                            }
                            if (Date.now() - start > timeout) {
                                clearInterval(interval);
                                return reject(new Error('Timeout'));
                            }
                        } catch (err) {
                            clearInterval(interval);
                            return reject(err);
                        }
                    }, 5000);
                });
                return;
            } catch (err) {
                console.warn(`USDT deduction attempt ${attempt} failed:`, err);
                if (attempt < maxRetries) {
                    console.log(`Retrying in 5s...`);
                    await new Promise((res) => setTimeout(res, 5000));
                } else {
                    throw new Error('USDT deduction failed after 3 attempts');
                }
            }
        }
    };

    const waitForUsdtDelivery = async (previousBalance: bigint, timeout = 100000, maxRetries = 3): Promise<void> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const start = Date.now();
            try {
                await new Promise<void>((resolve, reject) => {
                    const interval = setInterval(async () => {
                        try {
                            const current = await refreshUsdtBalance();
                            if (current > previousBalance) {
                                clearInterval(interval);
                                return resolve();
                            }
                            if (Date.now() - start > timeout) {
                                clearInterval(interval);
                                return reject(new Error('Timeout'));
                            }
                        } catch (err) {
                            clearInterval(interval);
                            return reject(err);
                        }
                    }, 5000); // Poll every 5s
                });
                // ✅ Success
                return;
            } catch (err) {
                console.warn(`USDT delivery attempt ${attempt} failed:`, err);
                if (attempt < maxRetries) {
                    console.log(`Retrying in 5s...`);
                    await new Promise((res) => setTimeout(res, 5000));
                } else {
                    throw new Error('USDT delivery failed after 3 attempts');
                }
            }
        }
    };

    return {
        usdtBalance,
        refreshUsdtBalance,
        waitForUsdtDelivery,
        waitForUsdtDeduction,
        sendTransfer: async (amount: string | number) => {
            if (!wallet) {
                throw new Error('Wallet no connected');
            }
            const forwardTonAmount = toNano('0.05');
            const forwardPayload = beginCell().storeUint(0, 1).endCell().asSlice();
            const packedMessage = beginCell()
                .store(
                    storeJettonTransfer({
                        $$type: 'JettonTransfer',
                        queryId: BigInt(Date.now()),
                        amount: toMicro(amount),
                        destination: Address.parse(getDexAddress()),
                        responseDestination: Address.parse(wallet.account.address),
                        customPayload: null,
                        forwardTonAmount,
                        forwardPayload,
                    })
                )
                .endCell();
            await sender.send({
                value: toNano('0.1'),
                to: usdtWalletContract!.address!,
                bounce: true,
                body: packedMessage,
            });
        },
    };
}
