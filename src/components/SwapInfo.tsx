import { useTranslation } from "react-i18next";

const SwapInfo: React.FC<any> = ({ dexData, wallet }) => {
    const [t] = useTranslation("global");
    return (
        <div className="text-sm text-gray-400 my-4">
            <div className="flex justify-between">
                <span>{t('currentPrice')}</span>
                <span className="text-primary font-medium" dir="ltr">
                    {dexData && wallet ? `1 USD₮ = ${dexData.priceInUsdt.toLocaleString()} IR₱` : t('N/A')}
                </span>
            </div>
            <div className="flex justify-between mt-2">
                <span>{t('taxRate')}</span>
                <span className="text-primary">
                    {dexData && wallet ? `${(Number(dexData.taxRate) / 10_000_000).toFixed(2)}%` : t('N/A')}
                </span>
            </div>
        </div>
    );
};

export default SwapInfo;
