import { useTranslation } from 'react-i18next';
import { formattedBalance } from '@/lib/utils';

const InputToken: React.FC<any> = ({payToken, payAmount, wallet, onPayAmountChange, onMaxClick}) => {
    const [t] = useTranslation("global");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!/^\d*\.?\d*$/.test(value)) return;

        // Allow empty input (so the user can clear the field)
        if (value === '') {
            onPayAmountChange('');
            return;
        }

        const numericValue = parseFloat(value);

        if (isNaN(numericValue) || numericValue <= 0) {
            return;
        }

        onPayAmountChange(value);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-xl text-gray-400 my-5">
            <div className="text-sm mb-1 text-start">{t('You pay')}</div>
            <div className="flex items-center justify-between">
                <input
                    className="bg-transparent text-2xl font-medium focus:outline-none w-full"
                    placeholder="0.00"
                    value={payAmount}
                    onChange={handleChange}
                />
                <div className="flex items-center gap-2 ml-2" dir="ltr">
                    {payToken.icon}
                    <span className="font-semibold">{payToken.symbol}</span>
                </div>
            </div>
            <div className="text-sm mt-1 flex gap-4">
                {t('Balance')}: {wallet && formattedBalance(payToken.balance)}
                <button className="text-primary hover:underline" onClick={onMaxClick}>
                    {t('Max')}
                </button>
            </div>
        </div>
    );
};

export default InputToken;
