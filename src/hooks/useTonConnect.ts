import { useTonConnectUI, useTonWallet, type Wallet } from '@tonconnect/ui-react';
import { Address, type Sender, type SenderArguments } from '@ton/core';

export function useTonConnect(): {
    sender: Sender;
    walletAddress: Address | null;
    connected: boolean;
    wallet: Wallet | null;
} {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const walletAddress = wallet?.account?.address ? Address.parse(wallet.account.address) : undefined;
    return {
        sender: {
            send: async (args: SenderArguments) => {
                try {
                    await tonConnectUI.sendTransaction({
                        messages: [
                            {
                                address: args.to.toString(),
                                amount: args.value.toString(),
                                payload: args.body?.toBoc().toString('base64'),
                            },
                        ],
                        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
                    });
                } catch {
                    throw new Error('Transaction rejected by user');
                }
            },
        },
        connected: !!wallet,
        wallet,
        walletAddress: walletAddress ?? null,
    };
}
