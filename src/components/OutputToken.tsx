import { useTranslation } from "react-i18next";

const OutputToken: React.FC<any> = ({token, amount, commissionAmount}) => {
  const [t] = useTranslation("global");
    return (
        <div className="bg-gray-800 p-4 rounded-xl mt-4 text-gray-400">
            <div className="text-zinc-400 text-sm mb-1 text-start">{t('youReceive')}</div>
            <div className="flex items-center justify-between">
                <div className="text-2xl font-medium">{amount || '0'}</div>
                <div className="flex items-center gap-2 ml-2" dir="ltr">
                    {token.icon}
                    <span className="font-semibold">{token.symbol}</span>
                </div>
            </div>
            <div className="text-sm mt-1 text-start">
                <span>{t('Total Commission')}: </span>
                <span className="font-bold text-pretty">
                    {commissionAmount !== null ? commissionAmount.toFixed(2) + ' $' : '0.00'}
                </span>
            </div>
        </div>
    );
};

export default OutputToken;
