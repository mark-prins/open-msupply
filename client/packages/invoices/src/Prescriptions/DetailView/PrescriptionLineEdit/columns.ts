import {
  CheckCell,
  Column,
  ColumnAlign,
  ExpiryDateCell,
  LocationCell,
  NumberCell,
  useColumns,
} from '@openmsupply-client/common';
import { DraftStockOutLine } from '../../../types';
import { PackQuantityCell, StockOutLineFragment } from '../../../StockOut';
import { getPackVariantCell } from '@openmsupply-client/system';

export const usePrescriptionLineEditColumns = ({
  onChange,
  unit,
}: {
  onChange: (key: string, value: number, packSize: number) => void;
  unit: string;
}) => {
  const columns = useColumns<DraftStockOutLine>(
    [
      [
        'batch',
        {
          accessor: ({ rowData }) => rowData.stockLine?.batch,
        },
      ],
      [
        'expiryDate',
        {
          Cell: ExpiryDateCell,
          width: 80,
        },
      ],
      [
        'location',
        {
          accessor: ({ rowData }) => rowData.location?.code,
          width: 70,
          Cell: LocationCell,
        },
      ],
      {
        label: 'label.on-hold',
        key: 'onHold',
        Cell: CheckCell,
        accessor: ({ rowData }) => rowData.stockLine?.onHold,
        align: ColumnAlign.Center,
        width: 80,
      },
      {
        Cell: NumberCell,
        label: 'label.in-store',
        key: 'totalNumberOfPacks',
        align: ColumnAlign.Right,
        width: 80,
        accessor: ({ rowData }) => rowData.stockLine?.totalNumberOfPacks,
      },
      {
        Cell: NumberCell,
        label: 'label.available-packs',
        key: 'availableNumberOfPacks',
        align: ColumnAlign.Right,
        width: 85,
        accessor: ({ rowData }) => rowData.stockLine?.availableNumberOfPacks,
      },
      {
        key: 'packUnit',
        label: 'label.pack',
        sortable: false,
        Cell: getPackVariantCell({
          getItemId: row => row?.item?.id,
          getPackSizes: row => [row.packSize ?? 1],
          getUnitName: row => row?.item.unitName ?? null,
        }),
        width: 130,
      },
      [
        'unitQuantity',
        {
          label: 'label.unit-quantity-issued',
          labelProps: { unit },
          accessor: ({ rowData }) => rowData.numberOfPacks * rowData.packSize,
          width: 120,
        },
      ],
      [
        'numberOfPacks',
        {
          Cell: PackQuantityCell,
          width: 120,
          label: 'label.pack-quantity-issued',
          setter: ({ packSize, id, numberOfPacks }) =>
            onChange(id, numberOfPacks ?? 0, packSize ?? 1),
        },
      ],
    ],
    {},
    [onChange]
  );

  return columns;
};

export const useExpansionColumns = (): Column<StockOutLineFragment>[] =>
  useColumns([
    'batch',
    'expiryDate',
    [
      'location',
      {
        accessor: ({ rowData }) => rowData.location?.code,
      },
    ],
    [
      'itemUnit',
      {
        accessor: ({ rowData }) => rowData.item?.unitName,
      },
    ],
    'numberOfPacks',
    'packSize',
    [
      'unitQuantity',
      {
        accessor: ({ rowData }) => rowData.packSize * rowData.numberOfPacks,
      },
    ],
  ]);
