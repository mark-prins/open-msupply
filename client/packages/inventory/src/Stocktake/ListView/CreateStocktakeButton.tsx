import React from 'react';
import { ButtonWithIcon } from '@common/components';
import { PlusCircleIcon } from '@common/icons';
import { useFormatDateTime, useTranslation } from '@common/intl';
import { ToggleState } from '@common/hooks';
import { useStocktake } from '../api';
import {
  ItemWithStockLines,
  StockItemSelectModal,
} from '@openmsupply-client/system';
import { useAuthContext } from '@openmsupply-client/common';

export const CreateStocktakeButton: React.FC<{
  modalController: ToggleState;
}> = ({ modalController }) => {
  const t = useTranslation(['distribution', 'common']);
  const { mutateAsync } = useStocktake.document.insert();
  const { user } = useAuthContext();
  const { localisedDate } = useFormatDateTime();

  const onChange = async (items?: ItemWithStockLines[]) => {
    const description = t('stocktake.description-template', {
      username: user ? user.name : 'unknown user',
      date: localisedDate(new Date()),
    });

    await mutateAsync({ description, items });
  };

  return (
    <>
      {modalController.isOn && (
        <StockItemSelectModal
          isOpen={modalController.isOn}
          onChange={onChange}
          onClose={modalController.toggleOff}
          disableBackdrop={true}
        />
      )}
      <ButtonWithIcon
        Icon={<PlusCircleIcon />}
        label={t('label.new-stocktake')}
        onClick={modalController.toggleOn}
      />
    </>
  );
};
