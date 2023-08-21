import { SupportedLocales } from '@common/intl';
import { ThemeOptions } from '@mui/material';
import { AuthError } from '../types';

export type GroupByItem = {
  outboundShipment?: boolean;
  inboundShipment?: boolean;
  stocktake?: boolean;
};
export type AuthenticationCredentials = {
  store?: UserStoreNodeFragment;
  username: string;
};

enum StoreModeNodeType {
  Dispensary = 'DISPENSARY',
  Store = 'STORE'
}

export type UserStoreNodeFragment = { __typename: 'UserStoreNode', code: string, id: string, name: string, storeMode: StoreModeNodeType, preferences: any };

export type LocalStorageRecord = {
  '/appdrawer/open': boolean;
  '/detailpanel/open': boolean;
  '/localisation/locale': Record<string, SupportedLocales>;
  '/groupbyitem': GroupByItem;
  '/theme/custom': ThemeOptions;
  '/theme/customhash': string;
  '/theme/logo': string;
  '/theme/logohash': string;
  '/mru/credentials': AuthenticationCredentials | AuthenticationCredentials[];
  '/auth/error': AuthError | undefined;
  '/pagination/rowsperpage': number;
  '/columns/hidden': Record<string, string[]> | undefined;
};

export type LocalStorageKey = keyof LocalStorageRecord;
