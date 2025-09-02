import { type OpenedContract, WalletContractV4, WalletContractV5R1 } from '@ton/ton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toMicro(value: string | number): bigint {
    const num = Number(value);
    if (isNaN(num)) {
        throw new Error('Invalid input: not a number');
    }

    // Multiply using decimal then convert to bigint for precision
    return BigInt(Math.floor(num * 1_000_000));
}

export async function sleep(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

export async function waitForSeqno(wallet: OpenedContract<WalletContractV4 | WalletContractV5R1>) {
    const seqnoBefore = await wallet.getSeqno();

    return async () => {
        for (let attempt = 0; attempt < 25; attempt++) {
            await sleep(3000);
            const seqnoAfter = await wallet.getSeqno();
            if (seqnoAfter > seqnoBefore) return;
        }
        throw new Error('Timeout');
    };
}

function floorToFixed(num: number, digits: number): number {
    const factor = Math.pow(10, digits);
    return Math.floor(num * factor) / factor;
}

export const formattedBalance = (balance: bigint | null): string =>
    balance
        ? floorToFixed(Number(balance) / 1_000_000, 2).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '0.00';
