import { ArrowUpDown, Loader2 } from 'lucide-react';
import InputToken from './InputToken';
import OutputToken from './OutputToken';
import SwapHeader from './SwapHeader';
import SwapInfo from './SwapInfo';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { formattedBalance } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'sonner';
import { useIsConnectionRestored, useTonConnectModal, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { SiTether } from 'react-icons/si';
import { useDexContract } from '@/hooks/useDexContract';
import { useUsdtContract } from '@/hooks/useUsdtContract';
import { usePaymonContract } from '@/hooks/usePaymonContract';
import PaymonIcon from './PaymonIcon';
import Loading from './Loading';
import MaintenanceScreen from './Maintenance';

const SwapUI = () => {
    const [t] = useTranslation('global');
    const onSwapDirection = () => {
        setIsUsdtPaying(!isUsdtPaying);
        setPayAmount('');
    };
    const [isLoading, setIsLoading] = useState(false);

    const { open } = useTonConnectModal();
    const wallet = useTonWallet();
    const connectionRestored = useIsConnectionRestored();
    const [tonConnectUI] = useTonConnectUI();
    const [commissionAmount, setCommissionAmount] = useState<number | null>(null);
    const [payAmount, setPayAmount] = useState('');
    const [receiveAmount, setReceiveAmount] = useState('');
    const [isUsdtPaying, setIsUsdtPaying] = useState(true);

    const { dexData, refreshDexData } = useDexContract();
    const { usdtBalance, sendTransfer, waitForUsdtDelivery, refreshUsdtBalance } = useUsdtContract();
    const { paymonBalance, sendBurn, waitForIrpDelivery, refreshPaymonBalance } = usePaymonContract();

    const usdtToken = {
        symbol: t('usdt'),
        icon: <SiTether className="text-green-600 text-xl" />,
        // balance: formattedUsdtBalance,
        balance: usdtBalance,
    };
    const paymonToken = {
        symbol: t('irp'),
        icon: <PaymonIcon size={22} />,
        // balance: formattedPaymonBalance,
        balance: paymonBalance,
    };

    const payToken = isUsdtPaying ? usdtToken : paymonToken;
    const getToken = isUsdtPaying ? paymonToken : usdtToken;

    const numericPayAmount = parseFloat(payAmount);
    const numericBalance = parseFloat((Number(payToken.balance) / 1_000_000).toFixed(2));
    const isAmountInvalid =
        !payAmount ||
        isNaN(numericPayAmount) || 
        numericPayAmount <= 0 ||
        (numericPayAmount > numericBalance)
        ;

    const isSwapDisabled = (wallet && isAmountInvalid) || isLoading;

    const handleWalletConnect = async () => {
        if (wallet) {
            await tonConnectUI.disconnect();
        } else {
            open();
        }
    };

    useEffect(() => {
        if (!dexData || !payAmount) {
            setReceiveAmount('');
            setCommissionAmount(null);
            return;
        }

        const input = parseFloat(payAmount.replace(/,/g, ''));
        if (isNaN(input)) {
            setReceiveAmount('');
            setCommissionAmount(null);
            return;
        }

        const taxRate = Number(dexData.taxRate);
        const price = Number(dexData.priceInUsdt);

        if (isUsdtPaying) {
            // Paying in USDT, receiving IR₱
            const commission = (input * taxRate) / 1_000_000_000;
            const netAmount = input - commission;
            const result = netAmount * price;

            setCommissionAmount(commission);
            setReceiveAmount(Math.floor(result).toLocaleString()); // formatted IR₱
        } else {
            // Paying in IR₱, receiving USDT
            const grossUsdt = input / price;
            const commission = (grossUsdt * taxRate) / 1_000_0000_000;
            const netUsdt = grossUsdt - commission;

            setCommissionAmount(commission);
            setReceiveAmount(Number(netUsdt.toFixed(2)).toLocaleString()); // formatted USDT
        }
    }, [payAmount, isUsdtPaying, dexData]);

    if (!connectionRestored || !dexData) {
        return <Loading message={t('loading')} />;
    }

    if (dexData?.stopped) {
        return <MaintenanceScreen title={t('maintenanceTitle')} message={t('maintenanceMessage')} />;
    }

    const refreshAll = async () => {
        await refreshDexData();
        await refreshUsdtBalance();
        await refreshPaymonBalance();
    };

    const handleSwap = async () => {
        if (!wallet) {
            open();
        } else {
            if (!payAmount || Number(payAmount) <= 0) return;
            try {
                const amount = payAmount.replace(/,/g, '');
                setIsLoading(true);
                if (isUsdtPaying) {
                    const previous = paymonBalance ?? 0n;
                    await sendTransfer(amount); // This sends USDT to DEX
                    await waitForIrpDelivery(previous);
                    await refreshUsdtBalance();
                    toast.success(t('swapsuccess'));
                } else {
                    const previous = usdtBalance ?? 0n;
                    await sendBurn(amount);
                    await waitForUsdtDelivery(previous);
                    toast.success(t('swapsuccess'));
                }
            } catch (err) {
                toast.error(t('swaperror'));
            } finally {
                await refreshAll();
                setPayAmount('');
                setIsLoading(false);
            }
        }
    };
    
    return (
        <div className="w-full bg-gray-900 p-3.5 border-gray-800 border-2 max-w-md rounded-2xl shadow-2xl">
            <Toaster offset="10vh" richColors expand={false} position="top-center" />
            <SwapHeader onConnect={handleWalletConnect} wallet={wallet} />
            <InputToken
                payToken={payToken}
                payAmount={payAmount}
                wallet={wallet}
                onPayAmountChange={setPayAmount}
                onMaxClick={() => setPayAmount(formattedBalance(payToken.balance))}
            />
            <div className="flex justify-center">
                <button
                    onClick={onSwapDirection}
                    className="bg-gray-800 p-2 rounded-full text-gray-400 hover:bg-gray-700 cursor-pointer"
                >
                    <ArrowUpDown className="w-6 h-6" />
                </button>
            </div>
            <OutputToken token={getToken} amount={receiveAmount} commissionAmount={commissionAmount} />
            <SwapInfo dexData={dexData} wallet={wallet} />
            <Button
                className="w-full mt-4 text-lg font-bold py-6 rounded-xl"
                disabled={isSwapDisabled}
                onClick={handleSwap}
            >
                {isLoading && <Loader2 className="animate-spin mr-2" />}
                {!wallet
                    ? t('connectWallet')
                    : isLoading
                    ? t('pleaseWait')
                    : t('swap')}
            </Button>
        </div>
    );
};

export default SwapUI;
