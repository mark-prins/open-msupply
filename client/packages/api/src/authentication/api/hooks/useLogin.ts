import { useQueryClient } from 'react-query';
import { DefinitionNode, DocumentNode, OperationDefinitionNode } from 'graphql';

import { useIntlUtils } from '@common/intl';
import {
  LanguageType,
  UserNode,
  
} from '@openmsupply-client/api';
import { AuthCookie, setAuthCookie } from '../../AuthContext';
import { useGetAuthToken } from './useGetAuthToken';
import {
  AuthenticationCredentials,
  LocalStorage,useGql,
  useLocalStorage,
} from '@openmsupply-client/common';
import { useAuthApi, useGetUserDetails, useGetUserPermissions } from '..';
import { UserStoreNodeFragment } from '../operations.generated';
import { AuthError } from '@common/types';

const authNameQueries = ['authToken', 'me'];
const isAuthRequest = (definitionNode: DefinitionNode) => {
  const operationNode = definitionNode as OperationDefinitionNode;
  if (!operationNode) return false;
  if (operationNode.operation !== 'query') return false;

  return authNameQueries.indexOf(operationNode.name?.value ?? '') !== -1;
};

const skipNoStoreRequests = (documentNode?: DocumentNode) => {
  if (!documentNode) return false;

  if (documentNode.definitions.some(isAuthRequest)) return false;

  switch (LocalStorage.getItem('/auth/error')) {
    case AuthError.NoStoreAssigned:
    case AuthError.Unauthenticated:
    case AuthError.Timeout:
    case AuthError.ServerError:
      return true;
    default:
      return false;
  }
};

// mostly this is as a migration fix - previous format is a single object, not an array
const getMostRecentCredentials = (
  mostRecentlyUsedCredentials:
    | AuthenticationCredentials
    | AuthenticationCredentials[]
    | null
) => {
  if (mostRecentlyUsedCredentials === null) return [];

  if (Array.isArray(mostRecentlyUsedCredentials))
    return mostRecentlyUsedCredentials;

  if (typeof mostRecentlyUsedCredentials === 'object')
    return [mostRecentlyUsedCredentials];

  return [];
};

export const useLogin = (
  setCookie: React.Dispatch<React.SetStateAction<AuthCookie | undefined>>
) => {
  const { mutateAsync, isLoading: isLoggingIn } = useGetAuthToken();
  const { changeLanguage, getLocaleCode, getUserLocale } = useIntlUtils();
  const { setHeader, setSkipRequest } = useGql();
  const { mutateAsync: getUserDetails } = useGetUserDetails();
  const queryClient = useQueryClient();
  const api = useAuthApi();
  const [mostRecentlyUsedCredentials, setMRUCredentials] =
    useLocalStorage('/mru/credentials');
  const getUserPermissions = useGetUserPermissions();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_error, setError, removeError] = useLocalStorage('/auth/error');
  const mostRecentCredentials = getMostRecentCredentials(
    mostRecentlyUsedCredentials
  );
  const upsertMostRecentCredential = (
    username: string,
    store?: UserStoreNodeFragment
  ) => {
    const newMRU = [
      { username, store },
      ...mostRecentCredentials.filter(
        mru => mru.username.toLowerCase() !== username.toLowerCase()
      ),
    ];
    setMRUCredentials(newMRU);
  };

  // returns MRU store, if set
  // or the first store in the list
  const getStore = async (userDetails?: Partial<UserNode>) => {
    const defaultStore = userDetails?.defaultStore;
    const stores = userDetails?.stores?.nodes;
    const mru = mostRecentCredentials?.find(
      item =>
        item.username.toLowerCase() === userDetails?.username?.toLowerCase()
    );

    if (mru?.store && stores?.some(store => store.id === mru?.store?.id)) {
      return stores.find(store => store.id === mru.store?.id) ?? mru.store;
    }

    if (!!defaultStore) return defaultStore;

    return !!stores && stores?.length > 0 ? stores?.[0] : undefined;
  };

  const setLoginError = (isLoggedIn: boolean, hasValidStore: boolean) => {
    if (LocalStorage.getItem('/auth/error') === AuthError.ServerError) return;

    switch (true) {
      case isLoggedIn && hasValidStore: {
        removeError();
        break;
      }
      case !isLoggedIn: {
        setError(AuthError.Unauthenticated);
        break;
      }
      case !hasValidStore: {
        setError(AuthError.NoStoreAssigned);
        break;
      }
    }
  };

  const login = async (username: string, password: string) => {
    const { token, error } = await mutateAsync({ username, password });
    setHeader('Authorization', `Bearer ${token}`);
    const userDetails = await getUserDetails(token);
    queryClient.setQueryData(api.keys.me(token), userDetails);
    const store = await getStore(userDetails);
    const permissions = await getUserPermissions(token, store);
    setSkipRequest(skipNoStoreRequests);

    const authCookie = {
      store,
      token,
      user: {
        id: '',
        name: username,
        permissions,
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName,
        phoneNumber: userDetails?.phoneNumber,
        jobTitle: userDetails?.jobTitle,
        email: userDetails?.email,
      },
    };

    const userLocale = getUserLocale(username);
    if (userLocale === undefined) {
      changeLanguage(getLocaleCode(userDetails?.language as LanguageType));
    }
    upsertMostRecentCredential(username, store);
    setAuthCookie(authCookie);
    setCookie(authCookie);
    setLoginError(!!token, !!store);
    setSkipRequest(
      () => LocalStorage.getItem('/auth/error') === AuthError.NoStoreAssigned
    );

    return { token, error };
  };

  return {
    isLoggingIn,
    login,
    upsertMostRecentCredential,
    mostRecentCredentials,
  };
};
