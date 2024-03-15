import { getAssetQueries, ListParams } from '../../api';
import { SortBy, useGql } from '@openmsupply-client/common';
import { getSdk, AssetCatalogueItemFragment } from '../../operations.generated';

export const useAssetApi = () => {
  const { client } = useGql();

  const keys = {
    base: () => ['asset'] as const,
    detail: (id: string) => [...keys.base(), id] as const,
    list: () => [...keys.base(), 'list'] as const,
    paramList: (params: ListParams<AssetCatalogueItemFragment>) =>
      [...keys.list(), params] as const,
    sortedList: (sortBy: SortBy<AssetCatalogueItemFragment>) =>
      [...keys.list(), sortBy] as const,
    categories: () => [...keys.base(), 'categories'] as const,
    classes: () => [...keys.base(), 'classes'] as const,
    types: () => [...keys.base(), 'types'] as const,
  };

  const queries = getAssetQueries(getSdk(client));
  return { ...queries, keys };
};