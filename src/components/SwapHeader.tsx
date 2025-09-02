import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {Wallet2} from "lucide-react";
import LanguageToggle from './LanguageToggle';


const SwapHeader: React.FC<any> = ({onConnect, wallet}) => {
    const [t] = useTranslation('global');
    return (
        <div className="flex justify-between mb-4 items-center">
            <div className="text-2xl font-space font-bold text-gray-100">{t('dexname')}</div>
            <div className="flex gap-2 items-center">
                <Button onClick={onConnect} variant="outline">
                    <Wallet2 className="mr-1" /> {wallet ? t('disconnect') : t('connect')}
                </Button>
                <LanguageToggle />
            </div>
        </div>
    );
};

export default SwapHeader;
