import { useEffect, useState } from 'react';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, beginCell, type OpenedContract, toNano } from '@ton/core';
import { useTonConnect } from './useTonConnect';
import { toMicro } from '@/lib/utils';
import { useTonWallet } from '@tonconnect/ui-react';
import { getPaymonMinterAddress } from '@/lib/contants';
import { JettonMaster, JettonWallet } from '@ton/ton';
import { storeJettonBurn } from '@/contracts/PaymonMinter';

export function usePaymonContract() {
    const [paymonBalance, setPaymonBalance] = useState<bigint | null>(null);
    const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
    const connectedWallet = useTonWallet();
    const client = useTonClient();
    const { sender, walletAddress } = useTonConnect();

    const paymonContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = JettonMaster.create(Address.parse(getPaymonMinterAddress()));
        return client.open(contract) as OpenedContract<JettonMaster>;
    }, [client, connectedWallet]);

    const paymonWalletContract = useAsyncInitialize(async () => {
        if (!client || !walletAddress || !paymonContract) return;
        const jwAddress = await paymonContract.getWalletAddress(walletAddress);
        return client.open(JettonWallet.create(jwAddress)) as OpenedContract<JettonWallet>;
    }, [client, paymonContract]);

    const refreshPaymonBalance = async (): Promise<bigint> => {
        if (!paymonWalletContract) throw new Error('Wallet contract not ready');
        const balance = await paymonWalletContract.getBalance();
        const _totalSupply = (await paymonContract!.getJettonData()).totalSupply;
        setPaymonBalance(balance);
        setTotalSupply(_totalSupply);
        return balance;
    };

    useEffect(() => {
        if (paymonWalletContract) refreshPaymonBalance();
    }, [paymonWalletContract]);

    useEffect(() => {
        const fetchTotalSupply = async () => {
            if (!paymonContract) return;
            const data = await paymonContract.getJettonData();
            setTotalSupply(data.totalSupply);
        };

        fetchTotalSupply();
    }, [paymonContract]);

    const waitForIrpDeduction = async (previousBalance: bigint, timeout = 100000, maxRetries = 3): Promise<void> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const start = Date.now();
            try {
                await new Promise<void>((resolve, reject) => {
                    const interval = setInterval(async () => {
                        try {
                            const current = await refreshPaymonBalance();
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
                console.warn(`IRP deduction attempt ${attempt} failed:`, err);
                if (attempt < maxRetries) {
                    console.log(`Retrying in 5s...`);
                    await new Promise((res) => setTimeout(res, 5000));
                } else {
                    throw new Error('IRP deduction failed after 3 attempts');
                }
            }
        }
    };

    const waitForIrpDelivery = async (previousBalance: bigint, timeout = 100000, maxRetries = 3): Promise<void> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const start = Date.now();
            try {
                await new Promise<void>((resolve, reject) => {
                    const interval = setInterval(async () => {
                        try {
                            const current = await refreshPaymonBalance();
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
                console.warn(`IRP delivery attempt ${attempt} failed:`, err);
                if (attempt < maxRetries) {
                    console.log(`Retrying in 5s...`);
                    await new Promise((res) => setTimeout(res, 5000));
                } else {
                    throw new Error('IRP delivery failed after 3 attempts');
                }
            }
        }
    };

    const sendBurn = async (amount: string | number) => {
        if (!connectedWallet) {
            throw new Error('Wallet not connected');
        }

        const packedMessage = beginCell()
            .store(
                storeJettonBurn({
                    $$type: 'JettonBurn',
                    queryId: BigInt(Date.now()),
                    amount: toMicro(amount),
                    responseDestination: Address.parse(connectedWallet.account.address),
                    customPayload: null,
                })
            )
            .endCell();
        console.log('PaymonBalance on contract: ', paymonBalance);
        console.log('Sending paymon balance: ', toMicro(amount));
        await sender.send({
            value: toNano('0.1'),
            to: paymonWalletContract!.address!,
            bounce: true,
            body: packedMessage,
        });
    };

    return {
        paymonBalance,
        totalSupply,
        address: paymonContract?.address.toString(),
        refreshPaymonBalance,
        waitForIrpDelivery,
        waitForIrpDeduction,
        sendBurn,
    };
}
