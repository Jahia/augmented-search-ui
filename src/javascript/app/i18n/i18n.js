import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {appLanguageBundle} from './resources';

i18n.use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources: appLanguageBundle,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    });
export default i18n;
