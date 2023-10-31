import React, { useEffect, useState } from 'react';
import {
  Grid,
  BasicTextInput,
  ModalLabel,
  ModalRow,
  Select,
  useTranslation,
  InputLabel,
  NonNegativeIntegerInput,
  Divider,
  Box,
  Typography,
  useFormatNumber,
  useDebounceCallback,
} from '@openmsupply-client/common';
import {
  StockItemSearchInput,
  ItemRowFragment,
} from '@openmsupply-client/system';
import { usePrescription } from '../../api';
import { DraftItem } from '../../..';
import {
  PackSizeController,
  StockOutAlert,
  StockOutAlerts,
  getAllocationAlerts,
} from '../../../StockOut';
import { DraftStockOutLine } from '../../../types';
import { isA } from '../../../utils';

interface PrescriptionLineEditFormProps {
  allocatedQuantity: number;
  availableQuantity: number;
  item: DraftItem | null;
  onChangeItem: (newItem: ItemRowFragment | null) => void;
  onChangeQuantity: (
    quantity: number,
    packSize: number | null,
    isAutoAllocated: boolean
  ) => DraftStockOutLine[] | undefined;
  packSizeController: PackSizeController;
  disabled: boolean;
  canAutoAllocate: boolean;
  isAutoAllocated: boolean;
  updateNotes: (note: string) => void;
  draftPrescriptionLines: DraftStockOutLine[];
  showZeroQuantityConfirmation: boolean;
  hasOnHold: boolean;
  hasExpired: boolean;
}

export const PrescriptionLineEditForm: React.FC<
  PrescriptionLineEditFormProps
> = ({
  allocatedQuantity,
  onChangeItem,
  onChangeQuantity,
  item,
  packSizeController,
  availableQuantity,
  disabled,
  canAutoAllocate,
  updateNotes,
  draftPrescriptionLines,
  showZeroQuantityConfirmation,
  isAutoAllocated,
  hasOnHold,
  hasExpired,
}) => {
  const t = useTranslation('dispensary');
  const [allocationAlerts, setAllocationAlerts] = useState<StockOutAlert[]>([]);
  const [issueQuantity, setIssueQuantity] = useState(0);
  const { format } = useFormatNumber();
  const { items } = usePrescription.line.rows();

  const onChangePackSize = (newPackSize: number) => {
    const packSize = newPackSize === -1 ? 1 : newPackSize;
    const newAllocatedQuantity =
      newPackSize === 0 ? 0 : Math.round(allocatedQuantity / packSize);

    packSizeController.setPackSize(newPackSize);
    allocate(newAllocatedQuantity, newPackSize);
  };

  const unit = item?.unitName ?? t('label.unit');

  const updateIssueQuantity = (quantity: number) => {
    setIssueQuantity(
      Math.round(
        quantity / Math.abs(Number(packSizeController.selected?.value || 1))
      )
    );
  };

  const debouncedSetAllocationAlerts = useDebounceCallback(
    warning => setAllocationAlerts(warning),
    []
  );

  const allocate = (quantity: number, packSize: number) => {
    const newAllocateQuantities = onChangeQuantity(
      quantity,
      packSize === -1 ? null : packSize,
      true
    );
    const placeholderLine = newAllocateQuantities?.find(isA.placeholderLine);
    const allocatedQuantity =
      newAllocateQuantities?.reduce(
        (acc, { numberOfPacks, packSize }) => acc + numberOfPacks * packSize,
        0
      ) ?? 0;
    const allocateInUnits = packSize === null;
    const messageKey = allocateInUnits
      ? 'warning.cannot-create-placeholder-units'
      : 'warning.cannot-create-placeholder-packs';
    const hasRequestedOverAvailable =
      quantity > allocatedQuantity && newAllocateQuantities !== undefined;
    const alerts = getAllocationAlerts(
      quantity * (packSize === -1 ? 1 : packSize),
      // suppress the allocation warning if the user has requested more than the available amount of stock
      hasRequestedOverAvailable ? 0 : allocatedQuantity,
      placeholderLine?.numberOfPacks ?? 0,
      hasOnHold,
      hasExpired,
      format,
      t
    );
    if (hasRequestedOverAvailable) {
      alerts.push({
        message: t(messageKey, {
          allocatedQuantity: format(allocatedQuantity),
          requestedQuantity: format(quantity),
        }),
        severity: 'warning',
      });
    }
    debouncedSetAllocationAlerts(alerts);
    updateIssueQuantity(allocatedQuantity);
  };

  const handleIssueQuantityChange = (quantity: number) => {
    setIssueQuantity(quantity);
    allocate(quantity, Number(packSizeController.selected?.value));
  };

  const prescriptionLineWithNote = draftPrescriptionLines.find(l => !!l.note);
  const note = prescriptionLineWithNote?.note ?? '';

  useEffect(() => {
    if (!isAutoAllocated) updateIssueQuantity(allocatedQuantity);
  }, [packSizeController.selected?.value, allocatedQuantity]);

  return (
    <Grid container gap="4px">
      <ModalRow>
        <ModalLabel label={t('label.item', { count: 1 })} />
        <Grid item flex={1}>
          <StockItemSearchInput
            autoFocus={!item}
            openOnFocus={!item}
            disabled={disabled}
            currentItemId={item?.id}
            onChange={onChangeItem}
            extraFilter={
              disabled
                ? undefined
                : item => !items?.some(({ id }) => id === item.id)
            }
          />
        </Grid>
      </ModalRow>
      {item && (
        <>
          <ModalRow>
            <ModalLabel label="" />
            <Grid item display="flex">
              <Typography
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {t('label.available-quantity', {
                  number: availableQuantity.toFixed(0),
                })}
              </Typography>
            </Grid>

            <Grid
              style={{ display: 'flex' }}
              justifyContent="flex-end"
              flex={1}
            >
              <ModalLabel label={t('label.unit')} justifyContent="flex-end" />
              <BasicTextInput
                disabled
                sx={{ width: 150 }}
                value={item?.unitName ?? ''}
              />
            </Grid>
          </ModalRow>
        </>
      )}
      {item && canAutoAllocate ? (
        <>
          <ModalRow>
            <ModalLabel label={t('label.directions')} />
            <BasicTextInput
              value={note}
              onChange={e => {
                updateNotes(e.target.value);
              }}
              InputProps={{
                sx: {
                  backgroundColor: theme => theme.palette.background.menu,
                },
              }}
              fullWidth
              style={{ flex: 1 }}
            />
          </ModalRow>
          <Divider margin={10} />
          <StockOutAlerts
            allocationAlerts={allocationAlerts}
            showZeroQuantityConfirmation={showZeroQuantityConfirmation}
            isAutoAllocated={isAutoAllocated}
          />
          <Grid container>
            <ModalLabel label={t('label.issue')} />
            <NonNegativeIntegerInput
              autoFocus
              value={issueQuantity}
              onChange={handleIssueQuantityChange}
              defaultValue={0}
            />

            <Box marginLeft={1} />

            {packSizeController.options.length ? (
              <>
                <Grid
                  item
                  alignItems="center"
                  display="flex"
                  justifyContent="flex-start"
                  style={{ minWidth: 125 }}
                >
                  <InputLabel sx={{ fontSize: '12px' }}>
                    {packSizeController.selected?.value === -1
                      ? `${t('label.unit-plural', {
                          unit,
                          count: issueQuantity,
                        })} ${t('label.in-packs-of')}`
                      : t('label.in-packs-of')}
                  </InputLabel>
                </Grid>

                <Box marginLeft={1} />

                <Select
                  sx={{ width: 110 }}
                  options={packSizeController.options}
                  value={packSizeController.selected?.value ?? ''}
                  onChange={e => {
                    const { value } = e.target;
                    onChangePackSize(Number(value));
                  }}
                />
                {packSizeController.selected?.value !== -1 && (
                  <Grid
                    item
                    alignItems="center"
                    display="flex"
                    justifyContent="flex-start"
                  >
                    <InputLabel style={{ fontSize: 12, marginLeft: 8 }}>
                      {t('label.unit-plural', {
                        count: packSizeController.selected?.value,
                        unit,
                      })}
                    </InputLabel>
                  </Grid>
                )}
                <Box marginLeft="auto" />
              </>
            ) : null}
          </Grid>
        </>
      ) : (
        <Box height={100} />
      )}
    </Grid>
  );
};