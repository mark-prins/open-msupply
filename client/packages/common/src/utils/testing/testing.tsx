import React, { FC, PropsWithChildren, useEffect } from 'react';
import { AppThemeProvider } from '@common/styles';
import { SupportedLocales } from '@common/intl';
import { PropsWithChildrenOnly } from '@common/types';
import mediaQuery from 'css-mediaquery';
import { SnackbarProvider } from 'notistack';
import { QueryClientProvider, QueryClient } from 'react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TableProvider, createTableStore } from '../../ui/layout/tables';
import { GqlProvider } from '../..';
import { Environment } from '@openmsupply-client/config';
import { ConfirmationModalProvider } from '../../ui/components/modals';
import { renderHook } from '@testing-library/react';
import i18next from './i18next';
import { I18nextProvider } from 'react-i18next';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});

interface IntlTestProviderProps {
  locale: SupportedLocales;
}

export const IntlTestProvider: FC<PropsWithChildren<IntlTestProviderProps>> = ({
  children,
  locale,
}) => {
  useEffect(() => {
    i18next.changeLanguage(locale);
  }, [locale]);
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
};

interface TestingRouterProps {
  initialEntries: string[];
}

export const TestingRouter: FC<PropsWithChildren<TestingRouterProps>> = ({
  children,
  initialEntries,
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Routes>{children}</Routes>
  </MemoryRouter>
);

export const TestingRouterContext: FC<PropsWithChildrenOnly> = ({
  children,
}) => (
  <TestingRouter initialEntries={['/testing']}>
    <Route path="/testing" element={<>{children}</>} />
  </TestingRouter>
);

export const TestingProvider: FC<
  PropsWithChildren<{
    locale?: 'en' | 'fr' | 'ar';
  }>
> = ({ children, locale = 'en' }) => (
  <React.Suspense fallback={<span>[suspended]</span>}>
    <QueryClientProvider client={queryClient}>
      <GqlProvider url={Environment.GRAPHQL_URL}>
        <SnackbarProvider maxSnack={3}>
          <IntlTestProvider locale={locale}>
            <TableProvider createStore={createTableStore}>
              <AppThemeProvider>{children}</AppThemeProvider>
            </TableProvider>
          </IntlTestProvider>
        </SnackbarProvider>
      </GqlProvider>
    </QueryClientProvider>
  </React.Suspense>
);

export const StoryProvider: FC<PropsWithChildrenOnly> = ({ children }) => (
  <React.Suspense fallback={<span>?</span>}>
    <QueryClientProvider client={queryClient}>
      <GqlProvider url={Environment.GRAPHQL_URL}>
        <SnackbarProvider maxSnack={3}>
          <IntlTestProvider locale="en">
            <TableProvider createStore={createTableStore}>
              <AppThemeProvider>
                <ConfirmationModalProvider>
                  {children}
                </ConfirmationModalProvider>
              </AppThemeProvider>
            </TableProvider>
          </IntlTestProvider>
        </SnackbarProvider>
      </GqlProvider>
    </QueryClientProvider>
  </React.Suspense>
);

function createMatchMedia(width: number) {
  return (query: any) => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
}

export const setScreenSize_ONLY_FOR_TESTING = (screenSize: number): void => {
  window.matchMedia = createMatchMedia(screenSize);
};

export const renderHookWithProvider = <Props, Result>(
  hook: (props: Props) => Result,
  options?: {
    providerProps?: { locale: 'en' | 'fr' | 'ar' };
  }
) =>
  renderHook(hook, {
    wrapper: ({ children }: { children?: React.ReactNode }) => (
      <TestingProvider {...options?.providerProps}>{children}</TestingProvider>
    ),
  });
