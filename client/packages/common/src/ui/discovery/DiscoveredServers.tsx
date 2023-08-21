import { ButtonWithIcon, IconButton, InlineSpinner } from '@common/components';
import {
  ConnectionResult,
  FrontEndHost,
  frontEndHostDiscoveryGraphql,
  frontEndHostDisplay,
  useNativeClient,
  useNotification,
} from '@common/hooks';
import {
  AlertIcon,
  CheckboxEmptyIcon,
  ExternalLinkIcon,
  HomeIcon,
  RefreshIcon,
} from '@common/icons';
import { useTranslation } from '@common/intl';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import React from 'react';
import { GqlProvider, useInitialisationStatus } from '../../api';
import { InitialisationStatusType } from '@common/types';
import { useMutation } from 'react-query';

type ConnectToServer = ReturnType<typeof useNativeClient>['connectToServer'];

type DiscoverServersProps = {
  servers: FrontEndHost[];
  connect: ConnectToServer;
  discoveryTimedOut: boolean;
  discover: () => void;
};

export const DiscoveredServers = ({
  servers,
  connect,
  discoveryTimedOut,
  discover,
}: DiscoverServersProps) => {
  const t = useTranslation('app');
  const { setServerMode } = useNativeClient();
  const { error } = useNotification();

  const handleConnectionResult = async (result: ConnectionResult) => {
    if (result.success) return;

    error(t('error.unable-to-connect', { server: '' }))();
  };

  const useServerMode = () => {
    setServerMode(handleConnectionResult);
  };

  if (discoveryTimedOut)
    return (
      <Box
        display="flex"
        sx={{ color: 'error.main' }}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Box display="flex" gap={1}>
          <Box>
            <AlertIcon />
          </Box>
          <Box>
            <Typography sx={{ color: 'inherit' }} display="inline-flex">
              {t('error.server-not-found')}
            </Typography>
            <IconButton
              icon={<RefreshIcon color="primary" fontSize="small" />}
              onClick={discover}
              label={t('button.refresh')}
            />
          </Box>
        </Box>
        <Box
          paddingTop={4}
          alignItems="center"
          flexDirection="column"
          display="flex"
        >
          <Box>
            <Typography display="inline-flex">
              {t('discovery.use-server-mode')}
            </Typography>
          </Box>
          <Box padding={2}>
            <ButtonWithIcon
              Icon={<ExternalLinkIcon fontStyle="small" />}
              onClick={useServerMode}
              label={t('label.server')}
            />
          </Box>
        </Box>
      </Box>
    );

  if (servers.length === 0)
    return (
      <Box
        display="flex"
        flex={1}
        justifyContent="center"
        alignContent="center"
      >
        <InlineSpinner messageKey="searching" />
      </Box>
    );

  return (
    <Box sx={{ minWidth: '325px', color: 'gray.dark' }}>
      <Box display="flex" gap={1}>
        <Typography
          sx={{
            fontSize: {
              xs: '19px',
              sm: '19px',
              md: '24px',
              lg: '32px',
              xl: '32px',
            },
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          {t('discovery.select-server')}
        </Typography>
        <IconButton
          icon={<RefreshIcon color="primary" fontSize="small" />}
          onClick={discover}
          label={t('button.refresh')}
        />
      </Box>
      <MenuList style={{ overflowY: 'auto', maxHeight: '200px' }}>
        {servers.map(server => (
          <DiscoveredServerWrapper
            key={`${server.hardwareId}${server.port}`}
            server={{ ...server, path: 'login' }}
            connect={connect}
          />
        ))}
      </MenuList>
    </Box>
  );
};

type DiscoveredServerProps = { server: FrontEndHost; connect: ConnectToServer };

const DiscoveredServerWrapper: React.FC<DiscoveredServerProps> = params => (
  <GqlProvider url={frontEndHostDiscoveryGraphql(params.server)}>
    <DiscoveredServer {...params} />
  </GqlProvider>
);
const DiscoveredServer: React.FC<DiscoveredServerProps> = ({
  server,
  connect,
}) => {
  const { data: initStatus } = useInitialisationStatus();
  const t = useTranslation('app');
  const { error } = useNotification();

  const getSiteName = () => {
    if (initStatus?.status == InitialisationStatusType.Initialised)
      return initStatus?.siteName;
    return t('messages.not-initialised');
  };

  const handleConnectionResult = async (result: ConnectionResult) => {
    if (result.success) return;

    error(t('error.connection-error'))();
    console.error(result.error);
  };

  const { mutate: connectToServer } = useMutation(connect, {
    onSuccess: handleConnectionResult,
    onError: (e: Error) =>
      handleConnectionResult({ success: false, error: e.message }),
  });

  return (
    <MenuItem onClick={() => connectToServer(server)} sx={{ color: 'inherit' }}>
      <Box alignItems="center" display="flex" gap={2}>
        <Box flex={0}>
          <CheckboxEmptyIcon fontSize="small" color="primary" />
        </Box>
        <Box flexShrink={0} flexBasis="200px">
          <Typography
            sx={{
              color:
                initStatus?.status == InitialisationStatusType.Initialised
                  ? 'inherit'
                  : 'gray.light',
              fontSize: 20,
              fontWeight: 'bold',
              lineHeight: 1,
            }}
          >
            {getSiteName()}
          </Typography>
          <Typography sx={{ fontSize: 11 }}>
            {frontEndHostDisplay(server)}
          </Typography>
        </Box>
        {server.isLocal && <HomeIcon fontSize="small" color="primary" />}
      </Box>
    </MenuItem>
  );
};
