// Typed message keys and locales for next-intl (`useAbTranslations`, `getAbTranslations`, `AbLink`...).
import type abI18nConfig from './config';
import type messages from '../messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof abI18nConfig.locales)[number];
    Messages: typeof messages;
  }
}
