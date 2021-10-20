import { ObjectWithStringKeys } from './../../types/utility';
import { SortBy } from './../useSortBy/useSortBy';
import { UseMutateAsyncFunction } from 'react-query';
import { useQueryClient, useMutation, useQuery } from 'react-query';
import { QueryParams, useQueryParams } from '../useQueryParams';
import { SortRule } from '../useSortBy';
import { ClientError } from 'graphql-request';
import { useNotification } from '../../hooks';

export interface ListApi<T extends ObjectWithStringKeys> {
  onQuery: ({
    first,
    offset,
    sortBy,
  }: {
    first: number;
    offset: number;
    sortBy: SortBy<T>;
  }) => () => Promise<{ data: T[]; totalLength: number }>;
  onDelete: (toDelete: T[]) => Promise<void>;
  onUpdate: (toUpdate: T) => Promise<T>;
  onCreate: (toCreate: Partial<T>) => Promise<T>;
}

interface ListDataState<T extends ObjectWithStringKeys> extends QueryParams<T> {
  data?: T[];
  totalLength?: number;
  invalidate: () => void;
  fullQueryKey: readonly unknown[];
  queryParams: QueryParams<T>;
  onUpdate: UseMutateAsyncFunction<T, unknown, T, unknown>;
  onDelete: UseMutateAsyncFunction<void, unknown, T[], unknown>;
  onCreate: UseMutateAsyncFunction<T, unknown, Partial<T>, unknown>;
  isCreateLoading: boolean;
  isQueryLoading: boolean;
  isUpdateLoading: boolean;
  isDeleteLoading: boolean;
  isLoading: boolean;
  numberOfRows: number;
}

export const useListData = <T extends ObjectWithStringKeys>(
  initialSortBy: SortRule<T>,
  queryKey: string | readonly unknown[],
  api: ListApi<T>,
  onError?: (e: ClientError) => void
): ListDataState<T> => {
  const queryClient = useQueryClient();
  const { queryParams, first, offset, sortBy, numberOfRows } =
    useQueryParams(initialSortBy);
  const fullQueryKey = [queryKey, 'list', queryParams];
  const { error } = useNotification();
  const defaultErrorHandler = (e: ClientError) =>
    error(e.message?.substring(0, 150))();

  const { data, isLoading: isQueryLoading } = useQuery(
    fullQueryKey,
    api.onQuery({ first, offset, sortBy }),
    {
      onError: onError || defaultErrorHandler,
      useErrorBoundary: (error: ClientError): boolean =>
        error.response?.status >= 500,
    }
  );

  const invalidate = () => queryClient.invalidateQueries(queryKey);

  // TODO: Handler errors for mutations.
  const { mutateAsync: onDelete, isLoading: isDeleteLoading } = useMutation(
    api.onDelete,
    { onSuccess: invalidate }
  );

  const { mutateAsync: onUpdate, isLoading: isUpdateLoading } = useMutation(
    api.onUpdate,
    { onSuccess: invalidate }
  );

  const { mutateAsync: onCreate, isLoading: isCreateLoading } = useMutation(
    api.onCreate,
    { onSuccess: invalidate }
  );

  return {
    ...(data ?? {}),
    ...queryParams,
    onCreate,
    invalidate,
    isCreateLoading,
    numberOfRows,
    fullQueryKey,
    queryParams,
    onUpdate,
    onDelete,
    isUpdateLoading,
    isDeleteLoading,
    isQueryLoading,
    isLoading: isUpdateLoading || isDeleteLoading || isQueryLoading,
  };
};