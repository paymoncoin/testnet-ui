import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface MaintenanceScreenProps {
    message: string;
    className?: string;
    title: string
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
    title = 'در دست تعمیر',
    message = 'در حال حاضر به‌دلیل انجام تعمیرات، سرویس در دسترس نیست.',
    className,
}) => {
    return (
        <div
            className={cn(
                'min-h-screen flex flex-col items-center justify-center p-10 text-center',
                className
            )}
        >
            <AlertTriangle className="text-yellow-400 w-16 h-16 mb-3 animate-pulse" />
            <h1 className="text-xl font-semibold mb-6">{title}</h1>
            <p className="max-w-md text-md opacity-80">{message}</p>
        </div>
    );
};

export default MaintenanceScreen;
