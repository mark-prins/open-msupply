import { useQuery } from 'react-query';
import { useGql } from '../GqlContext';
import { getSdk } from '../operations.generated';

export const useInitialisationStatus = (
  refetchInterval: number | false = false
) => {
  const { client } = useGql();
  const sdk = getSdk(client);

  return useQuery(
    'initialisationStatus',
    async () => {
      const result = await sdk.initialisationStatus();
      return result?.initialisationStatus;
    },
    {
      cacheTime: 0,
      refetchInterval,
    }
  );
};
