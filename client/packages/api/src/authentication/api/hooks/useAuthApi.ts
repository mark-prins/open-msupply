import { useTranslation } from '@common/intl';
import { useGql } from '@openmsupply-client/common';
import { getAuthQueries } from '../api';
import { getSdk } from '../operations.generated';

export const useAuthApi = () => {
  const { client } = useGql();
  const t = useTranslation('app');
  const queries = getAuthQueries(getSdk(client), t);

  const keys = {
    me: (token: string) => ['me', token] as const,
    refresh: (token: string) => ['refresh', token] as const,
  };

  return { ...queries, keys };
};
