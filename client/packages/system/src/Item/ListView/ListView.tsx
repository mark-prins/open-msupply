import React, { FC } from 'react';
import {
  useNavigate,
  TableProvider,
  DataTable,
  useListData,
  useColumns,
  createTableStore,
  useOmSupplyApi,
} from '@openmsupply-client/common';
import { getItemListViewApi } from './api';
import { ItemRow } from '../types';

export const ListView: FC = () => {
  const { api } = useOmSupplyApi();
  const {
    totalCount,
    data,
    isLoading,
    onChangePage,
    pagination,
    sortBy,
    onChangeSortBy,
  } = useListData(
    { initialSortBy: { key: 'name' } },
    ['items', 'list'],
    getItemListViewApi(api)
  );
  const navigate = useNavigate();

  const columns = useColumns<ItemRow>(
    ['name', 'code'],
    {
      sortBy,
      onChangeSortBy,
    },
    [sortBy]
  );

  return (
    <TableProvider createStore={createTableStore}>
      <DataTable
        pagination={{ ...pagination, total: totalCount }}
        onChangePage={onChangePage}
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        onRowClick={row => {
          navigate(`/catalogue/items/${row.id}`);
        }}
      />
    </TableProvider>
  );
};
