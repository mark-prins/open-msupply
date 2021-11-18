import React, { FC, useEffect } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { SupportedLocales, useI18N } from './intlHelpers';
import { resources } from './locales';

interface IntlTestProviderProps {
  locale: SupportedLocales;
}

export const IntlTestProvider: FC<IntlTestProviderProps> = ({
  children,
  locale,
}) => {
  const i18n = useI18N();

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
