import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import App from './App.tsx';

import global_en from './translations/en/global.json';
import global_fa from './translations/fa/global.json';

i18next.init({
    lng: 'fa', // if you're using a language detector, do not define the lng option
    fallbackLng: 'fa',
    interpolation: {
        escapeValue: false,
    },
    debug: true,
    resources: {
        en: {
            global: global_en,
        },
        fa: {
            global: global_fa,
        },
    },
});

// function to update html attrs & font
const updateHtmlAttrs = (lng: string) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = i18next.dir(lng);

    // ✅ switch font class based on language
    if (lng === 'fa') {
        document.documentElement.classList.remove('font-inter');
        document.documentElement.classList.add('font-vazir');
    } else {
        document.documentElement.classList.remove('font-vazir');
        document.documentElement.classList.add('font-inter');
    }
};

// set initial
updateHtmlAttrs(i18next.language);

// update when language changes
i18next.on('languageChanged', (lng) => {
    updateHtmlAttrs(lng);
});

// console.log(document.documentElement.dir);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <I18nextProvider i18n={i18next}>
            <App />
        </I18nextProvider>
    </StrictMode>
);
