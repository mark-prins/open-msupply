import React, { useEffect } from 'react';
import {
  useTranslation,
  LoadingButton,
  useHostContext,
  SaveIcon,
  ErrorWithDetails,
} from '@openmsupply-client/common';
import { LoginTextInput } from '../Login/LoginTextInput';
import { InitialiseLayout } from './InitialiseLayout';
import { useInitialiseForm } from './hooks';
import { SyncProgress } from '../SyncProgress';

export const Initialise = () => {
  const t = useTranslation('app');
  const { setPageTitle } = useHostContext();

  const {
    isValid,
    isLoading,
    isInitialising,
    password,
    url,
    username,
    onInitialise,
    onRetry,
    setPassword,
    setUsername,
    setUrl,
    siteCredentialsError: error,
    syncStatus,
  } = useInitialiseForm();

  useEffect(() => {
    setPageTitle(`${t('app.initialise')} | ${t('app')} `);
  }, []);

  const isInputDisabled = isInitialising || isLoading;

  return (
    <InitialiseLayout
      UsernameInput={
        <LoginTextInput
          fullWidth
          label={t('label.settings-username')}
          value={username}
          disabled={isInputDisabled}
          onChange={e => setUsername(e.target.value)}
          inputProps={{
            autoComplete: 'username',
            autoCapitalize: 'off',
          }}
          autoFocus
        />
      }
      PasswordInput={
        <LoginTextInput
          fullWidth
          label={t('label.settings-password')}
          type="password"
          value={password}
          disabled={isInputDisabled}
          onChange={e => setPassword(e.target.value)}
          inputProps={{
            autoComplete: 'current-password',
            autoCapitalize: 'off',
          }}
        />
      }
      UrlInput={
        <LoginTextInput
          fullWidth
          label={t('label.settings-url')}
          value={url}
          disabled={isInputDisabled}
          onChange={e => setUrl(e.target.value)}
        />
      }
      SyncProgress={
        <SyncProgress syncStatus={syncStatus} isOperational={false} />
      }
      Button={
        <LoadingButton
          isLoading={isLoading}
          onClick={isInitialising ? onRetry : onInitialise}
          variant="outlined"
          startIcon={<SaveIcon />}
          disabled={
            !isValid &&
            !isInitialising /* isValid would be false if isInitialising since password is emptied out */
          }
        >
          {/* Retry will only be shown when not loading and is initialised (when sync error occured) */}
          {isInitialising ? t('button.retry') : t('button.initialise')}
        </LoadingButton>
      }
      ErrorMessage={error && <ErrorWithDetails {...error} />}
      onInitialise={async () => {
        /* onInitialise from layout only happens on form key event, form is disabled when isInitialising */
        if (isValid) await onInitialise();
      }}
    />
  );
};
