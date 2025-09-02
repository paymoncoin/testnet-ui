import { TonConnectUIProvider } from '@tonconnect/ui-react';
import SwapUI from './components/SwapUI';

function App() {

    return (
        <TonConnectUIProvider manifestUrl="https://paymon.cash/tonconnect-manifest.json">
            <div className='bg-gray-950 flex flex-col items-center justify-center h-screen text-center'>
                <SwapUI />
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
